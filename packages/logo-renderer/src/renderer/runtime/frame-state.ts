import type { Surface, Target } from "vgpu";
import type { ImprintRenderOptions, RenderControls } from "../render";
import type { CanvasLayoutRef, DevicePixelRatioRef } from "./canvas-sizing";
import type { ControlsRef, HeroRuntimeState } from "./state";

export type FrameLoopOptions<
	CanvasSurface extends Pick<Surface, "resize">,
	AtmosphereTarget = Target,
> = {
	readonly state: HeroRuntimeState;
	readonly canvas: Pick<HTMLCanvasElement, "width" | "height">;
	readonly surface: CanvasSurface;
	readonly atmosphere?:
		| { current: ImprintRenderOptions<AtmosphereTarget>["atmosphere"] }
		| undefined;
	readonly renderer: {
		readonly render: (
			target: CanvasSurface,
			controls: Readonly<RenderControls>,
			logicalWidth: number,
			logicalHeight: number,
			imprint?: ImprintRenderOptions<AtmosphereTarget>,
		) => void;
		readonly renderAtmosphere: (
			controls: Readonly<RenderControls>,
			imprint: ImprintRenderOptions<AtmosphereTarget>,
		) => void;
	};
	readonly controlsRef: ControlsRef;
	readonly canvasLayoutRef: Readonly<CanvasLayoutRef>;
	readonly devicePixelRatioRef: Readonly<DevicePixelRatioRef>;
	readonly onCanvasRevealed: () => void;
	readonly onIntroFrame?: ((time: number) => void) | undefined;
	readonly onFallback: () => void;
	readonly onFatalError: () => void;
};

// Private clock storage, allocated once per loop. Shared state and ref identities stay unchanged.
export type FrameClock = {
	successfulRenderCount: number;
	running: boolean;
	atmosphereTime: number;
	readonly introEnabled: boolean;
	introTime: number;
	introVisibleTime: number;
	introRenderedTime: number;
	lastAtmosphereFrame: number;
};

export const CANVAS_REVEAL_RENDER_COUNT = 3;
export const MAX_FRAME_DELTA_SECONDS = 0.05;
export const MOBILE_AUTO_ROTATE_DURATION_MS = 2000;
