import { App, Device, type VGPUAdapter } from "@vgpu/core";
import {
	createDevicePixelRatio,
	prefersReducedMotion as prefersReducedMotionSync,
} from "phase";
import {
	useLoop,
	useMediaQuery,
	usePrefersReducedMotion,
	useSize,
	useStableCallback,
	useSyncedRef,
} from "phase/react";
import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import {
	DEFAULT_CAMERA_FOV,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	DEFAULT_PAINT_BRUSH_RADIUS,
	DEFAULT_PAINT_BRUSH_STRENGTH,
	DEFAULT_PAINT_DECAY_PER_FRAME_120,
	DEFAULT_PAINT_DIFFUSION_JITTER,
	DEFAULT_PAINT_DIFFUSION_RATE,
	cameraRadiusForFov,
	createEve5Renderer,
	type RenderControls,
} from "./render";
import { resizeCanvas, type CanvasLayout } from "./runtime/canvas-sizing";
import type { EveTransitionDebugState } from "./runtime/debug-gui";
import { createDrawLoop, type DrawLoop } from "./runtime/frame-loop";
import { loadMesh, MODEL_URL } from "./runtime/load-mesh";
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

const DEFAULT_CONTROLS: RenderControls = {
	yaw: 0,
	pitch: 0,
	radius: cameraRadiusForFov(DEFAULT_CAMERA_FOV),
	fov: DEFAULT_CAMERA_FOV,
	envYaw: 0,
	envPitch: 0,
	insideRendering: true,
	outsideRendering: true,
	material: "glass",
	wireframe: false,
	showEnv: false,
};

const INITIAL_CANVAS_LAYOUT: CanvasLayout = { width: 1, height: 1 };
const LOGO_MODE_TRANSITION_DURATION_SECONDS = 0.45;
const IMPRINT_GLYPH_SCALE = 1.27;

type RuntimeOwner = {
	drawLoopDispose?: () => void;
};

export function LocalAiLogoShader() {
	preload(MODEL_URL, { as: "fetch", crossOrigin: "anonymous" });
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
	const loopPhaseRef = useRef("idle");
	const invalidatePointerCanvasRectRef = useRef(() => {});
	const fallbackRef = useRef<HTMLImageElement>(null);
	const targetLogoModeProgressRef = useRef(0);
	const targetAgentsEnvYawMixRef = useRef(0);
	const handleCanvasRevealed = useStableCallback(() => {
		if (!stateRef.current?.cancelled) {
			fallbackRef.current?.classList.add(
				"hero-logo-renderer__fallback--hidden",
			);
		}
	});
	const handleFallback = useStableCallback(() => {
		fallbackRef.current?.classList.remove(
			"hero-logo-renderer__fallback--hidden",
		);
	});
	const fatalErrorRef = useRef<(() => void) | null>(null);
	const handleFatalError = useStableCallback(() => fatalErrorRef.current?.());

	const { phase: loopPhase } = useLoop({
		ref: containerRef,
		reducedMotion: "pause",
		intersectionOptions: { threshold: 0 },
		onTick: (frame) => drawLoopRef.current?.step(frame.time),
	});

	useEffect(() => {
		loopPhaseRef.current = loopPhase;
		if (loopPhase === "running") drawLoopRef.current?.start();
		else drawLoopRef.current?.stop();
	}, [loopPhase]);

	useEffect(() => {
		if (!containerSize) return;
		canvasLayoutRef.current = containerSize;
		invalidatePointerCanvasRectRef.current();
	}, [containerSize]);

	useEffect(() => {
		const state = stateRef.current;
		if (state) syncPointerInteractionMode(state, coarsePointer);
	}, [coarsePointer]);

	useEffect(() => {
		const state: HeroRuntimeState = {
			cancelled: false,
			animationFrame: 0,
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
			agentsEnvYawMix: 0,
			previousFrameTime: performance.now(),
			autoRotateStartTime: performance.now(),
			lastBrushMoveTime: Number.NEGATIVE_INFINITY,
			lastPointerClientX: undefined,
			lastPointerClientY: undefined,
			isCoarsePointer: coarsePointerRef.current,
		};
		stateRef.current = state;

		const canvas = canvasRef.current;
		if (canvas) canvas.style.opacity = "";
		handleFallback();
		const dprWatcher = createDevicePixelRatio({
			onChange: (dpr) => {
				devicePixelRatioRef.current = dpr;
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
		});
		invalidatePointerCanvasRectRef.current =
			pointerController.invalidateCanvasRect;

		const cleanupSetup = () => {
			state.cancelled = true;
			pointerController.detach();
			dprWatcher.stop();
			invalidatePointerCanvasRectRef.current = () => {};
			state.cleanup = undefined;
			stateRef.current = null;
			drawLoopRef.current = null;
			fatalErrorRef.current = null;
			if (canvasRef.current) canvasRef.current.style.opacity = "";
		};

		if (prefersReducedMotion || prefersReducedMotionSync()) return cleanupSetup;

		let disposeRuntime: (() => void) | undefined;

		async function start() {
			const activeCanvas = canvasRef.current;
			if (!activeCanvas || !navigator.gpu) return;
			const context = activeCanvas.getContext("webgpu");
			if (!context || !("configure" in context)) return;

			const mesh = await loadMesh();
			if (state.cancelled) return;
			state.activeMesh = mesh;
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
			const renderer = createEve5Renderer(app.device, format, mesh, {
				theme: "dark",
				bloom: false,
				backRefraction: false,
			});
			let disposed = false;
			const runtime: RuntimeOwner = {};
			const modeTransitionProgressRef = { current: 0 };
			const transitionDebug: EveTransitionDebugState = {
				overrideEnabled: false,
				progress: 0,
				gridScaleMultiplier: 1.31,
				glyphScale: IMPRINT_GLYPH_SCALE,
				durationSeconds: LOGO_MODE_TRANSITION_DURATION_SECONDS,
				paintDecayPerFrame120: DEFAULT_PAINT_DECAY_PER_FRAME_120,
				diffusionAmount: DEFAULT_PAINT_DIFFUSION_RATE,
				diffusionJitter: DEFAULT_PAINT_DIFFUSION_JITTER,
				brushRadius: DEFAULT_PAINT_BRUSH_RADIUS,
				brushStrength: DEFAULT_PAINT_BRUSH_STRENGTH,
				visualizePaintBuffer: false,
			};
			state.previousFrameTime = performance.now();
			state.autoRotateStartTime = state.previousFrameTime;

			const dispose = () => {
				if (disposed) return;
				disposed = true;
				drawLoopRef.current = null;
				fatalErrorRef.current = null;
				runtime.drawLoopDispose?.();
				if (activeCanvas) activeCanvas.style.opacity = "";
				if (!state.cancelled) handleFallback();
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
				transitionDebug,
				modeTransitionProgressRef,
				targetLogoModeProgressRef,
				targetAgentsEnvYawMixRef,
				defaultMaterial: DEFAULT_CONTROLS.material,
				canvasLayoutRef,
				devicePixelRatioRef,
				onCanvasRevealed: handleCanvasRevealed,
				onFallback: handleFallback,
				onFatalError: handleFatalError,
			});
			runtime.drawLoopDispose = drawLoop.dispose;
			drawLoopRef.current = drawLoop;
			fatalErrorRef.current = dispose;
			if (loopPhaseRef.current === "running") drawLoop.start();
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
		coarsePointerRef,
		handleCanvasRevealed,
		handleFallback,
		handleFatalError,
	]);

	return (
		<div ref={containerRef} className="hero-logo-renderer" aria-hidden="true">
			<img
				ref={fallbackRef}
				className="hero-logo-renderer__fallback"
				src="/images/localai_dark.svg"
				alt=""
				draggable={false}
			/>
			<canvas ref={canvasRef} className="hero-logo-renderer__canvas" />
		</div>
	);
}
