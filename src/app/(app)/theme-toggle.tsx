"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { COLOR_SCHEME_COOKIE, rememberPreference, type ColorScheme } from "@/lib/ui-preferences";

import { useSidebarCollapsed } from "./sidebar-frame";

const DARK_QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  const query = matchMedia(DARK_QUERY);
  query.addEventListener("change", listener);
  listeners.add(listener);
  return () => {
    query.removeEventListener("change", listener);
    listeners.delete(listener);
  };
}

/** The scheme showing now: the one chosen here, or else the system's. */
function currentScheme(): ColorScheme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * The sidebar's light/dark switch. It follows the
 * system until it's used, then remembers the choice in a cookie that the
 * root layout reads, so the next page load starts in the right scheme.
 */
export function ThemeToggle({ serverScheme }: { serverScheme?: ColorScheme }) {
  const collapsed = useSidebarCollapsed();
  // The server only knows a scheme that was chosen; for the system's it
  // guesses light, and the browser corrects it right after hydration.
  const scheme = useSyncExternalStore(subscribe, currentScheme, () => serverScheme ?? "light");

  const choose = (next: ColorScheme) => {
    document.documentElement.dataset.theme = next;
    rememberPreference(COLOR_SCHEME_COOKIE, next);
    listeners.forEach((listener) => listener());
  };

  return (
    <div
      role="group"
      aria-label="Color scheme"
      className={cn("grid gap-0.5", collapsed ? "grid-cols-1" : "grid-cols-2")}
    >
      {(
        [
          ["light", "Light mode", "Light", Sun],
          ["dark", "Dark mode", "Dark", Moon],
        ] as const
      ).map(([value, name, text, Icon]) => (
        <button
          key={value}
          type="button"
          aria-label={name}
          aria-pressed={scheme === value}
          title={collapsed ? name : undefined}
          onClick={() => choose(value)}
          className={cn(
            "flex min-h-8 items-center justify-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-medium text-muted hover:bg-hover hover:text-ink motion-safe:transition-colors",
            scheme === value && "bg-selected text-ink",
            collapsed && "px-1.5",
          )}
        >
          <Icon size={16} aria-hidden="true" className="shrink-0" />
          <span className={cn(collapsed && "sr-only")}>{text}</span>
        </button>
      ))}
    </div>
  );
}
