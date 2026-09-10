import {
	renderAtmosphere,
	type AtmosphereBindings,
} from "../../packages/logo-renderer/src/renderer/render/passes/atmosphere-pass";
import type {
	ImprintRenderOptions,
	RenderControls,
} from "../../packages/logo-renderer/src/renderer/render/types";

type ViewIdentity = { readonly label: string };
type FixtureTarget = { readonly size: readonly [number, number] };
type FixtureBindings = AtmosphereBindings<ViewIdentity, ViewIdentity>;
type PassEffect = { readonly set: (bindings: FixtureBindings) => void };
type PassOptions = { readonly target: FixtureTarget; readonly clear: readonly number[] };

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

export class AtmospherePassFixture {
	readonly backgroundBindings: FixtureBindings[] = [];
	readonly foregroundBindings: FixtureBindings[] = [];
	readonly backgroundEffect: PassEffect = {
		set: (bindings) => {
			this.backgroundBindings.push(bindings);
		},
	};
	readonly foregroundEffect: PassEffect = {
		set: (bindings) => {
			this.foregroundBindings.push(bindings);
		},
	};
	readonly passes: { readonly options: PassOptions; readonly effect: PassEffect }[] = [];
	readonly target: FixtureTarget = { size: [768, 384] };
	readonly foregroundTarget: FixtureTarget = { size: [768, 384] };
	readonly scene = { view: { label: "scene" } };
	readonly depth = { view: { label: "depth" } };
	readonly sampler = { label: "sampler" };
	readonly camera = [0.315, 2.1, 0.42, 0.58] as const;
	readonly renderControls: RenderControls;

	constructor(
		controls: Readonly<Partial<RenderControls>> = {},
		foreground = true,
		orbitTarget: readonly [number, number, number] = [0, 0, 0],
	) {
		const frame = {
			pass: (options: PassOptions, effect: PassEffect) => {
				this.passes.push({ options, effect });
			},
		};
		const resources = {
			isLight: false,
			orbitTarget,
			sampler: this.sampler,
			pipelines: { atmosphere: this.backgroundEffect, atmosphereForeground: this.foregroundEffect },
		};
		this.renderControls = { ...defaultControls, ...controls };
		const imprint: ImprintRenderOptions<FixtureTarget> = {
			time: 4.25,
			atmosphere: {
				target: this.target,
				logoRect: [0.1, 0.2, 0.8, 0.3],
				foregroundTarget: foreground ? this.foregroundTarget : undefined,
			},
		};
		renderAtmosphere(
			frame,
			resources,
			this.scene,
			this.depth,
			this.camera,
			this.renderControls,
			imprint,
			true,
		);
	}
}
