import type { Surface } from "vgpu";
import { getCanvasLogicalSize, resizeCanvas } from "./canvas-sizing";
import type { HeroRuntimeState } from "./state";
import { framePaint } from "./frame-paint";
import { CANVAS_REVEAL_RENDER_COUNT, type FrameClock, type FrameLoopOptions } from "./frame-state";

const IMPRINT_GRID_SCALE_MULTIPLIER = 0.9;
const IMPRINT_GLYPH_SCALE = 1.27;

export function renderIdleFrame<CanvasSurface extends Pick<Surface, "resize">, AtmosphereTarget>(
	options: FrameLoopOptions<CanvasSurface, AtmosphereTarget>,
	clock: FrameClock,
	frameTime: number,
) {
	const { state, atmosphere, renderer, controlsRef, onIntroFrame, onFallback, onFatalError } =
		options;
	state.previousFrameTime = frameTime;
	if (!atmosphere?.current) return false;
	if (frameTime - clock.lastAtmosphereFrame >= 1000 / 30) {
		try {
			renderer.renderAtmosphere(controlsRef.current, {
				atmosphere: atmosphere.current,
				time: clock.atmosphereTime,
			});
			clock.lastAtmosphereFrame = frameTime;
			if (clock.introEnabled) onIntroFrame?.(clock.introTime);
		} catch {
			state.cancelled = true;
			onFallback();
			onFatalError();
			return false;
		}
	}
	return true;
}

function renderMesh<CanvasSurface extends Pick<Surface, "resize">, AtmosphereTarget>(
	options: FrameLoopOptions<CanvasSurface, AtmosphereTarget>,
	clock: Readonly<FrameClock>,
	frameTime: number,
	deltaSeconds: number,
	rippleActive: boolean,
	devicePixelRatio: number,
	logicalSize: Readonly<ReturnType<typeof getCanvasLogicalSize>>,
) {
	const { surface, renderer, controlsRef, state, atmosphere } = options;
	const { logicalWidth, logicalHeight } = logicalSize;
	state.paintGridScaleMultiplier = IMPRINT_GRID_SCALE_MULTIPLIER;
	renderer.render(surface, controlsRef.current, logicalWidth, logicalHeight, {
		progress: 0,
		gridScaleMultiplier: IMPRINT_GRID_SCALE_MULTIPLIER,
		glyphScale: IMPRINT_GLYPH_SCALE,
		time: atmosphere?.current ? clock.atmosphereTime : frameTime / 1000,
		atmosphere: atmosphere?.current,
		mouse: [state.asciiMouseX, state.asciiMouseY],
		devicePixelRatio,
		paint: framePaint(state, frameTime, deltaSeconds, rippleActive),
	});
}

export function renderMeshFrame<CanvasSurface extends Pick<Surface, "resize">, AtmosphereTarget>(
	options: FrameLoopOptions<CanvasSurface, AtmosphereTarget>,
	clock: FrameClock,
	frameTime: number,
	deltaSeconds: number,
	rippleActive: boolean,
) {
	const {
		state,
		canvas,
		surface,
		canvasLayoutRef,
		devicePixelRatioRef,
		onIntroFrame,
		onCanvasRevealed,
		onFallback,
		onFatalError,
	} = options;
	const devicePixelRatio = resizeCanvas(canvas, canvasLayoutRef, devicePixelRatioRef);
	surface.resize([canvas.width, canvas.height]);
	const logicalSize = getCanvasLogicalSize(canvas, devicePixelRatio);
	try {
		renderMesh(
			options,
			clock,
			frameTime,
			deltaSeconds,
			rippleActive,
			devicePixelRatio,
			logicalSize,
		);
		commitRenderedBrush(state, clock, frameTime);
	} catch {
		state.cancelled = true;
		onFallback();
		onFatalError();
		return false;
	}
	clock.successfulRenderCount += 1;
	if (clock.introEnabled && clock.successfulRenderCount >= CANVAS_REVEAL_RENDER_COUNT)
		onIntroFrame?.(clock.introTime);
	if (clock.successfulRenderCount === CANVAS_REVEAL_RENDER_COUNT) onCanvasRevealed();
	return true;
}

function commitRenderedBrush(state: HeroRuntimeState, clock: FrameClock, frameTime: number) {
	clock.lastAtmosphereFrame = frameTime;
	if (clock.introEnabled) clock.introRenderedTime = clock.introTime;
	if (state.hasBrushCell) {
		state.previousRenderedBrushCellX = state.brushCellX;
		state.previousRenderedBrushCellY = state.brushCellY;
		state.hasRenderedBrushCell = true;
	}
}
