import { experienceMonths, type ProfileData } from "@/lib/profile";

// What recruiters in India ask in their first message, before anything else:
// total experience, current and expected CTC, notice period and where you'll
// work. Kept in the ProfileField table under "job." keys, apart from the
// Basics: they never go on a resume or a cover letter, only into emails.

export const NOTICE_PERIODS = [
  { value: "", label: "Not set" },
  { value: "Immediate joiner", label: "Immediate joiner" },
  { value: "15 days", label: "15 days" },
  { value: "30 days", label: "30 days" },
  { value: "45 days", label: "45 days" },
  { value: "60 days", label: "60 days" },
  { value: "90 days", label: "90 days" },
  { value: "Serving notice", label: "Serving notice" },
] as const;

export type JobDetails = {
  /** As written, e.g. "18 LPA (16 fixed + 2 variable)". */
  currentCtc: string;
  expectedCtc: string;
  /** One of NOTICE_PERIODS' values. */
  noticePeriod: string;
  /** "YYYY-MM-DD", while serving notice. */
  lastWorkingDay: string;
  /** The notice can be bought out or shortened. */
  noticeNegotiable: boolean;
  /** "Bengaluru, Hyderabad, Remote". */
  preferredLocations: string;
  openToRelocate: boolean;
  /** Add a line with these to application emails, as Indian recruiters expect. */
  inApplicationEmails: boolean;
  /** What it would cost to leave before the notice ends, as written. */
  buyoutAmount: string;
  relievingLetter: boolean;
  experienceLetter: boolean;
};

const TEXT_KEYS = ["currentCtc", "expectedCtc", "noticePeriod", "lastWorkingDay", "preferredLocations", "buyoutAmount"] as const;
const FLAG_KEYS = ["noticeNegotiable", "openToRelocate", "inApplicationEmails", "relievingLetter", "experienceLetter"] as const;

/** The ProfileField key for a detail: "job.currentCtc". */
export const jobDetailKey = (field: keyof JobDetails) => `job.${field}`;

export const EMPTY_JOB_DETAILS: JobDetails = {
  currentCtc: "",
  expectedCtc: "",
  noticePeriod: "",
  lastWorkingDay: "",
  noticeNegotiable: false,
  preferredLocations: "",
  openToRelocate: false,
  inApplicationEmails: false,
  buyoutAmount: "",
  relievingLetter: false,
  experienceLetter: false,
};

/** The details from ProfileField rows; other keys are ignored. */
export function jobDetailsFromFields(rows: readonly { key: string; value: string }[]): JobDetails {
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const details = { ...EMPTY_JOB_DETAILS };
  for (const key of TEXT_KEYS) details[key] = values.get(jobDetailKey(key)) ?? "";
  for (const key of FLAG_KEYS) details[key] = values.get(jobDetailKey(key)) === "true";
  return details;
}

/** The value to store for each key, or null for an empty one, whose row is removed. */
export function fieldsFromJobDetails(details: JobDetails): Record<string, string | null> {
  return Object.fromEntries([
    ...TEXT_KEYS.map((key) => [jobDetailKey(key), details[key].trim() || null]),
    ...FLAG_KEYS.map((key) => [jobDetailKey(key), details[key] ? "true" : null]),
  ]);
}

/** How many of the details a recruiter asks first are filled in, of 4. */
export function filledJobDetails(details: JobDetails): number {
  return [details.currentCtc, details.expectedCtc, details.noticePeriod, details.preferredLocations].filter((value) => value.trim()).length;
}

/** "6 years 4 months", "8 months"; "" without any experience. */
export function totalExperience(months: number): string {
  if (months <= 0) return "";
  const [years, rest] = [Math.floor(months / 12), months % 12];
  const part = (count: number, word: string) => (count > 0 ? `${count} ${word}${count === 1 ? "" : "s"}` : "");
  return [part(years, "year"), part(rest, "month")].filter(Boolean).join(" ");
}

/** "Serving notice, last working day 28 Nov 2026 (can be bought out)". */
function noticeText(details: JobDetails): string {
  const notice = details.noticePeriod.trim();
  if (!notice) return "";
  const lastDay = /^\d{4}-\d{2}-\d{2}$/.test(details.lastWorkingDay)
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${details.lastWorkingDay}T00:00:00Z`))
    : "";
  return [
    notice,
    notice === "Serving notice" && lastDay ? `, last working day ${lastDay}` : "",
    details.noticeNegotiable && notice !== "Immediate joiner" ? " (can be bought out or shortened)" : "",
  ].join("");
}

/**
 * The details as lines for the AI and the fact guard, e.g.
 * "Total experience: 6 years 4 months"; empty when nothing is filled in.
 */
export function jobDetailLines(details: JobDetails, profile: Pick<ProfileData, "experience" | "basics">, today = new Date()): string[] {
  const location = [profile.basics.city, profile.basics.country].filter(Boolean).join(", ");
  const relocate = details.openToRelocate ? "Open to relocating" : "";
  return [
    ["Total experience", totalExperience(experienceMonths(profile, today))],
    ["Current location", location],
    ["Current CTC", details.currentCtc.trim()],
    ["Expected CTC", details.expectedCtc.trim()],
    ["Notice period", noticeText(details)],
    ["Preferred locations", [details.preferredLocations.trim(), relocate].filter(Boolean).join("; ")],
  ].flatMap(([label, value]) => (value ? [`${label}: ${value}`] : []));
}

/** The details for a prompt; null when there's nothing a recruiter would ask about. */
export function jobDetailsForPrompt(lines: string[]): string | null {
  return lines.length > 0 ? `The candidate's job details, which recruiters in India ask for:\n${lines.map((line) => `- ${line}`).join("\n")}` : null;
}
