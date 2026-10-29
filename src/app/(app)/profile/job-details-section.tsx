"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTrackSave } from "@/components/save-tracker";
import { useAutosave } from "@/hooks/use-autosave";
import { NOTICE_PERIODS, totalExperience, type JobDetails } from "@/lib/job-details";

import { saveJobDetails } from "./actions";

/** What recruiters ask first (CTC, notice period, locations), autosaved; used in emails, never on resumes. */
export function JobDetailsSection({
  details,
  onChange,
  experienceMonths,
}: {
  details: JobDetails;
  onChange: (details: JobDetails) => void;
  experienceMonths: number;
}) {
  const track = useTrackSave();
  const { flush } = useAutosave(details, (value) => track(saveJobDetails(value)));
  const set = <K extends keyof JobDetails>(field: K, value: JobDetails[K]) => onChange({ ...details, [field]: value });
  const experience = totalExperience(experienceMonths);

  return (
    <Card className="grid grid-cols-2 gap-x-[18px] gap-y-5">
      <p className="col-span-2 text-sm text-muted">
        Total experience: <span className="text-ink">{experience || "add roles under Experience"}</span>, counted from your roles.
      </p>
      <Input
        label="Current CTC"
        placeholder="18 LPA (16 fixed + 2 variable)"
        value={details.currentCtc}
        onChange={(event) => set("currentCtc", event.target.value)}
        onBlur={flush}
      />
      <Input
        label="Expected CTC"
        placeholder="24 LPA, or 30% hike"
        value={details.expectedCtc}
        onChange={(event) => set("expectedCtc", event.target.value)}
        onBlur={flush}
      />
      <Select
        label="Notice period"
        value={details.noticePeriod}
        onChange={(event) => set("noticePeriod", event.target.value)}
        onBlur={flush}
      >
        {NOTICE_PERIODS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {details.noticePeriod === "Serving notice" ? (
        <Input
          label="Last working day"
          type="date"
          value={details.lastWorkingDay}
          onChange={(event) => set("lastWorkingDay", event.target.value)}
          onBlur={flush}
        />
      ) : (
        <span />
      )}
      <Checkbox
        className="col-span-2"
        label="My notice period can be bought out or shortened"
        checked={details.noticeNegotiable}
        onChange={(event) => set("noticeNegotiable", event.target.checked)}
      />
      <Input
        className="col-span-2"
        label="Preferred locations"
        placeholder="Bengaluru, Hyderabad, Remote"
        value={details.preferredLocations}
        onChange={(event) => set("preferredLocations", event.target.value)}
        onBlur={flush}
      />
      <Checkbox
        className="col-span-2"
        label="Open to relocating"
        checked={details.openToRelocate}
        onChange={(event) => set("openToRelocate", event.target.checked)}
      />
      <Input
        label="Notice buyout"
        placeholder="2 months' salary"
        value={details.buyoutAmount}
        onChange={(event) => set("buyoutAmount", event.target.value)}
        onBlur={flush}
      />
      <span />
      <Checkbox
        label="Relieving letter in hand"
        checked={details.relievingLetter}
        onChange={(event) => set("relievingLetter", event.target.checked)}
      />
      <Checkbox
        label="Experience letter in hand"
        checked={details.experienceLetter}
        onChange={(event) => set("experienceLetter", event.target.checked)}
      />
      <Checkbox
        className="col-span-2 pt-1"
        label={
          <>
            List these in application emails{" "}
            <span className="text-meta text-muted">(replies to recruiters always use them when asked)</span>
          </>
        }
        checked={details.inApplicationEmails}
        onChange={(event) => set("inApplicationEmails", event.target.checked)}
      />
    </Card>
  );
}
