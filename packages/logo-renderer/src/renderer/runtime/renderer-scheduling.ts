import { useEffect, type RefObject } from "react";
import { useLifecycle } from "phase/react";
import { syncPointerInteractionMode } from "./pointer-input";
import type { CanvasLayout } from "./canvas-sizing";
import type { RendererRefs } from "./renderer-refs";

export function useRendererScheduling(
	refs: RendererRefs,
	atmosphereRef: RefObject<HTMLCanvasElement | null> | undefined,
) {
	const { containerRef } = refs;
	const { isActive } = useLifecycle<HTMLElement>({
		ref: atmosphereRef ?? containerRef,
		reducedMotion: "pause",
		intersectionOptions: { threshold: 0 },
	});
	useEffect(() => scheduleRendererFrames(refs, isActive), [refs, isActive]);
}

export function useRendererInputChanges(
	refs: RendererRefs,
	coarsePointer: boolean,
	requestRender: () => void,
	containerSize: CanvasLayout | null,
) {
	const { canvasLayoutRef, invalidatePointerCanvasRectRef, stateRef } = refs;
	useEffect(() => {
		if (!containerSize) return;
		canvasLayoutRef.current = containerSize;
		requestRender();
		invalidatePointerCanvasRectRef.current();
	}, [containerSize, requestRender, canvasLayoutRef, invalidatePointerCanvasRectRef]);

	useEffect(() => {
		const state = stateRef.current;
		if (!state) return;
		syncPointerInteractionMode(state, coarsePointer);
		requestRender();
	}, [coarsePointer, requestRender, stateRef]);
}

function scheduleRendererFrames(refs: RendererRefs, isActive: boolean) {
	const { drawLoopRef, runLoopRef } = refs;
	let frame = 0;
	const tick = (time: number) => {
		frame = 0;
		const drawLoop = drawLoopRef.current;
		if (drawLoop?.step(time) === true) frame = requestAnimationFrame(tick);
		else drawLoop?.stop();
	};
	const run = () => {
		const drawLoop = drawLoopRef.current;
		if (!isActive || frame || !drawLoop) return;
		drawLoop.start();
		frame = requestAnimationFrame(tick);
	};
	runLoopRef.current = run;
	run();
	return () => {
		runLoopRef.current = () => {};
		cancelAnimationFrame(frame);
		drawLoopRef.current?.stop();
	};
}
