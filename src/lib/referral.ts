export const REFERRAL_STATUSES = [
  { value: "NOT_ASKED", label: "Not asked" },
  { value: "ASKED", label: "Asked" },
  { value: "REFERRED", label: "Referred" },
  { value: "NO_REPLY", label: "No reply" },
] as const;

export type ReferralStatusName = (typeof REFERRAL_STATUSES)[number]["value"];

const NUDGE_AFTER_MS = 5 * 24 * 60 * 60 * 1000;

/** A short ask, ready to copy into LinkedIn or mail. */
export function referralMessage({
  referrer,
  name,
  company,
  role,
}: {
  referrer: string;
  name: string;
  company: string;
  role: string;
}): string {
  const where = [role.trim() || "a role", company.trim() && `at ${company.trim()}`].filter(Boolean).join(" ");
  return [`Hi ${referrer.trim() || "there"},`, "", `I'm applying for ${where}. If you're comfortable referring me, I can send a short blurb and my resume.`, "", "Thank you,", name.trim()].join("\n");
}

/** Asked or unanswered, and the ask went out at least five days ago. */
export function referralNudgeDue(referral: { status: string; askedAt: Date | null }, now: Date): boolean {
  if (referral.status !== "ASKED" && referral.status !== "NO_REPLY") return false;
  if (!referral.askedAt) return false;
  return now.getTime() - referral.askedAt.getTime() >= NUDGE_AFTER_MS;
}
