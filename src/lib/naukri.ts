import { experienceMonths, type ProfileData } from "@/lib/profile";

type NaukriProfile = {
  basics: { headline: string; summary: string };
  skills: { name: string }[];
  experience: ProfileData["experience"];
};

/** Naukri's resume headline stops at 250 characters. */
export const NAUKRI_HEADLINE_LIMIT = 250;
const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

/** "Product Manager | 6+ years | SQL, Figma", cut to the headline limit. */
export function naukriHeadline(profile: NaukriProfile, today = new Date()): string {
  const years = Math.floor(experienceMonths(profile, today) / 12);
  const skills = profile.skills.map((skill) => skill.name.trim()).filter(Boolean);
  const head = [profile.basics.headline.trim(), years > 0 ? `${years}+ years` : ""].filter(Boolean).join(" | ");
  let text = head;
  for (const skill of skills) {
    const next = text ? `${text} | ${skill}` : skill;
    if (next.length > NAUKRI_HEADLINE_LIMIT) break;
    text = next;
  }
  return text.slice(0, NAUKRI_HEADLINE_LIMIT);
}

/** The profile summary, as the Naukri summary. */
export function naukriSummary(profile: Pick<NaukriProfile, "basics">): string {
  return profile.basics.summary.trim().slice(0, 1000);
}

/** Key skills, one a line, ready to paste. */
export function naukriSkills(profile: Pick<NaukriProfile, "skills">): string {
  return profile.skills.map((skill) => skill.name.trim()).filter(Boolean).slice(0, 20).join("\n");
}

/** No refresh on record, or the last one was a week ago or more. */
export function naukriRefreshDue(refreshedAt: string | null, now: Date): boolean {
  if (!refreshedAt) return true;
  const then = new Date(refreshedAt);
  if (Number.isNaN(then.getTime())) return true;
  return now.getTime() - then.getTime() >= REFRESH_AFTER_MS;
}
