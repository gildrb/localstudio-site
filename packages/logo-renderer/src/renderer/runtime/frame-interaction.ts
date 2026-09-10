import { clamp01, lerp } from "phase/ease";
import { evePointerInteractionMode, mobileAutoEnvYaw } from "../mobile-motion";
import type { RenderControls } from "../render";
import type { HeroRuntimeState } from "./state";
import { CANVAS_REVEAL_RENDER_COUNT, MOBILE_AUTO_ROTATE_DURATION_MS } from "./frame-state";

const ENV_ROTATION_LERP_SPEED = 2.5;
const ASCII_MOUSE_LERP_SPEED = 6;
const POINTER_OBJECT_YAW_RANGE = 0.42;
const POINTER_OBJECT_PITCH_RANGE = 0.2;
const MOBILE_OBJECT_YAW_RANGE = 0.28;
const MOBILE_OBJECT_PITCH_RANGE = 0.08;

export function advanceDepthOpening(current: number, target: number, deltaSeconds: number) {
	const step = Math.max(0, deltaSeconds) / 0.3;
	if (Math.abs(target - current) <= step + Number.EPSILON * 4) return target;
	return target > current ? current + step : current - step;
}

export function updateInteraction(
	state: HeroRuntimeState,
	frameTime: number,
	interactionDelta: number,
) {
	if (!state.staticPose && evePointerInteractionMode(state.isCoarsePointer).autoRotateEnvYaw) {
		state.targetMouseEnvYaw = mobileAutoEnvYaw(
			Math.min(frameTime - state.autoRotateStartTime, MOBILE_AUTO_ROTATE_DURATION_MS) / 1000,
		);
		state.targetMouseEnvPitch = 0;
		state.targetBrushActive = false;
	}
	state.mouseEnvYaw = lerp(
		state.mouseEnvYaw,
		state.targetMouseEnvYaw,
		clamp01(interactionDelta * ENV_ROTATION_LERP_SPEED),
	);
	state.mouseEnvPitch = lerp(
		state.mouseEnvPitch,
		state.targetMouseEnvPitch,
		clamp01(interactionDelta * ENV_ROTATION_LERP_SPEED),
	);
	state.asciiMouseX = lerp(
		state.asciiMouseX,
		state.targetAsciiMouseX,
		clamp01(interactionDelta * ASCII_MOUSE_LERP_SPEED),
	);
	state.asciiMouseY = lerp(
		state.asciiMouseY,
		state.targetAsciiMouseY,
		clamp01(interactionDelta * ASCII_MOUSE_LERP_SPEED),
	);
}

export function updateControls(
	state: HeroRuntimeState,
	controls: RenderControls,
	frameTime: number,
	deltaSeconds: number,
	targetOpening: number,
	poseHeld: boolean,
	introEnabled: boolean,
	successfulRenderCount: number,
) {
	if (successfulRenderCount >= CANVAS_REVEAL_RENDER_COUNT) {
		state.depthOpening = advanceDepthOpening(state.depthOpening, targetOpening, deltaSeconds);
	}
	const opening = state.depthOpening;
	controls.depthOpening = opening * opening * (3 - 2 * opening);
	state.brushActive = state.targetBrushActive && state.hasBrushCell;
	controls.envYaw = state.mouseEnvYaw;
	controls.envPitch = state.mouseEnvPitch;
	if (poseHeld) {
		controls.yaw = state.baseObjectYaw;
		controls.pitch = 0;
	} else if (
		!state.staticPose &&
		evePointerInteractionMode(state.isCoarsePointer).autoRotateEnvYaw
	) {
		controls.yaw = state.baseObjectYaw + Math.sin(state.mouseEnvYaw) * MOBILE_OBJECT_YAW_RANGE;
		controls.pitch =
			Math.cos(state.mouseEnvYaw * 0.7) *
			MOBILE_OBJECT_PITCH_RANGE *
			(introEnabled ? clamp01((frameTime - state.autoRotateStartTime) / 300) : 1);
	} else {
		// Orbit-follow: positive yaw/pitch move the camera right/up, so the face
		// reads as turning away from the pointer. Invert both so the mark tracks
		// the cursor: cursor right -> face right, cursor up -> face up.
		controls.yaw = state.baseObjectYaw - state.asciiMouseX * POINTER_OBJECT_YAW_RANGE;
		controls.pitch = state.asciiMouseY * POINTER_OBJECT_PITCH_RANGE;
	}
}
