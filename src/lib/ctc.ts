import { formatInr } from "@/lib/india";

// In-hand pay from an Indian offer, under the new tax regime for FY 2026-27.
// Budget 2026 left the Budget 2025 slabs in place (Economic Times, 1 Feb 2026;
// standard deduction still ₹75,000). This is an estimate: it ignores old-regime
// deductions, surcharge above ₹50 lakh, and tax on ESOP exercise.

/** ₹75,000 standard deduction for salaried income, new regime, FY 2026-27. */
export const STANDARD_DEDUCTION = 75_000;
/** Section 87A: tax is nil when taxable income is at most this. */
const REBATE_UP_TO = 1_200_000;
/** Employer PF above this in a year is a taxable perquisite. */
const EMPLOYER_PF_EXEMPT = 750_000;

const SLABS: readonly { upTo: number; rate: number }[] = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.1 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.2 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
];

/** 12% of basic, the usual PF line. */
export const suggestPf = (basicMonthly: number) => Math.round(basicMonthly * 0.12);

/** Gratuity provision: 15 days of basic per year, spread over 12 months. */
export const suggestGratuity = (basicMonthly: number) => Math.round((basicMonthly * 15) / 26 / 12);

export type OfferInput = {
  basicMonthly: number;
  fixedGrossMonthly: number;
  variableAnnual: number;
  joiningBonus: number;
  esopAnnual: number;
  employeePfMonthly: number;
  employerPfMonthly: number;
  gratuityMonthly: number;
  professionalTaxMonthly: number;
};

export type OfferBreakdown = {
  /** Recurring CTC: fixed gross, employer PF, gratuity, and variable. Joining bonus is extra. */
  annualCtc: number;
  taxableIncome: number;
  annualTax: number;
  monthlyTax: number;
  /** Fixed gross, after employee PF, professional tax and monthly tax. */
  monthlyInHand: number;
  /** Twelve months in hand, plus variable and the joining bonus. ESOPs are not cash. */
  firstYearCash: number;
};

/** Slab tax before the rebate, marginal relief and cess. */
export function slabTax(income: number): number {
  if (income <= 0) return 0;
  let tax = 0;
  let from = 0;
  for (const slab of SLABS) {
    const slice = Math.min(income, slab.upTo) - from;
    if (slice > 0) tax += slice * slab.rate;
    if (income <= slab.upTo) break;
    from = slab.upTo;
  }
  return tax;
}

/**
 * Income tax for a year of normal salaried income, new regime.
 * Up to ₹12 lakh, the 87A rebate wipes it out. Just above that, marginal
 * relief caps the tax (before cess) at the amount over ₹12 lakh. Cess is 4%.
 * Surcharge is not included.
 */
export function incomeTax(taxableIncome: number): number {
  const income = Math.max(0, Math.round(taxableIncome));
  const raw = slabTax(income);
  if (income <= REBATE_UP_TO) return 0;
  const beforeCess = Math.min(raw, income - REBATE_UP_TO);
  return Math.round(beforeCess + beforeCess * 0.04);
}

/** The year's tax and what lands in the bank each month. */
export function breakdown(offer: OfferInput): OfferBreakdown {
  const fixedAnnual = offer.fixedGrossMonthly * 12;
  const employerPfAnnual = offer.employerPfMonthly * 12;
  const taxableIncome = Math.max(0, fixedAnnual - STANDARD_DEDUCTION + Math.max(0, employerPfAnnual - EMPLOYER_PF_EXEMPT));
  const annualTax = incomeTax(taxableIncome);
  const monthlyTax = Math.round(annualTax / 12);
  const monthlyInHand = offer.fixedGrossMonthly - offer.employeePfMonthly - offer.professionalTaxMonthly - monthlyTax;
  return {
    annualCtc: fixedAnnual + employerPfAnnual + offer.gratuityMonthly * 12 + offer.variableAnnual,
    taxableIncome,
    annualTax,
    monthlyTax,
    monthlyInHand,
    firstYearCash: monthlyInHand * 12 + offer.variableAnnual + offer.joiningBonus,
  };
}

/** "₹94,000 a month", or "—" when there's no fixed pay to estimate from. */
export function inHandLabel(offer: OfferInput): string {
  if (offer.fixedGrossMonthly <= 0) return "—";
  return `${formatInr(breakdown(offer).monthlyInHand)} a month`;
}
