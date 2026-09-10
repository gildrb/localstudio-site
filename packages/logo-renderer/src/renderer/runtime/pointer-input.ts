import { evePointerInteractionMode } from "../mobile-motion";
import type { HeroRuntimeState } from "./state";
import type { PointerOptions, PointerPosition } from "./pointer-state";
import { createCanvasRectCache, pointerInsideRect, updateEnvRotation } from "./pointer-geometry";
import { deactivateBrush, updatePaintBrush, spawnRippleAtBrushCell } from "./pointer-paint";

// Owns browser pointer input for camera orbit, environment yaw, and paint updates.
// INVARIANT: coarse-pointer mode disables paint and switches to env auto-rotate.
// Imported only by index.tsx's single effect.
export function syncPointerInteractionMode(state: HeroRuntimeState, isCoarsePointer: boolean) {
	state.isCoarsePointer = isCoarsePointer;
	state.renderRequested = true;
	if (evePointerInteractionMode(state.isCoarsePointer).autoRotateEnvYaw) {
		state.targetBrushActive = false;
		state.pointerInsideCanvas = false;
		state.targetMouseEnvPitch = 0;
		state.targetAsciiMouseX = 0;
		state.targetAsciiMouseY = 0;
		state.autoRotateStartTime = performance.now();
	}
}

export function createPointerController(options: PointerOptions) {
	const { state, coarsePointerRef, requestRender } = options;
	const { getCanvasRect, invalidateCanvasRect } = createCanvasRectCache(options);
	const deactivate = deactivateBrush.bind(null, state, requestRender);
	const onPointerMove = (event: PointerPosition) => {
		updateEnvRotation(options, getCanvasRect, event.clientX, event.clientY);
		updatePaintBrush(options, getCanvasRect, event);
		const inside =
			event.pointerType === "mouse" &&
			pointerInsideRect(getCanvasRect, event.clientX, event.clientY);
		if (
			inside &&
			!state.pointerInsideCanvas &&
			evePointerInteractionMode(state.isCoarsePointer).paintEnabled
		) {
			spawnRippleAtBrushCell(state, requestRender);
		}
		state.pointerInsideCanvas = inside;
	};
	syncPointerInteractionMode(state, coarsePointerRef.current);
	window.addEventListener("pointermove", onPointerMove, { passive: true });
	window.addEventListener("scroll", invalidateCanvasRect, { passive: true });
	window.addEventListener("resize", invalidateCanvasRect, { passive: true });
	window.addEventListener("pointerout", deactivate, { passive: true });
	window.addEventListener("blur", deactivate);

	return {
		invalidateCanvasRect,
		detach() {
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("scroll", invalidateCanvasRect);
			window.removeEventListener("resize", invalidateCanvasRect);
			window.removeEventListener("pointerout", deactivate);
			window.removeEventListener("blur", deactivate);
		},
	};
}
