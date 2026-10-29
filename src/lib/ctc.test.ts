import { describe, expect, it } from "vitest";

import { breakdown, incomeTax, slabTax, STANDARD_DEDUCTION, suggestGratuity, suggestPf } from "./ctc";

const empty = {
  basicMonthly: 0,
  fixedGrossMonthly: 0,
  variableAnnual: 0,
  joiningBonus: 0,
  esopAnnual: 0,
  employeePfMonthly: 0,
  employerPfMonthly: 0,
  gratuityMonthly: 0,
  professionalTaxMonthly: 0,
};

describe("new regime tax, FY 2026-27", () => {
  it("charges each slab only on the income inside it", () => {
    expect(slabTax(400_000)).toBe(0);
    expect(slabTax(800_000)).toBe(20_000);
    expect(slabTax(1_200_000)).toBe(60_000);
  });

  it("wipes the tax up to ₹12 lakh, and caps the jump just above it", () => {
    expect(incomeTax(1_200_000)).toBe(0);
    // ₹10,000 over the rebate, so the tax before cess is ₹10,000, then 4% cess.
    expect(incomeTax(1_210_000)).toBe(10_400);
  });

  it("leaves a salaried ₹12.75 lakh with nothing to pay, after the standard deduction", () => {
    const offer = { ...empty, fixedGrossMonthly: 1_275_000 / 12 };
    expect(breakdown(offer).taxableIncome).toBe(1_275_000 - STANDARD_DEDUCTION);
    expect(breakdown(offer).annualTax).toBe(0);
    expect(breakdown(offer).monthlyInHand).toBe(1_275_000 / 12);
  });
});

describe("an offer", () => {
  it("suggests PF at 12% and gratuity at 15 days of basic", () => {
    expect(suggestPf(50_000)).toBe(6_000);
    expect(suggestGratuity(50_000)).toBe(Math.round((50_000 * 15) / 26 / 12));
  });

  it("keeps PF, tax and professional tax out of monthly in-hand, and ESOPs out of the cash", () => {
    const result = breakdown({
      ...empty,
      basicMonthly: 50_000,
      fixedGrossMonthly: 150_000,
      employeePfMonthly: 6_000,
      employerPfMonthly: 6_000,
      gratuityMonthly: 2_000,
      professionalTaxMonthly: 200,
      variableAnnual: 300_000,
      joiningBonus: 100_000,
      esopAnnual: 500_000,
    });
    expect(result.annualCtc).toBe(150_000 * 12 + 6_000 * 12 + 2_000 * 12 + 300_000);
    expect(result.monthlyInHand).toBe(150_000 - 6_000 - 200 - result.monthlyTax);
    expect(result.firstYearCash).toBe(result.monthlyInHand * 12 + 300_000 + 100_000);
  });

  it("taxes employer PF only above ₹7.5 lakh", () => {
    const under = breakdown({ ...empty, fixedGrossMonthly: 200_000, employerPfMonthly: 60_000 });
    const over = breakdown({ ...empty, fixedGrossMonthly: 200_000, employerPfMonthly: 70_000 });
    expect(under.taxableIncome).toBe(200_000 * 12 - STANDARD_DEDUCTION);
    expect(over.taxableIncome).toBe(under.taxableIncome + (70_000 * 12 - 750_000));
  });
});
