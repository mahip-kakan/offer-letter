import { describe, expect, it } from "vitest";

import { formatInr, formatInrSalary, formatLpa } from "./india";

describe("Indian money formats", () => {
  it("group rupees in lakhs and crores", () => {
    expect(formatInr(1_850_000)).toBe("₹18,50,000");
    expect(formatInr(12_500_000)).toBe("₹1,25,00,000");
  });

  it("write yearly pay in LPA, as postings quote it", () => {
    expect(formatLpa(1_800_000, 2_400_000)).toBe("₹18–24 LPA");
    expect(formatLpa(1_850_000, null)).toBe("₹18.5 LPA");
    expect(formatLpa(2_400_000, 1_800_000)).toBe("₹18–24 LPA");
    expect(formatLpa(null, null)).toBe("");
  });

  it("keep other periods in rupees", () => {
    expect(formatInrSalary(50_000, 60_000, "MONTH")).toBe("₹50,000–60,000 a month");
    expect(formatInrSalary(1_200_000, 1_200_000, "YEAR")).toBe("₹12 LPA");
    expect(formatInrSalary(1_200_000, null, null)).toBe("₹12 LPA");
  });
});
