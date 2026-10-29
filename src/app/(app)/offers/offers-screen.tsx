"use client";

import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { breakdown, suggestGratuity, suggestPf, type OfferInput } from "@/lib/ctc";
import { formatInr } from "@/lib/india";

import { deleteOffer, saveOffer } from "./actions";

export type OfferForm = OfferInput & { id: string; company: string; role: string };

const blank = (): OfferForm => ({
  id: "",
  company: "",
  role: "",
  basicMonthly: 0,
  fixedGrossMonthly: 0,
  variableAnnual: 0,
  joiningBonus: 0,
  esopAnnual: 0,
  employeePfMonthly: 0,
  employerPfMonthly: 0,
  gratuityMonthly: 0,
  professionalTaxMonthly: 0,
});

const money = (value: string) => Math.max(0, Math.round(Number(value.replace(/[,₹\s]/g, "")) || 0));

function Money({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Input label={label} inputMode="numeric" value={value ? String(value) : ""} onChange={(event) => onChange(money(event.target.value))} />;
}

/** Up to three offers, with monthly in-hand worked out as you type. */
export function OffersScreen({ initial }: { initial: OfferForm[] }) {
  const [offers, setOffers] = useState<OfferForm[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);

  const update = (index: number, patch: Partial<OfferForm>) =>
    setOffers((current) => current.map((offer, i) => (i === index ? { ...offer, ...patch } : offer)));

  const setBasic = (index: number, basicMonthly: number) => {
    const offer = offers[index]!;
    update(index, {
      basicMonthly,
      employeePfMonthly: offer.employeePfMonthly === suggestPf(offer.basicMonthly) ? suggestPf(basicMonthly) : offer.employeePfMonthly,
      employerPfMonthly: offer.employerPfMonthly === suggestPf(offer.basicMonthly) ? suggestPf(basicMonthly) : offer.employerPfMonthly,
      gratuityMonthly: offer.gratuityMonthly === suggestGratuity(offer.basicMonthly) ? suggestGratuity(basicMonthly) : offer.gratuityMonthly,
    });
  };

  const save = async (index: number) => {
    const offer = offers[index]!;
    setSaving(offer.id || `new-${index}`);
    const result = await saveOffer(offer.id ? offer : { ...offer, id: undefined });
    setSaving(null);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    update(index, { id: result.data });
    toast("Saved.");
  };

  const remove = async (index: number) => {
    const offer = offers[index]!;
    if (offer.id) {
      const result = await deleteOffer({ id: offer.id });
      if (!result.ok) {
        toast(result.error);
        return;
      }
    }
    setOffers((current) => current.filter((_, i) => i !== index));
  };

  const add = () => setOffers((current) => (current.length >= 3 ? current : [...current, blank()]));
  const hands = offers.map((offer) => (offer.fixedGrossMonthly > 0 ? breakdown(offer).monthlyInHand : -1));
  const best = Math.max(...hands);

  return (
    <>
      <PageHeader
        title="Offers"
        description="Compare up to three offers by what lands in the bank each month, under the new tax regime for FY 2026-27."
        actions={
          <Button variant="secondary" onClick={add} disabled={offers.length >= 3}>
            Add an offer
          </Button>
        }
      />
      <div className="flex flex-col gap-5 px-10 pt-2 pb-16">
        {offers.length === 0 && <p className="text-sm text-muted">No offers yet. Add the ones you are choosing between.</p>}
        <div className="grid items-start gap-5 lg:grid-cols-3">
          {offers.map((offer, index) => {
            const result = breakdown(offer);
            const winning = offer.fixedGrossMonthly > 0 && result.monthlyInHand === best;
            return (
              <Card key={offer.id || index} className="flex flex-col gap-4">
                <Input label="Company" value={offer.company} onChange={(event) => update(index, { company: event.target.value })} />
                <Input label="Role" value={offer.role} onChange={(event) => update(index, { role: event.target.value })} />
                <Money label="Basic, a month" value={offer.basicMonthly} onChange={(value) => setBasic(index, value)} />
                <Money label="Fixed gross, a month" value={offer.fixedGrossMonthly} onChange={(value) => update(index, { fixedGrossMonthly: value })} />
                <Money label="Employee PF, a month" value={offer.employeePfMonthly} onChange={(value) => update(index, { employeePfMonthly: value })} />
                <Money label="Employer PF, a month" value={offer.employerPfMonthly} onChange={(value) => update(index, { employerPfMonthly: value })} />
                <Money label="Gratuity, a month" value={offer.gratuityMonthly} onChange={(value) => update(index, { gratuityMonthly: value })} />
                <Money label="Professional tax, a month" value={offer.professionalTaxMonthly} onChange={(value) => update(index, { professionalTaxMonthly: value })} />
                <Money label="Variable, a year" value={offer.variableAnnual} onChange={(value) => update(index, { variableAnnual: value })} />
                <Money label="Joining bonus" value={offer.joiningBonus} onChange={(value) => update(index, { joiningBonus: value })} />
                <Money label="ESOPs, a year (not cash)" value={offer.esopAnnual} onChange={(value) => update(index, { esopAnnual: value })} />
                <div className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
                  <p>
                    In hand {winning && offers.filter((entry) => entry.fixedGrossMonthly > 0).length > 1 ? "(highest)" : ""}:{" "}
                    <span className="font-medium">{offer.fixedGrossMonthly > 0 ? `${formatInr(result.monthlyInHand)} a month` : "—"}</span>
                  </p>
                  <p className="text-muted">CTC {formatInr(result.annualCtc)} · tax {formatInr(result.annualTax)} a year · first-year cash {formatInr(result.firstYearCash)}</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => void save(index)} aria-disabled={saving === (offer.id || `new-${index}`) || undefined}>
                    Save
                  </Button>
                  <Button variant="text" onClick={() => void remove(index)}>
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        <p className="max-w-[720px] text-meta text-pretty text-muted">
          New tax regime, FY 2026-27: slabs from nil to 30% above ₹24 lakh, ₹75,000 standard deduction, and no tax up to ₹12 lakh of taxable income. Employee PF is taken out of monthly pay and is not a deduction under this regime. Employer PF above ₹7.5 lakh a year is taxed. Surcharge above ₹50 lakh, the old regime, and tax when ESOPs are exercised are not included. Professional tax depends on your state; type it in.
        </p>
      </div>
    </>
  );
}
