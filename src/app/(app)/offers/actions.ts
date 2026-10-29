"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { action, ActionError } from "@/lib/action";
import { prisma } from "@/lib/prisma";

const money = z.number().int().min(0).max(500_000_000);
const MAX_OFFERS = 3;

const offerSchema = z.object({
  id: z.string().min(1).optional(),
  company: z.string().max(200),
  role: z.string().max(200),
  basicMonthly: money,
  fixedGrossMonthly: money,
  variableAnnual: money,
  joiningBonus: money,
  esopAnnual: money,
  employeePfMonthly: money,
  employerPfMonthly: money,
  gratuityMonthly: money,
  professionalTaxMonthly: money,
});

/** Creates or updates one offer. Three is the most kept side by side. */
export const saveOffer = action(offerSchema, async ({ id, ...data }) => {
  if (id) {
    const offer = await prisma.offer.update({ where: { id }, data });
    revalidatePath("/offers");
    return offer.id;
  }
  const count = await prisma.offer.count();
  if (count >= MAX_OFFERS) throw new ActionError("Three offers are enough to compare. Remove one first.");
  const offer = await prisma.offer.create({ data: { ...data, sort: count } });
  revalidatePath("/offers");
  return offer.id;
});

/** Removes an offer from the comparison. */
export const deleteOffer = action(z.object({ id: z.string().min(1) }), async ({ id }) => {
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/offers");
  return null;
});
