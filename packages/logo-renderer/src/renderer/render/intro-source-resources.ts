import { draw, effect, target, type Gpu } from "vgpu";
import { StorageBuffer } from "vgpu/core";
import airShader from "../shaders/postprocess/intro-source-air.wgsl";
import metalShader from "../shaders/glass/intro-source-material.wgsl";
import { createApertureMask } from "./aperture-mask";
import { createIntroVisibility } from "./intro-visibility";
import { createIntroSourceVisibility } from "./intro-source-visibility";
import type { RendererResources } from "./resources";
import type { MeshInput } from "./types";

/** Instance-owned transport resources, created in renderer binding order. */
export function createIntroSourceResources(
	gpu: Gpu,
	resources: RendererResources,
	mesh: MeshInput,
) {
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
	return {
		aperture,
		visibility,
		shadows,
		sourceNodes,
		nearPass,
		rearPass,
		metalPass,
		foreground,
		background,
		surface,
	};
}

export type IntroSourceState = ReturnType<typeof createIntroSourceResources> & {
	readonly resources: RendererResources;
	key: string;
	shadowDepth: number | undefined;
	bakes: number;
};
