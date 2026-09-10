import type {
	ImprintRenderOptions,
	RenderControls,
} from "../../packages/logo-renderer/src/renderer/render/types";
import { createDrawLoop } from "../../packages/logo-renderer/src/renderer/runtime/frame-loop";
import type {
	ControlsRef,
	HeroRuntimeState,
} from "../../packages/logo-renderer/src/renderer/runtime/state";

type FixtureSurface = { readonly resize: () => void };
type FixtureImprint = ImprintRenderOptions<FixtureSurface>;
type ImprintObservation = Readonly<Pick<FixtureImprint, "time">> & {
	readonly atmosphere?:
		| Readonly<Pick<NonNullable<FixtureImprint["atmosphere"]>, "target" | "foregroundTarget">>
		| undefined;
};
type RenderCall = { controls: RenderControls; imprint: ImprintObservation | undefined };
type AtmosphereFixture = { current: NonNullable<FixtureImprint["atmosphere"]> };

const idleState: HeroRuntimeState = {
	cancelled: false,
	renderRequested: false,
	cleanup: undefined,
	mouseEnvYaw: 0,
	targetMouseEnvYaw: 0,
	mouseEnvPitch: 0,
	targetMouseEnvPitch: 0,
	asciiMouseX: 0,
	asciiMouseY: 0,
	targetAsciiMouseX: 0,
	targetAsciiMouseY: 0,
	brushCellX: 0,
	brushCellY: 0,
	previousRenderedBrushCellX: 0,
	previousRenderedBrushCellY: 0,
	hasBrushCell: false,
	hasRenderedBrushCell: false,
	brushActive: false,
	paintGridScaleMultiplier: 1,
	targetBrushActive: false,
	activeMesh: undefined,
	previousFrameTime: 0,
	autoRotateStartTime: 0,
	lastBrushMoveTime: -Infinity,
	lastPointerClientX: undefined,
	lastPointerClientY: undefined,
	rippleCellX: 0,
	rippleCellY: 0,
	rippleStartTime: -Infinity,
	lastRippleSpawnTime: -Infinity,
	pointerInsideCanvas: false,
	isCoarsePointer: false,
	paintOnHover: false,
	depthReveal: false,
	depthOpening: 0,
	baseObjectYaw: 0,
	staticPose: true,
};

const defaultControls: RenderControls = {
	yaw: 0,
	pitch: 0,
	radius: 2,
	fov: 35,
	envYaw: 0,
	envPitch: 0,
	insideRendering: true,
	outsideRendering: true,
	material: "glass",
	wireframe: false,
	showEnv: false,
};

export class AtmosphereLoopFixture {
	readonly state = { ...idleState };
	readonly controlsRef: ControlsRef = { current: { ...defaultControls } };
	readonly atmosphere: AtmosphereFixture;
	readonly introFrames: number[] = [];
	readonly meshCalls: RenderCall[] = [];
	readonly atmosphereCalls: RenderCall[] = [];
	readonly introFrameMeshCounts: number[] = [];
	readonly loop: ReturnType<typeof createDrawLoop>;
	#reveals = 0;
	#failures = 0;
	readonly #failAtmosphere: boolean;

	constructor(failAtmosphere = false, intro = false) {
		this.#failAtmosphere = failAtmosphere;
		const canvas = { width: 640, height: 320 };
		const surface = { resize() {} };
		this.atmosphere = {
			current: { target: surface, foregroundTarget: surface, logoRect: [0.1, 0.2, 0.8, 0.3] },
		};
		if (intro) this.atmosphere.current.introTime = 0;
		this.loop = createDrawLoop({
			state: this.state,
			canvas,
			surface,
			controlsRef: this.controlsRef,
			atmosphere: this.atmosphere,
			canvasLayoutRef: { current: { width: 640, height: 320 } },
			devicePixelRatioRef: { current: 1 },
			renderer: this,
			onCanvasRevealed: this.onCanvasRevealed,
			onIntroFrame: this.onIntroFrame,
			onFallback: this.onFallback,
			onFatalError: this.onFatalError,
		});
		this.loop.start();
		this.state.previousFrameTime = 0;
		for (const time of [0, 40, 80]) this.loop.step(time);
	}

	readonly render = (
		_target: FixtureSurface,
		controls: Readonly<RenderControls>,
		_width: number,
		_height: number,
		imprint?: ImprintObservation,
	) => {
		this.meshCalls.push({ controls: { ...controls }, imprint });
	};

	readonly renderAtmosphere = (controls: Readonly<RenderControls>, imprint: ImprintObservation) => {
		if (this.#failAtmosphere) throw new Error("Atmosphere render failed");
		this.atmosphereCalls.push({ controls: { ...controls }, imprint });
	};

	readonly onCanvasRevealed = () => {
		this.#reveals += 1;
	};

	readonly onIntroFrame = (time: number) => {
		this.introFrames.push(time);
		this.introFrameMeshCounts.push(this.meshCalls.length);
	};

	readonly onFallback = () => {
		this.#failures += 1;
	};

	readonly onFatalError = () => {
		this.#failures += 1;
	};

	get reveals() {
		return this.#reveals;
	}

	get failures() {
		return this.#failures;
	}
}
