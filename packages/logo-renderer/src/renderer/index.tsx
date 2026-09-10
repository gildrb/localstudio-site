import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState } from "react";
import { prefersReducedMotion as prefersReducedMotionSync } from "phase";
import { useMediaQuery, useSize, useStableCallback, useSyncedRef } from "phase/react";
import { DEFAULT_OBJECT_YAW, DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER } from "./render";
import { rendererStyles } from "./runtime/renderer-styles";
import {
	useRendererSettings,
	type LocalAiLogoShaderProps,
	type SampledSettings,
	type RendererSettings,
} from "./runtime/renderer-options";
import {
	useRendererRefs,
	type RendererRefs,
	type RendererCallbacks,
} from "./runtime/renderer-refs";
import { useRendererScheduling, useRendererInputChanges } from "./runtime/renderer-scheduling";
import { setupRendererInputs, startRenderer, type RendererSession } from "./runtime/renderer-setup";

export type { LogoRendererAssets, LocalAiLogoShaderProps } from "./runtime/renderer-options";

// Static first-frame poster on the exact canvas stage. The site shows it until
// the live renderer reports its first frame (see onFirstFrame).
export function LogoPoster({
	dayUrl,
	nightUrl,
	sx,
}: {
	readonly dayUrl: string;
	readonly nightUrl: string;
	readonly sx?: stylex.StyleXStyles | undefined;
}) {
	return (
		<div {...stylex.props(rendererStyles.element, rendererStyles.container, sx)}>
			<picture {...stylex.props(rendererStyles.element, rendererStyles.layer)}>
				<source media="(prefers-color-scheme: dark)" srcSet={nightUrl} />
				<img
					{...stylex.props(rendererStyles.element, rendererStyles.posterImage)}
					src={dayUrl}
					alt=""
					width="1509"
					height="993"
					draggable={false}
					decoding="sync"
					fetchPriority="high"
				/>
			</picture>
		</div>
	);
}

function createInitialState(
	refs: RendererRefs,
	settings: RendererSettings,
	{ staticPose }: SampledSettings,
): RendererSession["state"] {
	const { paintOnHover, depthReveal } = settings;
	const { material } = settings.material;
	return {
		cancelled: false,
		renderRequested: true,
		cleanup: undefined,
		mouseEnvYaw: refs.controlsRef.current.envYaw,
		targetMouseEnvYaw: refs.controlsRef.current.envYaw,
		mouseEnvPitch: refs.controlsRef.current.envPitch,
		targetMouseEnvPitch: refs.controlsRef.current.envPitch,
		asciiMouseX: 0,
		asciiMouseY: 0,
		targetAsciiMouseX: 0,
		targetAsciiMouseY: 0,
		brushCellX: 0,
		brushCellY: 0,
		previousRenderedBrushCellX: 0,
		previousRenderedBrushCellY: 0,
		hasBrushCell: false,
		hasRenderedBrushCell: false,
		brushActive: false,
		paintGridScaleMultiplier: DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
		targetBrushActive: false,
		activeMesh: undefined,
		previousFrameTime: performance.now(),
		autoRotateStartTime: performance.now(),
		lastBrushMoveTime: Number.NEGATIVE_INFINITY,
		lastPointerClientX: undefined,
		lastPointerClientY: undefined,
		staticPose,
		rippleCellX: 0,
		rippleCellY: 0,
		rippleStartTime: Number.NEGATIVE_INFINITY,
		lastRippleSpawnTime: Number.NEGATIVE_INFINITY,
		pointerInsideCanvas: false,
		isCoarsePointer: refs.coarsePointerRef.current,
		paintOnHover,
		depthReveal,
		depthOpening: 0,
		baseObjectYaw: material === "metallic" ? 0 : DEFAULT_OBJECT_YAW,
	};
}

function useRendererCallbacks(
	{
		onFirstFrame,
		onFallback,
		onPending,
	}: Pick<LocalAiLogoShaderProps, "onFirstFrame" | "onFallback" | "onPending">,
	refs: RendererRefs,
) {
	const { stateRef, runLoopRef, fatalErrorRef } = refs;
	const [fallbackVisible, setFallbackVisible] = useState(true);
	const requestRender = useStableCallback(() => {
		if (stateRef.current) stateRef.current.renderRequested = true;
		runLoopRef.current();
	});
	const handleCanvasRevealed = useStableCallback(() => {
		if (stateRef.current?.cancelled !== true) {
			setFallbackVisible(false);
			onFirstFrame?.();
		}
	});
	const handleFallback = useStableCallback(() => {
		setFallbackVisible(true);
		onFallback?.();
	});
	const resetLayers = useStableCallback(() => {
		setFallbackVisible(true);
		onPending?.();
	});
	const handleFatalError = useStableCallback(() => fatalErrorRef.current?.());
	const callbacks = useMemo(
		() => ({ requestRender, handleCanvasRevealed, handleFallback, resetLayers, handleFatalError }),
		[requestRender, handleCanvasRevealed, handleFallback, resetLayers, handleFatalError],
	);
	return { fallbackVisible, callbacks };
}

function useRendererRestart(
	settings: RendererSettings,
	refs: RendererRefs,
	callbacks: RendererCallbacks,
	props: LocalAiLogoShaderProps,
) {
	// These options were sampled only on restart, not restart triggers.
	const sampledRef = useSyncedRef({
		staticPose: props.staticPose ?? false,
		viewportAspect: props.viewportAspect ?? 1.52,
	});
	const { atmosphereIntroRef } = props;
	useEffect(() => {
		const sampled = sampledRef.current;
		const state = createInitialState(refs, settings, sampled);
		const session: RendererSession = {
			state,
			settings,
			sampled,
			refs,
			callbacks,
			disposeRuntime: undefined,
		};
		const cleanupSetup = setupRendererInputs(session);
		if (settings.prefersReducedMotion || prefersReducedMotionSync()) return cleanupSetup;
		const { handleFallback } = callbacks;
		void startRenderer(session)
			.then((dispose) => {
				state.cleanup = dispose;
			})
			.catch(() => {
				session.disposeRuntime?.();
				session.disposeRuntime = undefined;
				if (!state.cancelled) handleFallback();
			});
		return () => {
			state.cancelled = true;
			cleanupSetup();
			session.disposeRuntime?.();
		};
	}, [settings, refs, callbacks, sampledRef, atmosphereIntroRef]);
}

export function LocalAiLogoShader(props: LocalAiLogoShaderProps) {
	const settings = useRendererSettings(props);
	const coarsePointer = useMediaQuery("(pointer: coarse)");
	const refs = useRendererRefs(settings.material.material, coarsePointer);
	const { size: containerSize } = useSize({ ref: refs.containerRef });
	const { fallbackVisible, callbacks } = useRendererCallbacks(props, refs);
	useRendererScheduling(refs, props.atmosphereRef);
	useRendererInputChanges(refs, coarsePointer, callbacks.requestRender, containerSize);
	useRendererRestart(settings, refs, callbacks, props);
	return (
		<RendererStage
			refs={refs}
			fallbackVisible={fallbackVisible}
			fallbackUrl={props.fallbackUrl}
			sx={props.sx}
		/>
	);
}

function RendererStage({
	refs: { containerRef, canvasRef },
	fallbackVisible,
	fallbackUrl,
	sx,
}: {
	readonly refs: RendererRefs;
	readonly fallbackVisible: boolean;
	readonly fallbackUrl: string | undefined;
	readonly sx: stylex.StyleXStyles | undefined;
}) {
	return (
		<div
			ref={containerRef}
			{...stylex.props(rendererStyles.element, rendererStyles.container, sx)}
			aria-hidden="true"
		>
			{fallbackUrl !== undefined && fallbackUrl !== "" ? (
				<img
					{...stylex.props(
						rendererStyles.element,
						rendererStyles.layer,
						rendererStyles.fallback,
						fallbackVisible && rendererStyles.fallbackVisible,
					)}
					src={fallbackUrl}
					alt=""
					width="525"
					height="525"
					draggable={false}
				/>
			) : null}
			<canvas
				ref={canvasRef}
				{...stylex.props(
					rendererStyles.element,
					rendererStyles.layer,
					rendererStyles.canvas,
					fallbackVisible && rendererStyles.canvasPending,
				)}
			/>
		</div>
	);
}
