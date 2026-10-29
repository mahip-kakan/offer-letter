import Link from "next/link";

import { naukriRefreshDue } from "@/lib/naukri";
import { prisma } from "@/lib/prisma";

const card = "rounded-panel border border-line-card bg-card px-5 py-4 text-sm";

const daysUntil = (date: Date, now: Date) =>
  Math.round((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) / 86_400_000);

/** Naukri refresh, referral nudges, and joining countdowns. Quiet when there's nothing to do. */
export async function IndiaNotices() {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86_400_000);
  const [referrals, joining, refreshed] = await Promise.all([
    prisma.referral.findMany({
      where: { status: { in: ["ASKED", "NO_REPLY"] }, askedAt: { lte: fiveDaysAgo } },
      include: { application: { select: { id: true, company: true, role: true, title: true } } },
      orderBy: { askedAt: "asc" },
      take: 5,
    }),
    prisma.application.findMany({
      where: {
        joiningDate: { not: null, gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) },
        status: { in: ["OFFER", "NEGOTIATION", "BGV", "ACCEPTED"] },
        archivedAt: null,
      },
      select: { id: true, company: true, role: true, title: true, joiningDate: true },
      orderBy: { joiningDate: "asc" },
      take: 5,
    }),
    prisma.profileField.findUnique({ where: { key: "naukri.refreshedAt" } }),
  ]);
  const naukriDue = naukriRefreshDue(refreshed?.value ?? null, now);
  if (!naukriDue && referrals.length === 0 && joining.length === 0) return null;

  return (
    <div className="mx-10 mb-2 flex max-w-[1200px] flex-col gap-2">
      {naukriDue && (
        <Link href="/profile?section=naukri" className={`${card} block hover:bg-hover`}>
          Refresh your Naukri profile. Recruiter search ranks a profile that was updated in the last week.
        </Link>
      )}
      {joining.map((application) => {
        const days = application.joiningDate ? daysUntil(application.joiningDate, now) : 0;
        const where = application.company || application.role || application.title || "your new role";
        return (
          <Link key={application.id} href={`/applications/${application.id}?tab=hiring`} className={`${card} block hover:bg-hover`}>
            Joining {where} {days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}.
          </Link>
        );
      })}
      {referrals.map((referral) => {
        const where = referral.application.company || referral.application.role || referral.application.title || "that application";
        return (
          <Link key={referral.id} href={`/applications/${referral.application.id}?tab=hiring`} className={`${card} block hover:bg-hover`}>
            Nudge {referral.name || "your referral"} about {where}. You asked more than five days ago.
          </Link>
        );
      })}
    </div>
  );
}
