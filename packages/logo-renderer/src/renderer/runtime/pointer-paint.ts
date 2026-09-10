import { evePointerInteractionMode } from "../mobile-motion";
import {
	bloomRadiusForDevicePixelRatio,
	mapClientPointToPaintCell,
	type MeshData,
} from "../render";
import { getEffectiveDevicePixelRatio } from "./canvas-sizing";
import type { PointerOptions, PointerPosition, CanvasRectReader } from "./pointer-state";
import type { HeroRuntimeState } from "./state";

const PAINT_POINTER_MOVE_EPSILON_PX = 0.5;

export function deactivateBrush(state: HeroRuntimeState, requestRender: () => void) {
	if (state.staticPose) {
		state.targetAsciiMouseX = 0;
		state.targetAsciiMouseY = 0;
	}
	state.targetBrushActive = false;
	state.pointerInsideCanvas = false;
	requestRender();
	state.hasBrushCell = false;
	state.hasRenderedBrushCell = false;
	state.lastPointerClientX = undefined;
	state.lastPointerClientY = undefined;
	state.lastBrushMoveTime = Number.NEGATIVE_INFINITY;
}

function mapBrush(
	options: PointerOptions,
	event: PointerPosition,
	canvas: Readonly<Pick<HTMLCanvasElement, "width" | "height">>,
	mesh: Pick<MeshData, "bounds">,
	rect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
) {
	const { canvasLayoutRef, devicePixelRatioRef, controlsRef, state } = options;
	const layout = canvasLayoutRef.current;
	const devicePixelRatio = getEffectiveDevicePixelRatio(
		layout.width,
		layout.height,
		devicePixelRatioRef.current,
	);
	const paddingRadius = bloomRadiusForDevicePixelRatio(devicePixelRatio);
	const logicalWidth = Math.max(1, canvas.width - paddingRadius * 2);
	const logicalHeight = Math.max(1, canvas.height - paddingRadius * 2);
	return mapClientPointToPaintCell({
		clientX: event.clientX,
		clientY: event.clientY,
		rect,
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
		logicalWidth,
		logicalHeight,
		controls: controlsRef.current,
		meshBounds: mesh.bounds,
		gridScaleMultiplier: state.paintGridScaleMultiplier,
		paddingRadius,
		devicePixelRatio,
	});
}

export function updatePaintBrush(
	options: PointerOptions,
	getCanvasRect: CanvasRectReader,
	event: PointerPosition,
) {
	const { state, canvasRef, requestRender } = options;
	const canvas = canvasRef.current;
	const mesh = state.activeMesh;
	if (!state.paintOnHover) {
		state.targetBrushActive = false;
		return;
	}
	if (
		!canvas ||
		!mesh ||
		event.pointerType !== "mouse" ||
		!evePointerInteractionMode(state.isCoarsePointer).paintEnabled
	) {
		deactivateBrush(state, requestRender);
		return;
	}
	const rect = getCanvasRect();
	if (!rect) {
		deactivateBrush(state, requestRender);
		return;
	}
	const mapping = mapBrush(options, event, canvas, mesh, rect);
	if (mapping?.insideLogicalBounds !== true) {
		deactivateBrush(state, requestRender);
		return;
	}
	commitBrushCell(state, event, mapping.brushCell, requestRender);
}

function commitBrushCell(
	state: HeroRuntimeState,
	event: PointerPosition,
	brushCell: readonly [number, number],
	requestRender: () => void,
) {
	const nextBrushCellX = brushCell[0];
	const nextBrushCellY = brushCell[1];
	const pointerMoved =
		state.lastPointerClientX === undefined ||
		state.lastPointerClientY === undefined ||
		Math.hypot(
			event.clientX - state.lastPointerClientX,
			event.clientY - state.lastPointerClientY,
		) >= PAINT_POINTER_MOVE_EPSILON_PX;
	if (pointerMoved) {
		state.lastBrushMoveTime = performance.now();
	}
	state.brushCellX = nextBrushCellX;
	state.brushCellY = nextBrushCellY;
	state.hasBrushCell = true;
	state.lastPointerClientX = event.clientX;
	state.lastPointerClientY = event.clientY;
	state.targetBrushActive = true;
	requestRender();
}

export function spawnRippleAtBrushCell(state: HeroRuntimeState, requestRender: () => void) {
	// Without a resolved brush cell (fast entry, first frame) the ripple would
	// fire from a stale cell, so only spawn once the brush mapped a position.
	if (!state.hasBrushCell) return;
	state.rippleCellX = state.brushCellX;
	state.rippleCellY = state.brushCellY;
	state.rippleStartTime = performance.now();
	state.lastRippleSpawnTime = state.rippleStartTime;
	requestRender();
}
