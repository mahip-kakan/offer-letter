"use client";

import { useState } from "react";

import { toast } from "@/components/toast";
import { useTrackSave } from "@/components/save-tracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copyText } from "@/lib/copy-text";

import { markNaukriRefreshed } from "./actions";

function Block({ label, text }: { label: string; text: string }) {
  const copy = async () => toast((await copyText(text)) ? `Copied the ${label.toLowerCase()}.` : "That didn't copy. Select the text and copy it yourself.");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{label}</h3>
        <Button variant="secondary" onClick={() => void copy()} disabled={!text}>
          Copy
        </Button>
      </div>
      <p className="text-sm whitespace-pre-wrap text-pretty">{text || "Nothing here yet. Fill in your profile first."}</p>
    </div>
  );
}

/** Headline, summary and skills for Naukri, plus the weekly refresh. */
export function NaukriSection({
  headline,
  summary,
  skills,
  due,
  refreshedLabel,
}: {
  headline: string;
  summary: string;
  skills: string;
  due: boolean;
  refreshedLabel: string;
}) {
  const track = useTrackSave();
  const [done, setDone] = useState(!due);
  const [when, setWhen] = useState(refreshedLabel);

  const refreshed = async () => {
    const result = await track(markNaukriRefreshed({}));
    if (result.ok) {
      setDone(true);
      setWhen("today");
      toast("Marked as refreshed today.");
    }
  };

  return (
    <Card className="flex flex-col gap-6">
      <p className="text-sm text-muted">
        {done ? `Last refreshed ${when}.` : "It's been a week, or you've never marked a refresh. Open Naukri, update the profile, then mark it here."}
      </p>
      <Button className="w-fit" variant="secondary" onClick={() => void refreshed()}>
        I refreshed it today
      </Button>
      <Block label="Headline" text={headline} />
      <Block label="Summary" text={summary} />
      <Block label="Key skills" text={skills} />
    </Card>
  );
}
