import * as stylex from "@stylexjs/stylex";
import { App, Device, type VGPUAdapter } from "@vgpu/core";
import {
	createDevicePixelRatio,
	prefersReducedMotion as prefersReducedMotionSync,
} from "phase";
import {
	useLifecycle,
	useMediaQuery,
	usePrefersReducedMotion,
	useSize,
	useStableCallback,
	useSyncedRef,
} from "phase/react";
import { useEffect, useRef, useState } from "react";
import {
	DEFAULT_CAMERA_FOV,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	cameraRadiusForBounds,
	cameraRadiusForFov,
	createEve5Renderer,
	type RenderControls,
} from "./render";
import { resizeCanvas, type CanvasLayout } from "./runtime/canvas-sizing";
import { rendererTimes } from "./renderer-tokens.stylex";
import { createDrawLoop, type DrawLoop } from "./runtime/frame-loop";
import { loadMesh } from "./runtime/load-mesh";
import {
	createPointerController,
	syncPointerInteractionMode,
} from "./runtime/pointer-input";
import type { HeroRuntimeState } from "./runtime/state";

class BrowserAdapter implements VGPUAdapter {
	async requestDevice(): Promise<Device> {
		const adapter = await navigator.gpu?.requestAdapter();
		if (!adapter) throw new Error("WebGPU adapter unavailable");
		return new Device(await adapter.requestDevice(), null);
	}
}

const LOGO_VIEWPORT_ASPECT = 1.52;

const DEFAULT_CONTROLS: RenderControls = {
	yaw: 0,
	pitch: 0,
	radius: cameraRadiusForFov(DEFAULT_CAMERA_FOV),
	fov: DEFAULT_CAMERA_FOV,
	envYaw: 0,
	envPitch: 0,
	insideRendering: false,
	outsideRendering: true,
	material: "metallic",
	wireframe: false,
	showEnv: false,
};

const INITIAL_CANVAS_LAYOUT: CanvasLayout = { width: 1, height: 1 };
// The flat SVG only appears when the render takes noticeably long; a quick
// first frame goes straight to the 3D mark with no placeholder flash.
const FALLBACK_PLACEHOLDER_DELAY_MS = 700;

const rendererStyles = stylex.create({
	element: {
		boxSizing: "border-box",
		"::before": { boxSizing: "border-box" },
		"::after": { boxSizing: "border-box" },
	},
	container: {
		position: "absolute",
		zIndex: 1,
		top: {
			default: "clamp(72px, 11svh, 120px)",
			"@media (max-width: 900px)": "24px",
		},
		left: "50%",
		width: {
			default: "clamp(720px, 58vw, 940px)",
			"@media (max-width: 900px)": "min(96vw, 620px)",
		},
		aspectRatio: "1.52",
		transform: "translateX(-50%)",
		pointerEvents: "none",
		contain: "layout paint",
	},
	layer: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		display: "block",
		width: "100%",
		height: "100%",
	},
	canvas: {
		opacity: 0,
		transitionProperty: "opacity",
		transitionDuration: rendererTimes.fade,
		transitionTimingFunction: "ease-out",
	},
	canvasReady: { opacity: 1 },
	fallback: {
		maxWidth: "100%",
		userSelect: "none",
		paddingTop: "9.5%",
		paddingRight: "9.5%",
		paddingBottom: "9.5%",
		paddingLeft: "9.5%",
		objectFit: "contain",
		opacity: 0,
		filter: "invert(1)",
		transitionProperty: "opacity",
		transitionDuration: rendererTimes.fade,
		transitionTimingFunction: "ease-out",
	},
	fallbackVisible: { opacity: 0.08 },
});

type RuntimeOwner = {
	drawLoopDispose?: () => void;
};

export type LogoRendererAssets = {
	modelUrl: string;
	fallbackUrl: string;
};

export function LocalAiLogoShader({
	modelUrl,
	fallbackUrl,
}: LogoRendererAssets) {
	const prefersReducedMotion = usePrefersReducedMotion();
	const coarsePointer = useMediaQuery("(pointer: coarse)");
	const containerRef = useRef<HTMLDivElement>(null);
	const { size: containerSize } = useSize({ ref: containerRef });
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const controlsRef = useRef<RenderControls>({ ...DEFAULT_CONTROLS });
	const canvasLayoutRef = useRef<CanvasLayout>(INITIAL_CANVAS_LAYOUT);
	const devicePixelRatioRef = useRef(1);
	const coarsePointerRef = useSyncedRef(coarsePointer);
	const stateRef = useRef<HeroRuntimeState | null>(null);
	const drawLoopRef = useRef<DrawLoop | null>(null);
	const [canvasReady, setCanvasReady] = useState(false);
	const [fallbackVisible, setFallbackVisible] = useState(false);
	const fallbackPlaceholderTimerRef = useRef(0);
	const runLoopRef = useRef(() => {});
	const invalidatePointerCanvasRectRef = useRef(() => {});
	const requestRender = useStableCallback(() => {
		if (stateRef.current) stateRef.current.renderRequested = true;
		runLoopRef.current();
	});
	const handleCanvasRevealed = useStableCallback(() => {
		window.clearTimeout(fallbackPlaceholderTimerRef.current);
		if (!stateRef.current?.cancelled) {
			setCanvasReady(true);
			setFallbackVisible(false);
		}
	});
	const handleFallback = useStableCallback(() => {
		window.clearTimeout(fallbackPlaceholderTimerRef.current);
		setCanvasReady(false);
		setFallbackVisible(true);
	});
	const resetLayers = useStableCallback(() => {
		setCanvasReady(false);
		setFallbackVisible(false);
	});
	const fatalErrorRef = useRef<(() => void) | null>(null);
	const handleFatalError = useStableCallback(() => fatalErrorRef.current?.());

	const { isActive } = useLifecycle({
		ref: containerRef,
		reducedMotion: "pause",
		intersectionOptions: { threshold: 0 },
	});

	useEffect(() => {
		let frame = 0;
		const tick = (time: number) => {
			frame = 0;
			const drawLoop = drawLoopRef.current;
			if (drawLoop?.step(time)) frame = requestAnimationFrame(tick);
			else drawLoop?.stop();
		};
		const run = () => {
			const drawLoop = drawLoopRef.current;
			if (!isActive || frame || !drawLoop) return;
			drawLoop.start();
			frame = requestAnimationFrame(tick);
		};
		runLoopRef.current = run;
		run();
		return () => {
			runLoopRef.current = () => {};
			cancelAnimationFrame(frame);
			drawLoopRef.current?.stop();
		};
	}, [isActive]);

	useEffect(() => {
		if (!containerSize) return;
		canvasLayoutRef.current = containerSize;
		requestRender();
		invalidatePointerCanvasRectRef.current();
	}, [containerSize, requestRender]);

	useEffect(() => {
		const state = stateRef.current;
		if (!state) return;
		syncPointerInteractionMode(state, coarsePointer);
		requestRender();
	}, [coarsePointer, requestRender]);

	useEffect(() => {
		const state: HeroRuntimeState = {
			cancelled: false,
			renderRequested: true,
			cleanup: undefined,
			mouseEnvYaw: controlsRef.current.envYaw,
			targetMouseEnvYaw: controlsRef.current.envYaw,
			mouseEnvPitch: controlsRef.current.envPitch,
			targetMouseEnvPitch: controlsRef.current.envPitch,
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
			isCoarsePointer: coarsePointerRef.current,
		};
		stateRef.current = state;

		resetLayers();
		if (prefersReducedMotion || prefersReducedMotionSync()) {
			// Static path: the flat SVG is the final render, show it now.
			handleFallback();
		} else {
			fallbackPlaceholderTimerRef.current = window.setTimeout(
				() => handleFallback(),
				FALLBACK_PLACEHOLDER_DELAY_MS,
			);
		}
		const dprWatcher = createDevicePixelRatio({
			onChange: (dpr) => {
				devicePixelRatioRef.current = dpr;
				requestRender();
				invalidatePointerCanvasRectRef.current();
			},
		});
		devicePixelRatioRef.current = dprWatcher.dpr;

		const pointerController = createPointerController({
			state,
			controlsRef,
			canvasRef,
			coarsePointerRef,
			canvasLayoutRef,
			devicePixelRatioRef,
			requestRender,
		});
		invalidatePointerCanvasRectRef.current =
			pointerController.invalidateCanvasRect;

		const cleanupSetup = () => {
			state.cancelled = true;
			window.clearTimeout(fallbackPlaceholderTimerRef.current);
			pointerController.detach();
			dprWatcher.stop();
			invalidatePointerCanvasRectRef.current = () => {};
			state.cleanup = undefined;
			stateRef.current = null;
			drawLoopRef.current = null;
			fatalErrorRef.current = null;
			resetLayers();
		};

		if (prefersReducedMotion || prefersReducedMotionSync()) return cleanupSetup;

		let disposeRuntime: (() => void) | undefined;

		async function start() {
			const activeCanvas = canvasRef.current;
			if (!activeCanvas || !navigator.gpu) {
				// No WebGPU: the static SVG becomes the permanent render; show it
				// immediately instead of leaving the hero blank for the timer delay.
				handleFallback();
				return;
			}
			const context = activeCanvas.getContext("webgpu");
			if (!context || !("configure" in context)) {
				handleFallback();
				return;
			}

			const mesh = await loadMesh(modelUrl);
			if (state.cancelled) return;
			state.activeMesh = mesh;
			// Mesh is in: cancel the placeholder timer so only genuinely slow
			// networks ever show it. Remaining GPU init/pipeline compile time
			// stays calmly blank instead of flashing SVG -> render.
			window.clearTimeout(fallbackPlaceholderTimerRef.current);
			// Frame the real mark: it is wider than tall, so a height-only fit
			// would clip the silhouette at both canvas edges.
			controlsRef.current.radius = cameraRadiusForBounds(
				DEFAULT_CAMERA_FOV,
				mesh.bounds,
				LOGO_VIEWPORT_ASPECT,
			);
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => resolve()),
			);
			resizeCanvas(activeCanvas, canvasLayoutRef, devicePixelRatioRef);

			const app = await App.create({ adapter: new BrowserAdapter() });
			if (state.cancelled) {
				app.device.destroy();
				return;
			}

			const format = navigator.gpu.getPreferredCanvasFormat();
			context.configure({
				device: app.device.gpu,
				format,
				alphaMode: "premultiplied",
			});
			if (state.cancelled) {
				app.device.destroy();
				return;
			}
			const renderer = createEve5Renderer(app.device, format, mesh, {
				theme: "dark",
				bloom: true,
				backRefraction: false,
			});
			let disposed = false;
			const runtime: RuntimeOwner = {};
			state.previousFrameTime = performance.now();
			state.autoRotateStartTime = state.previousFrameTime;

			const dispose = () => {
				if (disposed) return;
				disposed = true;
				drawLoopRef.current = null;
				fatalErrorRef.current = null;
				runtime.drawLoopDispose?.();
				// No handleFallback here: fatal paths (device lost, render throw)
				// call it explicitly before dispose, and on remount a re-shown
				// placeholder would flash SVG -> render again.
				renderer.dispose();
				app.device.destroy();
				disposeRuntime = undefined;
			};
			disposeRuntime = dispose;

			void app.device.gpu.lost.then((info) => {
				if (state.cancelled || disposed || info?.reason === "destroyed") return;
				handleFallback();
				state.cancelled = true;
				dispose();
			});

			const drawLoop = createDrawLoop({
				state,
				canvas: activeCanvas,
				context,
				renderer,
				controlsRef,
				canvasLayoutRef,
				devicePixelRatioRef,
				onCanvasRevealed: handleCanvasRevealed,
				onFallback: handleFallback,
				onFatalError: handleFatalError,
			});
			runtime.drawLoopDispose = drawLoop.dispose;
			drawLoopRef.current = drawLoop;
			fatalErrorRef.current = dispose;
			requestRender();
			return dispose;
		}

		void start()
			.then((dispose) => {
				state.cleanup = dispose;
			})
			.catch(handleFallback);

		return () => {
			state.cancelled = true;
			cleanupSetup();
			disposeRuntime?.();
		};
	}, [
		prefersReducedMotion,
		modelUrl,
		coarsePointerRef,
		handleCanvasRevealed,
		handleFallback,
		handleFatalError,
		requestRender,
		resetLayers,
	]);

	return (
		<div
			ref={containerRef}
			{...stylex.props(rendererStyles.element, rendererStyles.container)}
			aria-hidden="true"
		>
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
			<canvas
				ref={canvasRef}
				{...stylex.props(
					rendererStyles.element,
					rendererStyles.layer,
					rendererStyles.canvas,
					canvasReady && rendererStyles.canvasReady,
				)}
			/>
		</div>
	);
}
