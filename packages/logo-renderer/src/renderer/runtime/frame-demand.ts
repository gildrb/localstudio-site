import { ATMOSPHERE_INTRO_DURATION } from "../render/intro";
import { evePointerInteractionMode } from "../mobile-motion";
import type { HeroRuntimeState } from "./state";
import type { ImprintRenderOptions } from "../render";
import {
	CANVAS_REVEAL_RENDER_COUNT,
	MOBILE_AUTO_ROTATE_DURATION_MS,
	type FrameClock,
} from "./frame-state";

const RIPPLE_DURATION_SECONDS = 1.0;
const RIPPLE_IDLE_INTERVAL_MS = 2400;
const PAINT_SETTLE_DURATION_MS = 750;
const INTRO_POSE_HOLD_SECONDS = 2;
const SETTLE_EPSILON = 0.0005;

export function advanceIntro<TargetResource>(
	clock: FrameClock,
	atmosphere: ImprintRenderOptions<TargetResource>["atmosphere"],
	visibleDelta: number,
) {
	clock.atmosphereTime += visibleDelta;
	// GPU warmup must not consume the entrance. stop/start resets the frame
	// origin, so hidden tabs and offscreen pauses do not skip the sequence.
	if (clock.introEnabled && atmosphere) {
		if (clock.successfulRenderCount >= CANVAS_REVEAL_RENDER_COUNT) {
			clock.introVisibleTime += visibleDelta;
			clock.introTime = Math.min(ATMOSPHERE_INTRO_DURATION, clock.introVisibleTime);
		}
		atmosphere.introTime = clock.introTime;
	}
}

export function holdsIntroPose(clock: Readonly<FrameClock>) {
	return (
		clock.introEnabled &&
		clock.introVisibleTime < Math.max(INTRO_POSE_HOLD_SECONDS, ATMOSPHERE_INTRO_DURATION)
	);
}

export function advanceRipple(state: HeroRuntimeState, frameTime: number) {
	const idleRippleDue =
		state.pointerInsideCanvas &&
		state.hasBrushCell &&
		frameTime - state.lastBrushMoveTime > RIPPLE_IDLE_INTERVAL_MS &&
		frameTime - state.lastRippleSpawnTime > RIPPLE_IDLE_INTERVAL_MS;
	if (idleRippleDue) {
		state.rippleCellX = state.brushCellX;
		state.rippleCellY = state.brushCellY;
		state.rippleStartTime = frameTime;
		state.lastRippleSpawnTime = frameTime;
	}
	const rippleAge = (frameTime - state.rippleStartTime) / 1000;
	return rippleAge >= 0 && rippleAge < RIPPLE_DURATION_SECONDS;
}

export function needsMeshFrame(
	state: Readonly<Omit<HeroRuntimeState, "activeMesh">>,
	clock: Readonly<FrameClock>,
	frameTime: number,
	poseHeld: boolean,
	targetOpening: number,
	rippleActive: boolean,
	introActive: boolean,
) {
	const pointerSettling =
		!poseHeld &&
		(Math.abs(state.mouseEnvYaw - state.targetMouseEnvYaw) > SETTLE_EPSILON ||
			Math.abs(state.mouseEnvPitch - state.targetMouseEnvPitch) > SETTLE_EPSILON ||
			Math.abs(state.asciiMouseX - state.targetAsciiMouseX) > SETTLE_EPSILON ||
			Math.abs(state.asciiMouseY - state.targetAsciiMouseY) > SETTLE_EPSILON);
	const openingSettling = state.depthOpening !== targetOpening;
	const autoRotating =
		!poseHeld &&
		!state.staticPose &&
		evePointerInteractionMode(state.isCoarsePointer).autoRotateEnvYaw &&
		frameTime - state.autoRotateStartTime < MOBILE_AUTO_ROTATE_DURATION_MS;
	const paintSettling = frameTime - state.lastBrushMoveTime < PAINT_SETTLE_DURATION_MS;
	return !(
		clock.successfulRenderCount >= CANVAS_REVEAL_RENDER_COUNT &&
		(!clock.introEnabled || introActive || clock.introRenderedTime === ATMOSPHERE_INTRO_DURATION) &&
		!state.renderRequested &&
		!pointerSettling &&
		!openingSettling &&
		!autoRotating &&
		!paintSettling &&
		!rippleActive &&
		// Only pointer painting needs idle ripples and continuous shimmer.
		!(state.paintOnHover && state.pointerInsideCanvas)
	);
}
