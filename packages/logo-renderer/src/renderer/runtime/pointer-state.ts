import type { RefObject } from "react";
import type { CanvasLayoutRef, DevicePixelRatioRef } from "./canvas-sizing";
import type { ControlsRef, HeroRuntimeState } from "./state";

export type PointerPosition = Pick<PointerEvent, "clientX" | "clientY" | "pointerType">;
export type CanvasRectReader = () => DOMRectReadOnly | undefined;
export type PointerOptions = {
	readonly state: HeroRuntimeState;
	readonly controlsRef: Readonly<ControlsRef>;
	readonly canvasRef: Readonly<RefObject<HTMLCanvasElement | null>>;
	readonly coarsePointerRef: Readonly<RefObject<boolean>>;
	readonly canvasLayoutRef: Readonly<CanvasLayoutRef>;
	readonly devicePixelRatioRef: Readonly<DevicePixelRatioRef>;
	readonly requestRender: () => void;
};
