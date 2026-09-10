import { draw, target, type Frame, type Gpu, type Target } from "vgpu";
import materialShader from "../shaders/glass/intro-material.wgsl";
import type { createApertureMask } from "./aperture-mask";
import { createIntroVisibility } from "./intro-visibility";
import type { writeParams } from "./params";
import type { RendererResources } from "./resources";
import type { MeshData } from "./types";

type IntroLight = {
	camera: readonly number[];
	source: readonly [number, number, number, number];
	strengths: readonly number[];
	intensity: number;
	environment: number;
	time: number;
};

/** A separate incident-light response; never changes the approved studio material. */
export function createIntroMaterial(
	gpu: Gpu,
	resources: RendererResources,
	mesh: MeshData,
	aperture: ReturnType<typeof createApertureMask>,
) {
	const visibility = createIntroVisibility(gpu, mesh);
	const material = draw(gpu, {
		shader: materialShader,
		geometry: resources.gpuMesh.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
		label: "intro-metal-incident-light",
	});
	let output: Target | undefined;
	return {
		render(
			f: Frame,
			size: readonly [number, number],
			params: ReturnType<typeof writeParams>,
			light: IntroLight,
		) {
			if (!output) {
				output = target(gpu, {
					size,
					format: "rgba16float",
					msaa: true,
					depth: "depth24plus",
					clearColor: [0, 0, 0, 0],
					label: "intro-metal-radiance",
				});
			} else {
				output.resize(size);
			}
			material.set({
				params,
				illum: {
					camera: light.camera,
					source: light.source,
					apertureRect: aperture.rect,
					sourceStrength: [...light.strengths, light.environment],
					energy: [light.intensity, light.time, 0, 0],
				},
				studioCube: resources.studioCubemap.view,
				studioSampler: resources.studioCubemap.sampler,
				apertureMask: aperture.target.color.view,
				apertureSampler: resources.sampler,
				bvhNodes: visibility.bvhNodes,
				bvhTriangles: visibility.bvhTriangles,
			});
			f.pass(output, (pass) => pass.draw(material));
			return output;
		},
		dispose() {
			output?.color.destroy();
			output?.depth?.destroy();
			// As with baseline scene targets, Gpu owns the private MSAA attachment.
			output = undefined;
			visibility.dispose();
		},
	};
}
