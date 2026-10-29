import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

import { OffersScreen, type OfferForm } from "./offers-screen";

export const metadata: Metadata = { title: "Offers" };

/** Side-by-side offers, with monthly in-hand under the new tax regime. */
export default async function OffersPage() {
  const offers = await prisma.offer.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  const initial: OfferForm[] = offers.map((offer) => ({
    id: offer.id,
    company: offer.company,
    role: offer.role,
    basicMonthly: offer.basicMonthly,
    fixedGrossMonthly: offer.fixedGrossMonthly,
    variableAnnual: offer.variableAnnual,
    joiningBonus: offer.joiningBonus,
    esopAnnual: offer.esopAnnual,
    employeePfMonthly: offer.employeePfMonthly,
    employerPfMonthly: offer.employerPfMonthly,
    gratuityMonthly: offer.gratuityMonthly,
    professionalTaxMonthly: offer.professionalTaxMonthly,
  }));
  return <OffersScreen initial={initial} />;
}
