"use client";

import { type ReactNode } from "react";
import { Eye, EyeOff } from "@/ui/icon-registry";
import { setApiUrlCensored, useApiUrlCensored } from "./api-url-censor-state";


/** Visual privacy mode for controller/API addresses during demos and screen sharing. */
export function CensoredApiUrl({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const censored = useApiUrlCensored();
  return (
    <span
      className={`${className}${censored ? " select-none blur-[6px]" : ""}`}
      aria-label={censored ? "API URL censored" : undefined}
    >
      {children}
    </span>
  );
}

export function ApiUrlCensorToggle() {
  const censored = useApiUrlCensored();
  return (
    <button
      type="button"
      onClick={() => setApiUrlCensored(!censored)}
      aria-pressed={censored}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-(--ui-separator) px-2 text-[length:var(--fs-xs)] text-(--ui-muted) transition-colors hover:border-(--ui-fg)/30 hover:text-(--ui-fg)"
      title={censored ? "Reveal API URLs" : "Censor API URLs"}
    >
      {censored ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      {censored ? "Reveal URLs" : "Censor URLs"}
    </button>
  );
}
