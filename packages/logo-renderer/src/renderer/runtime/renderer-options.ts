import type * as stylex from "@stylexjs/stylex";
import { useMemo, type RefObject } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "phase/react";
import type { ImprintRenderOptions } from "../render";

export type LogoRendererAssets = {
	readonly modelUrl: string;
	readonly fallbackUrl?: string | undefined;
	readonly dayUrl: string;
	readonly nightUrl: string;
};

type AtmosphereSettings = Readonly<
	Pick<NonNullable<ImprintRenderOptions["atmosphere"]>, "prism" | "beamOpacity" | "dayRoom">
>;

export type LocalAiLogoShaderProps = LogoRendererAssets & {
	/** One-shot actual-aperture entrance; omission preserves the steady renderer. */
	readonly atmosphereIntro?: boolean | undefined;
	/** Host-selected lighting policy; omission keeps the neutral atmosphere. */
	readonly atmosphereSettings?: AtmosphereSettings | undefined;
	/** Full-section canvas sharing this renderer's device, light and silhouette. */
	readonly atmosphereRef?: RefObject<HTMLCanvasElement | null> | undefined;
	readonly atmosphereForegroundRef?: RefObject<HTMLCanvasElement | null> | undefined;
	/** Opaque intro presentation above the unchanged steady canvas stack. */
	readonly atmosphereIntroRef?: RefObject<HTMLCanvasElement | null> | undefined;
	/** Lets the host hide stale layers while the renderer initializes or restarts. */
	readonly onPending?: (() => void) | undefined;
	/** Fires once when the live canvas has produced its first frame. */
	readonly onFirstFrame?: (() => void) | undefined;
	/** Lets the host restore its poster after renderer failure. */
	readonly onFallback?: (() => void) | undefined;
	/** Stage layout override (position/size) applied after the default stage. */
	readonly sx?: stylex.StyleXStyles | undefined;
	/** Camera framing aspect; defaults to the hero stage's 1.52. */
	readonly viewportAspect?: number | undefined;
	/** Enables the pointer-painted square imprint. */
	readonly paintOnHover?: boolean | undefined;
	/** Opens the rear glass depth during pointer interaction, never on entry. */
	readonly depthReveal?: boolean | undefined;
	readonly material?: "glass" | "metallic" | undefined;
	readonly environment?: "sky" | "studio" | undefined;
	/** Locks the canonical environment for decorative instances; the object still follows the cursor. */
	readonly staticPose?: boolean | undefined;
};

function useMaterialSettings({
	modelUrl,
	dayUrl,
	nightUrl,
	material = "glass",
	environment = "sky",
}: Pick<LocalAiLogoShaderProps, "modelUrl" | "dayUrl" | "nightUrl" | "material" | "environment">) {
	return useMemo(
		() => ({ modelUrl, dayUrl, nightUrl, material, environment }),
		[modelUrl, dayUrl, nightUrl, material, environment],
	);
}

function useAtmosphereSettings({
	atmosphereRef,
	atmosphereForegroundRef,
	atmosphereSettings,
	atmosphereIntro = false,
}: LocalAiLogoShaderProps) {
	const prismAtmosphere = atmosphereSettings?.prism ?? false;
	const atmosphereBeamOpacity = atmosphereSettings?.beamOpacity;
	const atmosphereDayRoom = atmosphereSettings?.dayRoom;
	return useMemo(
		() => ({
			atmosphereRef,
			atmosphereForegroundRef,
			prismAtmosphere,
			atmosphereBeamOpacity,
			atmosphereDayRoom,
			atmosphereIntro,
		}),
		[
			atmosphereRef,
			atmosphereForegroundRef,
			prismAtmosphere,
			atmosphereBeamOpacity,
			atmosphereDayRoom,
			atmosphereIntro,
		],
	);
}

export function useRendererSettings(props: LocalAiLogoShaderProps) {
	const material = useMaterialSettings(props);
	const atmosphere = useAtmosphereSettings(props);
	const prefersReducedMotion = usePrefersReducedMotion();
	const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
	const { paintOnHover = true, depthReveal = false } = props;
	return useMemo(
		() => ({
			material,
			atmosphere,
			prefersReducedMotion,
			prefersDarkScheme,
			paintOnHover,
			depthReveal,
		}),
		[material, atmosphere, prefersReducedMotion, prefersDarkScheme, paintOnHover, depthReveal],
	);
}

export type RendererSettings = ReturnType<typeof useRendererSettings>;
export type SampledSettings = { readonly staticPose: boolean; readonly viewportAspect: number };
