import { describe, expect, it } from "vitest";

import { referralMessage, referralNudgeDue } from "./referral";

describe("referrals", () => {
  it("drafts an ask that names the role and the company", () => {
    const message = referralMessage({ referrer: "Priya", name: "Mahip", company: "Acme", role: "Product Manager" });
    expect(message).toContain("Hi Priya,");
    expect(message).toContain("Product Manager at Acme");
    expect(message).toContain("Thank you,\nMahip");
  });

  it("nudges five days after an ask that hasn't become a referral", () => {
    const askedAt = new Date("2026-10-01T00:00:00Z");
    expect(referralNudgeDue({ status: "ASKED", askedAt }, new Date("2026-10-06T00:00:00Z"))).toBe(true);
    expect(referralNudgeDue({ status: "ASKED", askedAt }, new Date("2026-10-05T00:00:00Z"))).toBe(false);
    expect(referralNudgeDue({ status: "REFERRED", askedAt }, new Date("2026-10-20T00:00:00Z"))).toBe(false);
    expect(referralNudgeDue({ status: "NO_REPLY", askedAt: null }, new Date("2026-10-20T00:00:00Z"))).toBe(false);
  });
});
