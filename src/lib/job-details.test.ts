import { describe, expect, it } from "vitest";

import {
  EMPTY_JOB_DETAILS,
  fieldsFromJobDetails,
  filledJobDetails,
  jobDetailLines,
  jobDetailsForPrompt,
  jobDetailsFromFields,
  totalExperience,
} from "./job-details";

const basics = { city: "Bengaluru", country: "India" } as Parameters<typeof jobDetailLines>[1]["basics"];
const role = { startYear: 2020, startMonth: 1, endYear: null, endMonth: null, current: true };
const profile = { basics, experience: [{ ...role, id: "r1", role: "PM", company: "Acme", location: "", bullets: "", skillIds: [] }] };

describe("job details", () => {
  it("round-trip through ProfileField rows under job. keys, dropping empty ones", () => {
    const details = { ...EMPTY_JOB_DETAILS, currentCtc: " 18 LPA ", noticePeriod: "30 days", openToRelocate: true };
    const fields = fieldsFromJobDetails(details);
    expect(fields["job.currentCtc"]).toBe("18 LPA");
    expect(fields["job.expectedCtc"]).toBeNull();
    expect(fields["job.openToRelocate"]).toBe("true");
    const rows = Object.entries(fields).flatMap(([key, value]) => (value === null ? [] : [{ key, value }]));
    expect(jobDetailsFromFields([...rows, { key: "name", value: "Jane" }])).toEqual({ ...details, currentCtc: "18 LPA" });
  });

  it("count the four details a recruiter asks first", () => {
    expect(filledJobDetails(EMPTY_JOB_DETAILS)).toBe(0);
    expect(filledJobDetails({ ...EMPTY_JOB_DETAILS, currentCtc: "18 LPA", preferredLocations: "Pune" })).toBe(2);
  });

  it("write total experience in years and months", () => {
    expect(totalExperience(76)).toBe("6 years 4 months");
    expect(totalExperience(12)).toBe("1 year");
    expect(totalExperience(8)).toBe("8 months");
    expect(totalExperience(0)).toBe("");
  });

  it("give the AI the lines a recruiter asks for", () => {
    const details = {
      ...EMPTY_JOB_DETAILS,
      currentCtc: "18 LPA",
      expectedCtc: "24 LPA",
      noticePeriod: "Serving notice",
      lastWorkingDay: "2026-11-28",
      noticeNegotiable: true,
      preferredLocations: "Bengaluru, Remote",
      openToRelocate: true,
    };
    const lines = jobDetailLines(details, profile, new Date("2026-05-15T00:00:00Z"));
    expect(lines).toEqual([
      "Total experience: 6 years 5 months",
      "Current location: Bengaluru, India",
      "Current CTC: 18 LPA",
      "Expected CTC: 24 LPA",
      "Notice period: Serving notice, last working day 28 Nov 2026 (can be bought out or shortened)",
      "Preferred locations: Bengaluru, Remote; Open to relocating",
    ]);
    expect(jobDetailsForPrompt(lines)).toContain("- Current CTC: 18 LPA");
    expect(jobDetailsForPrompt([])).toBeNull();
  });
});
