// Public vgpu render units. Target formats and MSAA are compiled lazily per Target.
import type { Gpu } from "vgpu";
import { createDepthPipelines, createMaterialPipelines } from "./scene-pipelines";
import { createPostPipelines } from "./post-pipelines";
import type { GpuMesh } from "./types";

export function createPipelines(gpu: Gpu, mesh: GpuMesh) {
	const depth = createDepthPipelines(gpu, mesh);
	const material = createMaterialPipelines(gpu, mesh);
	const post = createPostPipelines(gpu);
	return { ...depth, ...material, ...post };
}
