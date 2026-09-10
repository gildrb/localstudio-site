import type { Surface } from "vgpu";
import { ATMOSPHERE_INTRO_DURATION } from "../render/intro";
import { advanceIntro, advanceRipple, holdsIntroPose, needsMeshFrame } from "./frame-demand";
import { updateControls, updateInteraction } from "./frame-interaction";
import { renderIdleFrame, renderMeshFrame } from "./frame-rendering";
import {
	CANVAS_REVEAL_RENDER_COUNT,
	MAX_FRAME_DELTA_SECONDS,
	type FrameClock,
	type FrameLoopOptions,
} from "./frame-state";

export function stepFrame<CanvasSurface extends Pick<Surface, "resize">, AtmosphereTarget>(
	options: FrameLoopOptions<CanvasSurface, AtmosphereTarget>,
	clock: FrameClock,
	frameTime = performance.now(),
) {
	const { state, atmosphere } = options;
	if (!clock.running || state.cancelled) return false;
	const visibleDelta = Math.min(
		MAX_FRAME_DELTA_SECONDS,
		Math.max(0, (frameTime - state.previousFrameTime) / 1000),
	);
	advanceIntro(clock, atmosphere?.current, visibleDelta);
	const introActive = clock.introEnabled && clock.introTime < ATMOSPHERE_INTRO_DURATION;
	const poseHeld = holdsIntroPose(clock);
	if (poseHeld) state.autoRotateStartTime = frameTime;
	// Limit startup mesh work to 30 fps; the settled renderer remains event-driven.
	if (
		introActive &&
		clock.successfulRenderCount >= CANVAS_REVEAL_RENDER_COUNT &&
		frameTime - clock.lastAtmosphereFrame < 1000 / 30
	) {
		state.previousFrameTime = frameTime;
		return true;
	}
	const targetOpening = Number(
		!poseHeld && state.depthReveal && !state.isCoarsePointer && state.pointerInsideCanvas,
	);
	const rippleActive = advanceRipple(state, frameTime);
	if (
		!needsMeshFrame(state, clock, frameTime, poseHeld, targetOpening, rippleActive, introActive)
	) {
		return renderIdleFrame(options, clock, frameTime);
	}
	state.renderRequested = false;
	const deltaSeconds = visibleDelta;
	state.previousFrameTime = frameTime;
	updateInteraction(state, frameTime, poseHeld ? 0 : deltaSeconds);
	updateControls(
		state,
		options.controlsRef.current,
		frameTime,
		deltaSeconds,
		targetOpening,
		poseHeld,
		clock.introEnabled,
		clock.successfulRenderCount,
	);
	return renderMeshFrame(options, clock, frameTime, deltaSeconds, rippleActive);
}
