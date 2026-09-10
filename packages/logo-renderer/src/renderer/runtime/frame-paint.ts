import type { PaintRenderOptions } from "../render/types";
import {
	DEFAULT_PAINT_BRUSH_RADIUS,
	DEFAULT_PAINT_BRUSH_STRENGTH,
	DEFAULT_PAINT_DECAY_PER_FRAME_120,
	DEFAULT_PAINT_DIFFUSION_JITTER,
	DEFAULT_PAINT_DIFFUSION_RATE,
} from "../render";
import type { HeroRuntimeState } from "./state";

const RIPPLE_STRENGTH = 18.0;
const PAINT_MOVEMENT_GRACE_MS = 72;

export function framePaint(
	state: Readonly<Omit<HeroRuntimeState, "activeMesh">>,
	frameTime: number,
	deltaSeconds: number,
	rippleActive: boolean,
): PaintRenderOptions {
	const brushPreviousCell: readonly [number, number] = state.hasRenderedBrushCell
		? [state.previousRenderedBrushCellX, state.previousRenderedBrushCellY]
		: [state.brushCellX, state.brushCellY];
	const brushCanWrite =
		state.brushActive && frameTime - state.lastBrushMoveTime <= PAINT_MOVEMENT_GRACE_MS;
	const rippleAge = (frameTime - state.rippleStartTime) / 1000;
	return {
		dt: deltaSeconds,
		brushCell: [state.brushCellX, state.brushCellY],
		brushPreviousCell,
		brushRadius: DEFAULT_PAINT_BRUSH_RADIUS * 1.5,
		brushStrength: DEFAULT_PAINT_BRUSH_STRENGTH,
		brushActive: brushCanWrite,
		decayRate: DEFAULT_PAINT_DECAY_PER_FRAME_120 * 120,
		diffusionRate: DEFAULT_PAINT_DIFFUSION_RATE,
		diffusionJitter: DEFAULT_PAINT_DIFFUSION_JITTER,
		ripple: rippleActive
			? {
					center: [state.rippleCellX, state.rippleCellY],
					age: rippleAge,
					strength: RIPPLE_STRENGTH,
				}
			: undefined,
	};
}
