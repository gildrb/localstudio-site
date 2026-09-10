import { evePointerInteractionMode } from "../mobile-motion";
import { mapPointerToLocalEnvironment } from "./environment-input";
import type { PointerOptions, CanvasRectReader } from "./pointer-state";

export function createCanvasRectCache({
	canvasRef,
	canvasLayoutRef,
}: Pick<PointerOptions, "canvasRef" | "canvasLayoutRef">) {
	let cachedCanvasRect: DOMRectReadOnly | undefined;
	let rectInvalidated = true;

	const getCanvasRect = (): DOMRectReadOnly | undefined => {
		const canvas = canvasRef.current;
		if (canvas) {
			const { width, height } = canvasLayoutRef.current;
			if (
				!cachedCanvasRect ||
				rectInvalidated ||
				cachedCanvasRect.width !== width ||
				cachedCanvasRect.height !== height
			) {
				const rect = canvas.getBoundingClientRect();
				cachedCanvasRect = new DOMRectReadOnly(
					rect.left,
					rect.top,
					width || rect.width,
					height || rect.height,
				);
				rectInvalidated = false;
			}
		}
		return canvas ? cachedCanvasRect : undefined;
	};

	const invalidateCanvasRect = () => {
		rectInvalidated = true;
	};
	return { getCanvasRect, invalidateCanvasRect };
}

export function updateEnvRotation(
	{ state, requestRender }: PointerOptions,
	getCanvasRect: CanvasRectReader,
	clientX: number,
	clientY: number,
) {
	if (evePointerInteractionMode(state.isCoarsePointer).autoRotateEnvYaw) return;
	const rect = getCanvasRect();
	if (!rect) return;
	const mapped = mapPointerToLocalEnvironment({ clientX, clientY, rect });
	// staticPose keeps the canonical environment (a rotated cubemap reads dull
	// for decorative instances) while the object still tracks the cursor.
	if (!state.staticPose) {
		state.targetMouseEnvYaw = mapped.envYaw;
		state.targetMouseEnvPitch = mapped.envPitch;
	}
	const outside =
		clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
	state.targetAsciiMouseX = state.staticPose && outside ? 0 : mapped.normalizedX;
	state.targetAsciiMouseY = state.staticPose && outside ? 0 : mapped.normalizedY;
	requestRender();
}

export function pointerInsideRect(
	getCanvasRect: CanvasRectReader,
	clientX: number,
	clientY: number,
) {
	const rect = getCanvasRect();
	if (!rect) return false;
	return (
		clientX >= rect.left &&
		clientX <= rect.left + rect.width &&
		clientY >= rect.top &&
		clientY <= rect.top + rect.height
	);
}
