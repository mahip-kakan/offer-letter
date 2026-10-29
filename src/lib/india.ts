// How India writes money: ₹18,50,000 (lakh and crore grouping), and yearly
// pay in lakhs per annum, "₹18–24 LPA", the way recruiters and postings quote it.

const LAKH = 100_000;

/** "₹18,50,000": rupees with Indian digit grouping. */
export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** "18", "18.5": an amount in lakhs, to one decimal, without a trailing ".0". */
function lakhs(amount: number): string {
  return String(Math.round((amount / LAKH) * 10) / 10);
}

/**
 * A yearly rupee salary as Indian postings write it: "₹18–24 LPA", or
 * "₹18 LPA" for one amount; "" without any.
 */
export function formatLpa(min: number | null | undefined, max: number | null | undefined): string {
  const low = min || max;
  const high = max || min;
  if (!low || !high) return "";
  const [from, to] = [lakhs(Math.min(low, high)), lakhs(Math.max(low, high))];
  return from === to ? `₹${from} LPA` : `₹${from}–${to} LPA`;
}

/** A rupee salary for a period: LPA for a year, else "₹50,000–60,000 a month" with Indian grouping. */
export function formatInrSalary(min: number | null | undefined, max: number | null | undefined, period: string | null | undefined): string {
  const unit = period?.toUpperCase() ?? "YEAR";
  if (unit === "YEAR") return formatLpa(min, max);
  const low = min || max;
  const high = max || min;
  if (!low || !high) return "";
  const per: Record<string, string> = { MONTH: "a month", WEEK: "a week", DAY: "a day", HOUR: "an hour" };
  const range = Math.round(low) === Math.round(high) ? formatInr(low) : `${formatInr(Math.min(low, high))}–${Math.round(Math.max(low, high)).toLocaleString("en-IN")}`;
  return [range, per[unit]].filter(Boolean).join(" ");
}
