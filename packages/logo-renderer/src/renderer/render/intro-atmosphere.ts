import { effect, pingPong, target, type Frame, type Gpu, type Target } from "vgpu";
import type { Texture } from "vgpu/core";
import airShader from "../shaders/postprocess/intro-air.wgsl";
import sceneShader from "../shaders/postprocess/intro-scene.wgsl";
import resolveShader from "../shaders/postprocess/intro-resolve.wgsl";
import { BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON, SCENE_FORMAT } from "./constants";
import { atmosphereIntroState } from "./intro";
import { createIntroSource } from "./intro-source";
import { clampUnit, mix } from "./math";
import { renderBlur, renderComposite } from "./passes/bloom-pass";
import { shaders } from "./shaders";
import type { writeParams } from "./params";
import type { renderAtmosphere } from "./passes/atmosphere-pass";
import type { RendererResources } from "./resources";
import type { ImprintRenderOptions, MeshData } from "./types";

/** Calibrated canonical art plus shared physical aperture light, assembled before display. */
export function createIntroAtmosphere(gpu: Gpu, resources: RendererResources, mesh: MeshData) {
	const source = createIntroSource(gpu, resources, mesh);
	const near = effect(gpu, airShader, { label: "intro-canonical-near" });
	const rear = effect(gpu, airShader, { label: "intro-canonical-rear" });
	const assemble = effect(gpu, sceneShader, { label: "intro-scene-hdr-inputs" });
	const resolve = effect(gpu, resolveShader, { label: "intro-original-display-stack" });
	// Independent instances prevent parameter aliasing with the canonical passes in this frame.
	const displayResources = {
		...resources,
		pipelines: {
			...resources.pipelines,
			blurHorizontal: effect(gpu, shaders.bloomBlur, { label: "intro-original-bloom-horizontal" }),
			blurVertical: effect(gpu, shaders.bloomBlur, { label: "intro-original-bloom-vertical" }),
			composite: effect(gpu, shaders.bloomComposite, { label: "intro-original-composite" }),
		},
	};
	const scene = target(gpu, { size: [1, 1], format: SCENE_FORMAT, clearColor: [0, 0, 0, 0] });
	const bloom = pingPong(gpu, 1, 1, { format: SCENE_FORMAT, label: "intro-original-bloom" });
	let background: Target | undefined, foreground: Target | undefined, logo: Target | undefined;
	return {
		apertureMask: source.apertureMask,
		get targets() {
			return {
				...source.targets,
				stats: source.stats,
				scene,
				bloom,
				display: { background, foreground, logo },
			};
		},
		render(
			f: Frame,
			canonicalScene: Texture,
			depth: Texture,
			lighting: NonNullable<ReturnType<typeof renderAtmosphere>>,
			output: Target,
			time: number | undefined,
			sceneParams: ReturnType<typeof writeParams>,
			originalLogo: Target,
			paddingRadius: number,
			imprint: ImprintRenderOptions,
		) {
			const state = atmosphereIntroState(time);
			if (!state.active || !imprint.atmosphere) return; // Literal original renderer owns the endpoint.
			const atmosphere = imprint.atmosphere;
			source.render(f, canonicalScene, depth, lighting, output.size, sceneParams);
			if (!background || !foreground || !logo) {
				background = target(gpu, {
					size: atmosphere.target.size,
					format: atmosphere.target.format,
					clearColor: [0, 0, 0, 0],
				});
				foreground = target(gpu, {
					size: atmosphere.foregroundTarget?.size ?? atmosphere.target.size,
					format: atmosphere.foregroundTarget?.format ?? atmosphere.target.format,
					clearColor: [0, 0, 0, 0],
				});
				logo = target(gpu, {
					size: originalLogo.size,
					format: originalLogo.format,
					clearColor: [0, 0, 0, 0],
				});
			} else {
				background.resize(atmosphere.target.size);
				foreground.resize(atmosphere.foregroundTarget?.size ?? atmosphere.target.size);
				logo.resize(originalLogo.size);
			}
			scene.resize([canonicalScene.size[0], canonicalScene.size[1]]);
			const bloomSize = [
				Math.max(1, Math.ceil(scene.size[0] / 2)),
				Math.max(1, Math.ceil(scene.size[1] / 2)),
			] as const;
			bloom.read.resize(bloomSize);
			bloom.write.resize(bloomSize);
			const inputs = {
				strengths: [...state.strengths, 0],
				gains: [128 * (1 - state.settle), state.settle, 0, 0],
			};
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
					mix(BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON, clampUnit(imprint.progress ?? 0)),
				);
			} else renderComposite(f, displayResources, logo, targets, scene.color, 0);
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
		},
		dispose() {
			source.dispose();
			for (const t of [background, foreground, logo, scene, bloom.read, bloom.write])
				t?.color.destroy();
		},
	};
}
