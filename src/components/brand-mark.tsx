import { cn } from "@/lib/cn";

/** Offer Letter mark. Decorative: the name sits next to it. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="64" height="64" rx="16" className="fill-primary" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        className="fill-on-primary"
      >
        OL
      </text>
    </svg>
  );
}
