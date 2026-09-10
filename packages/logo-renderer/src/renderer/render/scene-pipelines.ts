// Mesh material and depth draw pipelines, in the original creation order.
import { draw, type Gpu } from "vgpu";
import glassBack from "../shaders/glass/back.wgsl";
import glassBackDepth from "../shaders/glass/back-depth.wgsl";
import glassFront from "../shaders/glass/front.wgsl";
import envBg from "../shaders/env/background.wgsl";
import type { GpuMesh } from "./types";

export function createDepthPipelines(gpu: Gpu, mesh: GpuMesh) {
	return {
		backMaterial: draw(gpu, {
			label: "eve-5-glass-back-material",
			shader: glassBack,
			geometry: mesh.triangles,
			cull: "front",
			depth: { write: true, compare: "less" },
		}),
		atmosphereDepth: draw(gpu, {
			label: "eve-5-atmosphere-front-depth",
			shader: glassBackDepth,
			geometry: mesh.triangles,
			cull: "back",
			depth: { write: true, compare: "less" },
		}),
		backDepth: draw(gpu, {
			label: "eve-5-glass-back-depth",
			shader: glassBackDepth,
			geometry: mesh.triangles,
			cull: "front",
			depth: { write: true, compare: "less" },
		}),
	};
}

export function createMaterialPipelines(gpu: Gpu, mesh: GpuMesh) {
	return {
		frontMaterial: draw(gpu, {
			label: "eve-5-glass-front-material",
			shader: glassFront,
			geometry: mesh.triangles,
			cull: "back",
			depth: { write: true, compare: "less" },
		}),
		opaque: draw(gpu, {
			label: "eve-5-opaque-material",
			shader: glassFront,
			geometry: mesh.triangles,
			cull: "back",
			depth: { write: true, compare: "less" },
		}),
		wire: draw(gpu, {
			label: "eve-5-wireframe",
			shader: glassFront,
			geometry: mesh.lines,
			blend: "alpha",
			depth: { write: false, compare: "less-equal" },
		}),
		envBg: draw(gpu, {
			label: "eve-5-env-bg",
			shader: envBg,
			vertices: 3,
			depth: false,
		}),
	};
}
