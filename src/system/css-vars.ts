import type { CSSProperties } from "react";

type CssVars = {
	readonly [key: `--${string}`]: string;
};

export function cssVars(vars: CssVars): CSSProperties {
	// SAFETY: custom properties are valid CSS style keys; React's CSSProperties omits `--*`.
	return vars as CSSProperties;
}
