"use client";

import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copyText } from "@/lib/copy-text";

/** The token for the Save to Offer Letter browser extension. */
export function CaptureCard({ token }: { token: string }) {
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-sans text-section tracking-tight">Save from the browser</h2>
      <p className="text-sm text-pretty text-muted">
        Install the extension in <span className="font-mono text-label">extensions/offer-letter</span> (Chrome: Extensions → Load unpacked). Paste this token into it once. On a job page, open the extension and save. The posting becomes a draft application. No extra API key.
      </p>
      <p className="break-all font-mono text-sm">{token}</p>
      <Button
        className="w-fit"
        variant="secondary"
        onClick={() => void copyText(token).then((ok) => toast(ok ? "Copied the token." : "Select the token and copy it yourself."))}
      >
        Copy token
      </Button>
    </Card>
  );
}
