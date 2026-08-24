import type { CSSProperties } from "react";

type CssVars = {
	readonly [key: `--${string}`]: string;
};

export function cssVars(vars: CssVars): CSSProperties {
	return { ...vars };
}
