import { useMemo, useRef } from "react";
import { useSyncedRef } from "phase/react";
import {
	DEFAULT_CAMERA_FOV,
	DEFAULT_OBJECT_YAW,
	cameraRadiusForFov,
	type RenderControls,
} from "../render";
import type { CanvasLayout } from "./canvas-sizing";
import type { HeroRuntimeState } from "./state";
import type { DrawLoop } from "./frame-loop";

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

export function useRendererRefs(material: "glass" | "metallic", coarsePointer: boolean) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const controlsRef = useRef<RenderControls>({ ...DEFAULT_CONTROLS, material });
	const canvasLayoutRef = useRef<CanvasLayout>(INITIAL_CANVAS_LAYOUT);
	const devicePixelRatioRef = useRef(1);
	const coarsePointerRef = useSyncedRef(coarsePointer);
	const stateRef = useRef<HeroRuntimeState | null>(null);
	const drawLoopRef = useRef<DrawLoop | null>(null);
	const runLoopRef = useRef(() => {});
	const invalidatePointerCanvasRectRef = useRef(() => {});
	const fatalErrorRef = useRef<(() => void) | null>(null);
	return useMemo(
		() => ({
			containerRef,
			canvasRef,
			controlsRef,
			canvasLayoutRef,
			devicePixelRatioRef,
			coarsePointerRef,
			stateRef,
			drawLoopRef,
			runLoopRef,
			invalidatePointerCanvasRectRef,
			fatalErrorRef,
		}),
		[
			containerRef,
			canvasRef,
			controlsRef,
			canvasLayoutRef,
			devicePixelRatioRef,
			coarsePointerRef,
			stateRef,
			drawLoopRef,
			runLoopRef,
			invalidatePointerCanvasRectRef,
			fatalErrorRef,
		],
	);
}

export type RendererRefs = ReturnType<typeof useRendererRefs>;
export type RendererCallbacks = {
	readonly requestRender: () => void;
	readonly handleCanvasRevealed: () => void;
	readonly handleFallback: () => void;
	readonly resetLayers: () => void;
	readonly handleFatalError: () => void;
};
