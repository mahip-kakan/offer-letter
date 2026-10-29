"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ReferralStatus } from "@/generated/prisma/enums";
import { action, ActionError } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { REFERRAL_STATUSES } from "@/lib/referral";

const text = (max: number) => z.string().max(max);

/** Saves who was asked to refer this application, and the joining date. */
export const saveHiring = action(
  z.object({
    applicationId: z.string().min(1),
    joiningDate: z.union([z.literal(""), z.iso.date()]),
    name: text(200),
    contact: text(300),
    relation: text(200),
    status: z.string().refine((value) => REFERRAL_STATUSES.some((option) => option.value === value)),
    message: text(4000),
  }),
  async ({ applicationId, joiningDate, status, ...referral }) => {
    const application = await prisma.application.findUnique({ where: { id: applicationId }, select: { id: true, referral: { select: { askedAt: true, status: true } } } });
    if (!application) throw new ActionError("That application no longer exists.");
    const askedBefore = application.referral?.status === "ASKED" || application.referral?.status === "NO_REPLY" || application.referral?.status === "REFERRED";
    const asking = status === "ASKED" || status === "NO_REPLY" || status === "REFERRED";
    await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: { joiningDate: joiningDate ? new Date(`${joiningDate}T00:00:00.000Z`) : null },
      }),
      prisma.referral.upsert({
        where: { applicationId },
        create: {
          applicationId,
          ...referral,
          status: status as ReferralStatus,
          askedAt: asking ? new Date() : null,
        },
        update: {
          ...referral,
          status: status as ReferralStatus,
          askedAt: asking ? (askedBefore ? undefined : new Date()) : null,
        },
      }),
    ]);
    revalidatePath("/");
    revalidatePath(`/applications/${applicationId}`);
    return null;
  },
);
