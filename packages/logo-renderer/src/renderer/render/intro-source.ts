import { draw, effect, target, type Frame, type Gpu } from "vgpu";
import { StorageBuffer } from "vgpu/core";
import airShader from "../shaders/postprocess/intro-source-air.wgsl";
import metalShader from "../shaders/glass/intro-source-material.wgsl";
import { createApertureMask } from "./aperture-mask";
import { createIntroVisibility } from "./intro-visibility";
import { createIntroSourceVisibility } from "./intro-source-visibility";
import type { writeParams } from "./params";
import type { renderAtmosphere } from "./passes/atmosphere-pass";
import type { RendererResources } from "./resources";
import type { MeshData } from "./types";
import type { Texture } from "vgpu/core";

/** Unit-radiance port responses. Activation never changes this transport cache. */
export function createIntroSource(gpu: Gpu, resources: RendererResources, mesh: MeshData) {
	const aperture = createApertureMask(gpu, mesh);
	const visibility = createIntroVisibility(gpu, mesh);
	const shadows = createIntroSourceVisibility(gpu, resources);
	const data = new Float32Array(shadows.nodes.flatMap((node) => [...node.position, node.weight]));
	const sourceNodes = new StorageBuffer(gpu.device, {
		size: data.byteLength,
		label: "intro-disk-quadrature",
	});
	sourceNodes.write(data);
	const nearPass = effect(gpu, airShader, { label: "intro-near-source-basis" });
	const rearPass = effect(gpu, airShader, { label: "intro-rear-source-basis" });
	const metalPass = draw(gpu, {
		shader: metalShader,
		geometry: resources.gpuMesh.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
		label: "intro-metal-source-basis",
	});
	const foreground = target(gpu, { size: [1, 1], format: "rgba16float", clearColor: [0, 0, 0, 0] });
	const background = target(gpu, { size: [1, 1], format: "rgba16float", clearColor: [0, 0, 0, 0] });
	const surface = target(gpu, {
		size: [1, 1],
		format: "rgba16float",
		msaa: true,
		depth: "depth24plus",
		clearColor: [0, 0, 0, 0],
	});
	let key = "";
	let shadowDepth: number | undefined;
	let bakes = 0;
	return {
		apertureMask: aperture.target,
		targets: { foreground, background, surface },
		get stats() {
			return {
				bakes,
				sourceCount: 16,
				depthCount: 24,
				field: foreground.size,
				material: surface.size,
			};
		},
		render(
			f: Frame,
			scene: Texture,
			depth: Texture,
			lighting: NonNullable<ReturnType<typeof renderAtmosphere>>,
			outputSize: readonly [number, number],
			params: ReturnType<typeof writeParams>,
		) {
			const scale = Math.min(1, 640 / Math.max(...outputSize));
			const size = [
				Math.max(1, Math.round(outputSize[0] * scale)),
				Math.max(1, Math.round(outputSize[1] * scale)),
			] as const;
			const next = JSON.stringify({
				size,
				scene: scene.size,
				camera: lighting.params.camera,
				logo: lighting.params.logoRect,
				eye: params.cameraPos,
				right: params.cameraRight,
				up: params.cameraUp,
				forward: params.cameraForward,
				viewProj: params.viewProj,
				depth: params.depthTransform,
				env: [params.envYaw, params.envPitch],
			});
			if (next === key) return;
			aperture.render(f);
			const depthScale = params.depthTransform[0] ?? 1;
			if (shadowDepth !== depthScale) {
				shadows.render(f, depthScale);
				shadowDepth = depthScale;
			}
			foreground.resize(size);
			background.resize(size);
			surface.resize([scene.size[0], scene.size[1]]);
			const physical = {
				camera: lighting.params.camera,
				logoRect: lighting.params.logoRect,
				apertureRect: aperture.rect,
				source: [0, 0, -2, 0.8],
				counts: [24, 16, 8, 0],
				medium: [1.8, 1, 0, 0],
			};
			const common = {
				params,
				physical,
				bvhNodes: visibility.bvhNodes,
				bvhTriangles: visibility.bvhTriangles,
				apertureMask: aperture.target.color.view,
				apertureSampler: resources.sampler,
				sourceNodes,
				sourceShadows: shadows.arrayView,
			};
			nearPass.set({ ...common, sceneTexture: scene.view, sceneDepth: depth.view });
			rearPass.set({
				...common,
				physical: { ...physical, medium: [1.8, 1, 0, 1] },
				sceneTexture: scene.view,
				sceneDepth: depth.view,
			});
			metalPass.set(common);
			f.pass(foreground, nearPass);
			f.pass(background, rearPass);
			f.pass(surface, (pass) => pass.draw(metalPass));
			key = next;
			bakes++;
		},
		dispose() {
			aperture.dispose();
			visibility.dispose();
			shadows.dispose();
			sourceNodes.destroy();
			for (const t of [foreground, background, surface]) {
				t.color.destroy();
				t.depth?.destroy();
			}
		},
	};
}
