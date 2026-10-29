import { describe, expect, it } from "vitest";

import { naukriHeadline, naukriRefreshDue, NAUKRI_HEADLINE_LIMIT } from "./naukri";

const basics = { headline: "Product Manager", summary: "I plan retail." };
const role = { id: "r", role: "PM", company: "Acme", location: "", bullets: "", skillIds: [], startYear: 2020, startMonth: 1, endYear: null, endMonth: null, current: true };

describe("Naukri text", () => {
  it("builds a headline from the role, the years and the skills, within 250 characters", () => {
    const skills = Array.from({ length: 30 }, (_, index) => ({ id: String(index), name: `Skill number ${index} with a long name` }));
    const headline = naukriHeadline({ basics, skills, experience: [role] }, new Date("2026-10-29T00:00:00Z"));
    expect(headline.startsWith("Product Manager | 6+ years | ")).toBe(true);
    expect(headline.length).toBeLessThanOrEqual(NAUKRI_HEADLINE_LIMIT);
  });

  it("asks for a refresh a week after the last one", () => {
    expect(naukriRefreshDue(null, new Date())).toBe(true);
    expect(naukriRefreshDue("2026-10-28", new Date("2026-10-29T00:00:00Z"))).toBe(false);
    expect(naukriRefreshDue("2026-10-20", new Date("2026-10-28T00:00:00Z"))).toBe(true);
    expect(naukriRefreshDue("not a date", new Date())).toBe(true);
  });
});
