import { target, type Frame, type Target } from "vgpu";
import type { Texture } from "vgpu/core";
import { BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON } from "./constants";
import { atmosphereIntroState } from "./intro";
import { clampUnit, mix } from "./math";
import { renderBlur, renderComposite } from "./passes/bloom-pass";
import type { IntroAtmosphereState, IntroDisplay } from "./intro-atmosphere-resources";
import type { IntroAtmosphereLighting, IntroSceneParameters } from "./intro-inputs";
import type { ImprintRenderOptions } from "./types";

type IntroAtmosphere = NonNullable<ImprintRenderOptions["atmosphere"]>;
type IntroAirInputs = {
	readonly strengths: readonly number[];
	readonly gains: readonly number[];
};

export function renderIntroAtmosphere(
	state: IntroAtmosphereState,
	f: Frame,
	canonicalScene: Texture,
	depth: Texture,
	lighting: IntroAtmosphereLighting,
	output: Target,
	time: number | undefined,
	sceneParams: IntroSceneParameters,
	originalLogo: Target,
	paddingRadius: number,
	imprint: ImprintRenderOptions,
) {
	const intro = atmosphereIntroState(time);
	// Literal original renderer owns the endpoint.
	if (!intro.active || imprint.atmosphere === undefined) return;
	const atmosphere = imprint.atmosphere;
	state.source.render(f, canonicalScene, depth, lighting, output.size, sceneParams);
	const display = prepareIntroTargets(state, canonicalScene, atmosphere, originalLogo);
	const inputs = {
		strengths: [...intro.strengths, 0],
		gains: [128 * (1 - intro.settle), intro.settle, 0, 0],
	};
	renderIntroInputs(state, f, display, canonicalScene, depth, lighting, inputs, atmosphere);
	renderIntroBloom(state, f, display.logo, paddingRadius, imprint.progress);
	const { background, foreground, logo } = display;
	const { resolve, resources } = state;
	const rect = atmosphere.introPresentation?.logoRect ?? atmosphere.logoRect;
	resolve.set({
		background: background.color.view,
		foreground: foreground.color.view,
		logo: logo.color.view,
		texSampler: resources.sampler,
		presentation: {
			logoRect: rect,
			logoOpacity: atmosphere.introPresentation?.logoOpacity ?? 1,
		},
	});
	f.pass(output, resolve);
}

function prepareIntroTargets(
	state: IntroAtmosphereState,
	canonicalScene: Texture,
	atmosphere: IntroAtmosphere,
	originalLogo: Target,
) {
	let display = state.display;
	if (display === undefined) {
		display = {
			background: target(state.gpu, {
				size: atmosphere.target.size,
				format: atmosphere.target.format,
				clearColor: [0, 0, 0, 0],
			}),
			foreground: target(state.gpu, {
				size: atmosphere.foregroundTarget?.size ?? atmosphere.target.size,
				format: atmosphere.foregroundTarget?.format ?? atmosphere.target.format,
				clearColor: [0, 0, 0, 0],
			}),
			logo: target(state.gpu, {
				size: originalLogo.size,
				format: originalLogo.format,
				clearColor: [0, 0, 0, 0],
			}),
		};
		state.display = display;
	} else {
		display.background.resize(atmosphere.target.size);
		display.foreground.resize(atmosphere.foregroundTarget?.size ?? atmosphere.target.size);
		display.logo.resize(originalLogo.size);
	}
	const { scene, bloom } = state;
	scene.resize([canonicalScene.size[0], canonicalScene.size[1]]);
	const bloomSize = [
		Math.max(1, Math.ceil(scene.size[0] / 2)),
		Math.max(1, Math.ceil(scene.size[1] / 2)),
	] satisfies readonly [number, number];
	bloom.read.resize(bloomSize);
	bloom.write.resize(bloomSize);
	return display;
}

function renderIntroInputs(
	state: IntroAtmosphereState,
	f: Frame,
	display: IntroDisplay,
	canonicalScene: Texture,
	depth: Texture,
	lighting: IntroAtmosphereLighting,
	inputs: IntroAirInputs,
	atmosphere: IntroAtmosphere,
) {
	const { assemble, source, scene, resources, rear, near } = state;
	const { background, foreground } = display;
	assemble.set({
		canonicalScene: canonicalScene.view,
		sourceCoefficients: source.targets.surface.color.view,
		inputs,
	});
	f.pass(scene, assemble);
	const airBindings = {
		sceneTexture: canonicalScene.view,
		sceneDepth: depth.view,
		texSampler: resources.sampler,
		introAir: inputs,
	};
	rear.set({
		...airBindings,
		params: { ...lighting.params, foreground: 0 },
		sourceCoefficients: source.targets.background.color.view,
	});
	near.set({
		...airBindings,
		params: { ...lighting.params, foreground: 1 },
		sourceCoefficients: source.targets.foreground.color.view,
	});
	f.pass(background, rear);
	if (atmosphere.foregroundTarget) f.pass(foreground, near);
	else f.pass({ target: foreground, clear: [0, 0, 0, 0] }, () => {});
}

function renderIntroBloom(
	state: IntroAtmosphereState,
	f: Frame,
	logo: Target,
	paddingRadius: number,
	progress: number | undefined,
) {
	const { scene, bloom, resources, displayResources } = state;
	const targets = {
		scene,
		bloom,
		width: scene.size[0],
		height: scene.size[1],
		backMaterial: undefined,
		backDepth: undefined,
	};
	if (resources.bloomEnabled) {
		renderBlur(f, displayResources, scene.color, bloom.write, [1, 0], true, paddingRadius);
		bloom.swap();
		renderBlur(
			f,
			displayResources,
			bloom.read.color,
			bloom.write,
			[0, 1],
			false,
			Math.max(0, Math.round(paddingRadius / 2)),
		);
		bloom.swap();
		renderComposite(
			f,
			displayResources,
			logo,
			targets,
			bloom.read.color,
			mix(BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON, clampUnit(progress ?? 0)),
		);
	} else renderComposite(f, displayResources, logo, targets, scene.color, 0);
}
