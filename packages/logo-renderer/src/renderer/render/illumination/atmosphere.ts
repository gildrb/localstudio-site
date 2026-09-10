import { draw, effect, target, type Frame, type Gpu, type Target } from "vgpu";
import type { Texture } from "vgpu/core";
import coverageShader from "../../shaders/illumination/coverage.wgsl";
import volumeShader from "../../shaders/illumination/volume.wgsl";
import { dot, multiply } from "../math";
import { srgbHexToLinear } from "../cubemap";
import {
	EVE_DARK_ENV_LIGHTS,
	EVE_LIGHT_ENV_LIGHTS,
	STUDIO_BACKLIGHT_POSITION,
} from "../env-lights";
import type { writeParams } from "../params";
import { renderAtmosphere } from "../passes/atmosphere-pass";
import { createPrismPostprocess } from "../prism-post";
import type { RendererResources } from "../resources";
import { shaders } from "../shaders";
import type { ImprintRenderOptions, MeshData, RenderControls } from "../types";
import { illuminationSourceView } from "./source-view";

type SceneParams = ReturnType<typeof writeParams>;
type Atmosphere = NonNullable<ImprintRenderOptions["atmosphere"]>;

/** Add light to the existing medium, never replace its look or interaction. */
export function createIlluminationAtmosphere(
	gpu: Gpu,
	r: RendererResources,
	mesh: MeshData,
	outputs: Atmosphere,
) {
	// Match the exact policy used by resources.ts for the chrome's cubemap bake.
	// environmentTheme changes the sky, not which studio-light configuration wins.
	const emitter = (r.isLight ? EVE_LIGHT_ENV_LIGHTS : EVE_DARK_ENV_LIGHTS).find(
		(light) => light.position === STUDIO_BACKLIGHT_POSITION,
	);
	const lightRadiance = emitter
		? srgbHexToLinear(emitter.color).map(
				(channel) => channel * emitter.intensity * emitter.luminance,
			)
		: [0, 0, 0];
	const owned: Target[] = [];
	const make = (format: GPUTextureFormat, label: string) => {
		const value = target(gpu, {
			size: outputs.target.size,
			format,
			clearColor: [0, 0, 0, 0],
			label: `hero-illumination-${label}`,
		});
		owned.push(value);
		return value;
	};
	const baseBackground = make(outputs.target.format, "approved-background");
	const baseForeground = make(
		outputs.foregroundTarget?.format ?? outputs.target.format,
		"approved-foreground",
	);
	const background = make("rgba16float", "delta-background");
	const foreground = make("rgba16float", "delta-foreground");
	const coverage = target(gpu, {
		size: outputs.target.size,
		format: "rgba8unorm",
		msaa: true,
		depth: "depth24plus",
		clearColor: [0, 0, 0, 0],
		label: "hero-illumination-opaque-coverage",
	});
	const sourceDepth = target(gpu, {
		size: [512, 512],
		format: "r32float",
		depth: "depth24plus",
		clearColor: [1e6, 0, 0, 0],
		label: "hero-illumination-source-depth",
	});
	const opaque = draw(gpu, {
		shader: coverageShader,
		geometry: r.gpuMesh.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
		label: "hero-illumination-opaque-mesh",
	});
	const shadow = draw(gpu, {
		shader: shaders.glassBackDepth,
		geometry: r.gpuMesh.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
		label: "hero-illumination-source-mesh",
	});
	const volumes = [0, 1].map((layer) =>
		effect(gpu, volumeShader, { label: `hero-illumination-volume-${layer}` }),
	);
	const post = createPrismPostprocess(gpu, r.sampler);
	let cameraKey = "",
		sourceKey = "";
	let source: ReturnType<typeof illuminationSourceView>;
	return {
		targets: { baseBackground, baseForeground, background, foreground, coverage, sourceDepth },
		render(
			f: Frame,
			scene: Texture,
			depth: Texture,
			params: SceneParams,
			controls: RenderControls,
			imprint: ImprintRenderOptions,
			day: boolean,
		) {
			const atmosphere = imprint.atmosphere;
			if (!atmosphere) return;
			const size = atmosphere.target.size;
			for (const value of [...owned, coverage]) {
				if (value.size[0] !== size[0] || value.size[1] !== size[1]) value.resize(size);
			}
			const camera = [
				Math.tan(params.fov / 2),
				params.aspect,
				-dot(params.cameraPos, params.cameraForward),
				controls.radius,
			] as const;
			// This is the UNCHANGED approved pass, with only its destination replaced.
			renderAtmosphere(
				f,
				r,
				scene,
				depth,
				camera,
				controls,
				{
					...imprint,
					atmosphere: {
						...atmosphere,
						target: baseBackground,
						foregroundTarget: atmosphere.foregroundTarget ? baseForeground : undefined,
					},
				},
				day,
			);
			const nextCameraKey = [
				...size,
				...atmosphere.logoRect,
				...params.viewProj,
				params.depthTransform[0],
				controls.outsideRendering,
			].join(",");
			if (nextCameraKey !== cameraKey) {
				const rect = atmosphere.logoRect;
				const mapping = new Float32Array([
					rect[2],
					0,
					0,
					0,
					0,
					rect[3],
					0,
					0,
					0,
					0,
					1,
					0,
					2 * rect[0] + rect[2] - 1,
					1 - 2 * rect[1] - rect[3],
					0,
					1,
				]);
				opaque.set({ params: { ...params, viewProj: multiply(mapping, params.viewProj) } });
				f.pass({ target: coverage, clear: [0, 0, 0, 0] }, (pass) => {
					if (controls.outsideRendering) pass.draw(opaque);
				});
				cameraKey = nextCameraKey;
			}
			const nextSourceKey = [
				controls.envYaw,
				controls.envPitch,
				params.depthTransform[0],
				controls.outsideRendering,
			].join(",");
			if (nextSourceKey !== sourceKey) {
				source = illuminationSourceView(
					mesh.bounds,
					controls,
					r.orbitTarget,
					params.depthTransform[0]!,
				);
				if (source)
					shadow.set({
						params: {
							...params,
							viewProj: source.viewProj,
							cameraPos: source.position,
							cameraRight: source.right,
							cameraUp: source.up,
							cameraForward: source.forward,
						},
					});
				f.pass({ target: sourceDepth, clear: [1e6, 0, 0, 0] }, (pass) => {
					if (source && controls.outsideRendering) pass.draw(shadow);
				});
				sourceKey = nextSourceKey;
			}
			// Density/time evolve on EVERY frame. Only geometric visibility is cached.
			const gain =
				source && Number.isFinite(atmosphere.lightGain)
					? Math.max(0, Math.min(1, atmosphere.lightGain!))
					: 0;
			for (const [layer, destination] of [background, foreground].entries()) {
				const volume = volumes[layer]!;
				volume.set({
					sourceDepth: sourceDepth.color.view,
					cameraDepth: depth.view,
					coverage: coverage.color.view,
					params: {
						logoRect: atmosphere.logoRect,
						camera,
						lightViewProj: source?.viewProj ?? params.viewProj,
						lightPosition: source?.position ?? r.orbitTarget,
						lightForward: source?.forward ?? params.cameraForward,
						gain,
						lightRadiance,
						foreground: layer,
						eye: params.cameraPos,
						time: imprint.time ?? 0,
						right: params.cameraRight,
						up: params.cameraUp,
						forward: params.cameraForward,
						envYaw: controls.envYaw,
						envPitch: controls.envPitch,
					},
				});
				f.pass({ target: destination, clear: [0, 0, 0, 0] }, volume);
			}
			post.render(f, {
				baseBackground,
				baseForeground,
				background,
				foreground,
				coverage,
				output: atmosphere.target,
				foregroundOutput: atmosphere.foregroundTarget,
				logoRect: atmosphere.logoRect,
				sceneChanged: true,
			});
		},
		dispose() {
			post.dispose();
			for (const value of [...owned, coverage, sourceDepth]) {
				value.color.destroy();
				value.depth?.destroy();
			}
			// The parent Gpu owns target-private MSAA attachments, as in the base scene.
		},
	};
}
