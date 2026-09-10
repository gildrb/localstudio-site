import type { Surface, Target } from "vgpu";
import { evePointerInteractionMode } from "../mobile-motion";
import { stepFrame } from "./frame-step";
import type { FrameClock, FrameLoopOptions } from "./frame-state";

export { advanceDepthOpening } from "./frame-interaction";

export type DrawLoop = {
	readonly start: () => void;
	readonly stop: () => void;
	readonly step: (frameTime?: number) => boolean;
	readonly dispose: () => void;
};

export function createDrawLoop<
	CanvasSurface extends Pick<Surface, "resize">,
	AtmosphereTarget = Target,
>(options: FrameLoopOptions<CanvasSurface, AtmosphereTarget>): DrawLoop {
	const { state } = options;
	const clock: FrameClock = {
		successfulRenderCount: 0,
		running: false,
		atmosphereTime: 0,
		introEnabled: options.atmosphere?.current?.introTime !== undefined,
		introTime: 0,
		introVisibleTime: 0,
		introRenderedTime: -1,
		lastAtmosphereFrame: Number.NEGATIVE_INFINITY,
	};
	const start = () => {
		if (clock.running) return;
		clock.running = true;
		clock.lastAtmosphereFrame = Number.NEGATIVE_INFINITY;
		const frameTime = performance.now();
		state.previousFrameTime = frameTime;
		state.renderRequested = true;
		if (!state.staticPose && evePointerInteractionMode(state.isCoarsePointer).autoRotateEnvYaw) {
			state.autoRotateStartTime = frameTime;
		}
	};
	const stop = () => {
		clock.running = false;
	};
	return {
		start,
		stop,
		step: (stepFrame<CanvasSurface, AtmosphereTarget>).bind(null, options, clock),
		dispose: stop,
	};
}
