"use client";

import { useState } from "react";

import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/lib/copy-text";
import { referralMessage, referralNudgeDue, REFERRAL_STATUSES, type ReferralStatusName } from "@/lib/referral";

import { saveHiring } from "./hiring-actions";

export type HiringState = {
  joiningDate: string;
  name: string;
  contact: string;
  relation: string;
  status: ReferralStatusName;
  message: string;
  askedAt: string | null;
};

/** The referral and the joining date for one application. */
export function HiringTab({ applicationId, company, role, candidate, initial }: { applicationId: string; company: string; role: string; candidate: string; initial: HiringState }) {
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof HiringState>(field: K, value: HiringState[K]) => setState((current) => ({ ...current, [field]: value }));
  const due = referralNudgeDue({ status: state.status, askedAt: state.askedAt ? new Date(state.askedAt) : null }, new Date());

  const draft = () => set("message", referralMessage({ referrer: state.name, name: candidate, company, role }));

  const save = async () => {
    setSaving(true);
    const result = await saveHiring({
      applicationId,
      joiningDate: state.joiningDate,
      name: state.name,
      contact: state.contact,
      relation: state.relation,
      status: state.status,
      message: state.message,
    });
    setSaving(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    if ((state.status === "ASKED" || state.status === "REFERRED" || state.status === "NO_REPLY") && !state.askedAt) {
      set("askedAt", new Date().toISOString());
    }
    if (state.status === "NOT_ASKED") set("askedAt", null);
    toast("Saved.");
  };

  return (
    <div className="flex flex-1 flex-col items-center overflow-auto bg-canvas px-10 pt-11 pb-16">
      <div className="flex w-full max-w-[640px] flex-col gap-5">
        {due && <p className="rounded-panel border border-line-card bg-card px-5 py-4 text-sm">You asked {state.name || "them"} over five days ago. A short nudge is worth sending.</p>}
        <Input label="Joining date" type="date" value={state.joiningDate} onChange={(event) => set("joiningDate", event.target.value)} />
        <p className="text-meta text-muted">Shown on the dashboard as a countdown while the offer is still open.</p>
        <h2 className="font-serif text-section">Referral</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Who" placeholder="Priya Shah" value={state.name} onChange={(event) => set("name", event.target.value)} />
          <Input label="How you know them" placeholder="Manager at Acme" value={state.relation} onChange={(event) => set("relation", event.target.value)} />
          <Input className="col-span-2" label="Contact" placeholder="LinkedIn, or priya@acme.com" value={state.contact} onChange={(event) => set("contact", event.target.value)} />
          <Select label="Status" value={state.status} onChange={(event) => set("status", event.target.value as ReferralStatusName)}>
            {REFERRAL_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Textarea label="Message" rows={7} value={state.message} onChange={(event) => set("message", event.target.value)} />
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={draft}>
            Draft a message
          </Button>
          <Button
            variant="secondary"
            onClick={() => void copyText(state.message).then((ok) => toast(ok ? "Copied the message." : "That didn't copy. Select the text and copy it yourself."))}
            disabled={!state.message.trim()}
          >
            Copy
          </Button>
          <Button onClick={() => void save()} aria-disabled={saving || undefined}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
