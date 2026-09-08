import * as stylex from "@stylexjs/stylex";
import { init, surface } from "vgpu";
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
import { useEffect, useRef, useState, type RefObject } from "react";
import {
	DEFAULT_CAMERA_FOV,
	DEFAULT_OBJECT_YAW,
	DEFAULT_IMPRINT_GRID_SCALE_MULTIPLIER,
	cameraRadiusForBounds,
	cameraRadiusForFov,
	createEve5Renderer,
	type RenderControls,
	type ImprintRenderOptions,
} from "./render";
import { resizeCanvas, type CanvasLayout } from "./runtime/canvas-sizing";
import { rendererTimes } from "./renderer-tokens.stylex";
import { createDrawLoop, type DrawLoop } from "./runtime/frame-loop";
import { loadMesh } from "./runtime/load-mesh";
import { createAtmosphereSurface } from "./runtime/atmosphere-surface";
import {
	createPointerController,
	syncPointerInteractionMode,
} from "./runtime/pointer-input";
import type { HeroRuntimeState } from "./runtime/state";

const LOGO_VIEWPORT_ASPECT = 1.52;

const DEFAULT_CONTROLS: RenderControls = {
	yaw: DEFAULT_OBJECT_YAW,
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
		opacity: 1,
	},
	canvasPending: { visibility: "hidden" },
	fallback: {
		maxWidth: "100%",
		userSelect: "none",
		paddingTop: "9.5%",
		paddingRight: "9.5%",
		paddingBottom: "9.5%",
		paddingLeft: "9.5%",
		objectFit: "contain",
		opacity: 0,
		filter: {
			default: "invert(1)",
			"@media (prefers-color-scheme: light)": "none",
		},
		transitionProperty: "opacity",
		transitionDuration: rendererTimes.fade,
		transitionTimingFunction: "ease-out",
	},
	fallbackVisible: { opacity: 0.16 },
	posterImage: {
		display: "block",
		width: "100%",
		height: "100%",
	},
});

type RuntimeOwner = {
	drawLoopDispose?: () => void;
};

export type LogoRendererAssets = {
	modelUrl: string;
	fallbackUrl?: string | undefined;
	dayUrl: string;
	nightUrl: string;
};

// Static first-frame poster on the exact canvas stage. The site shows it until
// the live renderer reports its first frame (see onFirstFrame).
export function LogoPoster({ dayUrl, nightUrl, sx }: {
	dayUrl: string;
	nightUrl: string;
	sx?: stylex.StyleXStyles | undefined;
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

type AtmosphereSettings = Pick<NonNullable<ImprintRenderOptions["atmosphere"]>, "prism" | "beamOpacity" | "dayRoom">;

export type LocalAiLogoShaderProps = LogoRendererAssets & {
	/** One-shot actual-aperture entrance; omission preserves the steady renderer. */
	atmosphereIntro?: boolean | undefined;
	/** Host-selected lighting policy; omission keeps the neutral atmosphere. */
	atmosphereSettings?: AtmosphereSettings | undefined;
	/** Full-section canvas sharing this renderer's device, light and silhouette. */
	atmosphereRef?: RefObject<HTMLCanvasElement | null> | undefined;
	atmosphereForegroundRef?: RefObject<HTMLCanvasElement | null> | undefined;
	/** Opaque intro presentation above the unchanged steady canvas stack. */
	atmosphereIntroRef?: RefObject<HTMLCanvasElement | null> | undefined;
	/** Lets the host hide stale layers while the renderer initializes or restarts. */
	onPending?: (() => void) | undefined;
	/** Fires once when the live canvas has produced its first frame. */
	onFirstFrame?: (() => void) | undefined;
	/** Lets the host restore its poster after renderer failure. */
	onFallback?: (() => void) | undefined;
	/** Stage layout override (position/size) applied after the default stage. */
	sx?: stylex.StyleXStyles | undefined;
	/** Camera framing aspect; defaults to the hero stage's 1.52. */
	viewportAspect?: number | undefined;
	/** Enables the pointer-painted square imprint. */
	paintOnHover?: boolean | undefined;
	/** Opens the rear glass depth during pointer interaction, never on entry. */
	depthReveal?: boolean | undefined;
	material?: "glass" | "metallic" | undefined;
	environment?: "sky" | "studio" | undefined;
	/** Locks the canonical environment for decorative instances; the object still follows the cursor. */
	staticPose?: boolean | undefined;
};

export function LocalAiLogoShader({
	modelUrl,
	fallbackUrl,
	dayUrl,
	nightUrl,
	onPending,
	onFirstFrame,
	onFallback,
	atmosphereRef,
	atmosphereForegroundRef,
	atmosphereIntroRef,
	atmosphereSettings,
	atmosphereIntro = false,
	sx,
	viewportAspect = LOGO_VIEWPORT_ASPECT,
	paintOnHover = true,
	depthReveal = false,
	material = "glass",
	environment = "sky",
	staticPose = false,
}: LocalAiLogoShaderProps) {
	const prismAtmosphere = atmosphereSettings?.prism ?? false;
	const atmosphereBeamOpacity = atmosphereSettings?.beamOpacity;
	const atmosphereDayRoom = atmosphereSettings?.dayRoom;
	const prefersReducedMotion = usePrefersReducedMotion();
	const prefersDarkScheme = useMediaQuery("(prefers-color-scheme: dark)");
	const coarsePointer = useMediaQuery("(pointer: coarse)");
	const containerRef = useRef<HTMLDivElement>(null);
	const { size: containerSize } = useSize({ ref: containerRef });
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const controlsRef = useRef<RenderControls>({ ...DEFAULT_CONTROLS, material });
	const canvasLayoutRef = useRef<CanvasLayout>(INITIAL_CANVAS_LAYOUT);
	const devicePixelRatioRef = useRef(1);
	const coarsePointerRef = useSyncedRef(coarsePointer);
	const stateRef = useRef<HeroRuntimeState | null>(null);
	const drawLoopRef = useRef<DrawLoop | null>(null);
	const [fallbackVisible, setFallbackVisible] = useState(true);
	const runLoopRef = useRef(() => {});
	const invalidatePointerCanvasRectRef = useRef(() => {});
	const requestRender = useStableCallback(() => {
		if (stateRef.current) stateRef.current.renderRequested = true;
		runLoopRef.current();
	});
	const handleCanvasRevealed = useStableCallback(() => {
		if (!stateRef.current?.cancelled) {
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
	const fatalErrorRef = useRef<(() => void) | null>(null);
	const handleFatalError = useStableCallback(() => fatalErrorRef.current?.());

	const { isActive } = useLifecycle<HTMLElement>({
		ref: atmosphereRef ?? containerRef,
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
			staticPose,
			rippleCellX: 0,
			rippleCellY: 0,
			rippleStartTime: Number.NEGATIVE_INFINITY,
			lastRippleSpawnTime: Number.NEGATIVE_INFINITY,
			pointerInsideCanvas: false,
			isCoarsePointer: coarsePointerRef.current,
			paintOnHover,
			depthReveal,
			depthOpening: 0,
			baseObjectYaw: material === "metallic" ? 0 : DEFAULT_OBJECT_YAW,
		};
		controlsRef.current.material = material;
		controlsRef.current.insideRendering = material === "glass";
		controlsRef.current.yaw = state.baseObjectYaw;
		if (staticPose || atmosphereIntro) {
			state.mouseEnvYaw = 0;
			state.targetMouseEnvYaw = 0;
			state.mouseEnvPitch = 0;
			state.targetMouseEnvPitch = 0;
		}
		stateRef.current = state;

		resetLayers();
		if (prefersReducedMotion || prefersReducedMotionSync()) {
			handleFallback();
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
				// No WebGPU: let the host show the permanent static fallback.
				handleFallback();
				return;
			}
			const mesh = await loadMesh(modelUrl);
			if (state.cancelled) return;
			state.activeMesh = mesh;
			// Frame the real mark: it is wider than tall, so a height-only fit
			// would clip the silhouette at both canvas edges.
			controlsRef.current.radius = cameraRadiusForBounds(
				DEFAULT_CAMERA_FOV,
				mesh.bounds,
				viewportAspect,
			);
			const initialRect = containerRef.current?.getBoundingClientRect();
			if (initialRect && initialRect.width > 0 && initialRect.height > 0) {
				canvasLayoutRef.current = { width: initialRect.width, height: initialRect.height };
			}
			resizeCanvas(activeCanvas, canvasLayoutRef, devicePixelRatioRef);

			const gpu = await init();
			if (state.cancelled) {
				gpu.dispose();
				return;
			}
			const canvasSurface = surface(gpu, activeCanvas, {
				autoResize: false,
				size: [activeCanvas.width, activeCanvas.height],
				alphaMode: "premultiplied",
			});
			const atmosphere = atmosphereRef?.current
				? createAtmosphereSurface(gpu, atmosphereRef.current, activeCanvas, requestRender, atmosphereForegroundRef?.current ?? undefined,
					prismAtmosphere ? { scale: 1, maxEdge: 1280 } : undefined)
				: undefined;
			if (atmosphere) {
				if (atmosphereIntro) atmosphere.current.introTime = 0;
				atmosphere.current.prism = prismAtmosphere;
				if (atmosphereBeamOpacity !== undefined) atmosphere.current.beamOpacity = atmosphereBeamOpacity;
				if (atmosphereDayRoom !== undefined) atmosphere.current.dayRoom = atmosphereDayRoom;
			}
			let environmentAtlas: ImageBitmap | undefined;
			try {
				if (environment === "sky") {
					const environmentUrl = prefersDarkScheme ? nightUrl : dayUrl;
					const response = await fetch(environmentUrl);
					if (response.ok) environmentAtlas = await createImageBitmap(await response.blob());
				}
			} catch {
				// The generated cubemap remains available when the image cannot load.
			}
			if (state.cancelled) {
				environmentAtlas?.close();
				atmosphere?.dispose();
				canvasSurface.dispose();
				gpu.dispose();
				return;
			}
			const rendererOptions: NonNullable<Parameters<typeof createEve5Renderer>[2]> = {
				// Day/night selects the sky atlas, not a pale mask composite.
				theme: "dark",
				environmentTheme: prefersDarkScheme ? "dark" : "light",
				bloom: true,
				backRefraction: material === "glass",
			};
			if (environmentAtlas) rendererOptions.environmentAtlas = environmentAtlas;
			const renderer = createEve5Renderer(gpu, mesh, rendererOptions);
			environmentAtlas?.close();
			let disposed = false;
			let unsubscribeGpuError = () => {};
			const runtime: RuntimeOwner = {};
			state.previousFrameTime = performance.now();
			state.autoRotateStartTime = state.previousFrameTime;

			const dispose = () => {
				if (disposed) return;
				disposed = true;
				drawLoopRef.current = null;
				fatalErrorRef.current = null;
				runtime.drawLoopDispose?.();
				unsubscribeGpuError();
				// No handleFallback here: fatal paths (device lost, render throw)
				// call it explicitly before dispose, and on remount a re-shown
				// placeholder would flash SVG -> render again.
				renderer.dispose();
				atmosphere?.dispose();
				canvasSurface.dispose();
				gpu.dispose();
				disposeRuntime = undefined;
			};
			disposeRuntime = dispose;
			unsubscribeGpuError = gpu.onError(() => {
				if (state.cancelled || disposed) return;
				handleFallback();
				state.cancelled = true;
				dispose();
			});

			void gpu.gpu.lost.then((info) => {
				if (state.cancelled || disposed || info?.reason === "destroyed") return;
				handleFallback();
				state.cancelled = true;
				dispose();
			});

			const drawLoop = createDrawLoop({
				state,
				canvas: activeCanvas,
				surface: canvasSurface,
				atmosphere,
				renderer,
				controlsRef,
				canvasLayoutRef,
				devicePixelRatioRef,
				onCanvasRevealed: () => {
					void gpu.device.queue.flush().then(() => {
						if (!state.cancelled && !disposed) handleCanvasRevealed();
					}).catch(() => {
						if (state.cancelled || disposed) return;
						handleFallback();
						state.cancelled = true;
						dispose();
					});
				},
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
			.catch(() => {
				if (!state.cancelled) handleFallback();
			});

		return () => {
			state.cancelled = true;
			cleanupSetup();
			disposeRuntime?.();
		};
	}, [
		prefersReducedMotion,
		prefersDarkScheme,
		modelUrl,
		atmosphereRef,
		atmosphereForegroundRef,
		atmosphereIntroRef,
		prismAtmosphere,
		atmosphereIntro,
		atmosphereBeamOpacity,
		atmosphereDayRoom,
		dayUrl,
		nightUrl,
		paintOnHover,
		depthReveal,
		material,
		environment,
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
			{...stylex.props(rendererStyles.element, rendererStyles.container, sx)}
			aria-hidden="true"
		>
			{fallbackUrl ? (
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
