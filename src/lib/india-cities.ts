// Old and official names of the same Indian city, so a search for one finds the other.

const GROUPS: readonly { canonical: string; names: readonly string[] }[] = [
  { canonical: "Bengaluru", names: ["bangalore", "bengaluru", "bangaluru"] },
  { canonical: "Gurugram", names: ["gurgaon", "gurugram"] },
  { canonical: "Mumbai", names: ["bombay", "mumbai"] },
  { canonical: "Kolkata", names: ["calcutta", "kolkata"] },
  { canonical: "Chennai", names: ["madras", "chennai"] },
  { canonical: "Puducherry", names: ["pondicherry", "puducherry"] },
  { canonical: "Kochi", names: ["cochin", "kochi"] },
  { canonical: "Thiruvananthapuram", names: ["trivandrum", "thiruvananthapuram"] },
  { canonical: "Vadodara", names: ["baroda", "vadodara"] },
  { canonical: "Prayagraj", names: ["allahabad", "prayagraj"] },
  { canonical: "Varanasi", names: ["banaras", "benares", "varanasi"] },
];

const NCR = new Set(["ncr", "delhi ncr", "ncr delhi"]);

const fold = (place: string) => place.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * The name to search under. "Bangalore" becomes "Bengaluru", "NCR" becomes
 * "Delhi"; a place that isn't one of these is unchanged.
 */
export function searchPlace(place: string): string {
  const folded = fold(place);
  if (!folded) return "";
  if (NCR.has(folded)) return "Delhi";
  return GROUPS.find((group) => group.names.includes(folded))?.canonical ?? place.trim();
}
