import { draw, geometry, target, type Gpu } from "vgpu";
import beamShader from "../../shaders/prism/beam.wgsl";
import { createPrismPostprocess } from "../prism-post";
import type { RendererResources } from "../resources";
import { shaders } from "../shaders";
import type { Mat4, MeshInput, Vec3 } from "../types";
import { createPrismRibbonVertices } from "./ribbons";

export function createPrismAtmosphereResources(gpu: Gpu, r: RendererResources, mesh: MeshInput) {
	const vertices = createPrismRibbonVertices(mesh);
	const ribbon = geometry(gpu, {
		label: "hero-prism-aperture-ribbons",
		vertexCount: vertices.length / 5,
		buffers: [
			{
				data: vertices.length > 0 ? vertices : new Float32Array(5),
				stride: 20,
				attributes: { position: "float32x3", beam: "float32x2" },
			},
		],
	});
	const { lightDepth, background, foreground } = createPrismTargets(gpu);
	const shadow = draw(gpu, {
		shader: shaders.glassBackDepth,
		geometry: r.gpuMesh.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
		label: "hero-prism-source-mesh-depth",
	});
	// Each encoded layer owns its uniform buffer; .set() uploads immediately.
	const beams = [0, 1].map((layer) =>
		draw(gpu, {
			shader: beamShader,
			geometry: ribbon,
			blend: "additive",
			depth: false,
			cull: "none",
			label: `hero-prism-beam-${layer}`,
		}),
	);
	const post = createPrismPostprocess(gpu, r.sampler);
	return { vertices, ribbon, lightDepth, background, foreground, shadow, beams, post };
}

function createPrismTargets(gpu: Gpu) {
	const lightDepth = target(gpu, {
		size: [512, 512],
		format: "r32float",
		depth: "depth24plus",
		clearColor: [1e6, 0, 0, 0],
		label: "hero-prism-light-space-depth",
	});
	const background = target(gpu, {
		size: [1, 1],
		format: "rgba16float",
		msaa: true,
		clearColor: [0, 0, 0, 0],
		label: "hero-prism-background-hdr",
	});
	const foreground = target(gpu, {
		size: [1, 1],
		format: "rgba16float",
		msaa: true,
		clearColor: [0, 0, 0, 0],
		label: "hero-prism-foreground-hdr",
	});
	return { lightDepth, background, foreground };
}

export type PrismAtmosphereState = ReturnType<typeof createPrismAtmosphereResources> & {
	readonly r: RendererResources;
	cachedKey: string;
	lightKey: string;
	lightViewProj: Mat4;
	lightForward: Vec3;
	lightPosition: Vec3;
};
