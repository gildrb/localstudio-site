import { draw, target, type Frame, type Gpu, type Target } from "vgpu";
import materialShader from "../shaders/glass/intro-material.wgsl";
import type { createApertureMask } from "./aperture-mask";
import { createIntroVisibility } from "./intro-visibility";
import type { IntroSceneParameters } from "./intro-inputs";
import type { RendererResources } from "./resources";
import type { MeshInput } from "./types";

type IntroLight = {
	readonly camera: readonly number[];
	readonly source: readonly [number, number, number, number];
	readonly strengths: readonly number[];
	readonly intensity: number;
	readonly environment: number;
	readonly time: number;
};

/** A separate incident-light response; never changes the approved studio material. */
export function createIntroMaterial(
	gpu: Gpu,
	resources: RendererResources,
	mesh: MeshInput,
	aperture: ReturnType<typeof createApertureMask>,
) {
	const { visibility, material } = createIntroMaterialResources(gpu, resources, mesh);
	let output: Target | undefined;
	return {
		render(
			f: Frame,
			size: readonly [number, number],
			params: IntroSceneParameters,
			light: IntroLight,
		) {
			if (output === undefined) output = createIntroMaterialTarget(gpu, size);
			else output.resize(size);
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
			f.pass(output, (pass) => {
				pass.draw(material);
			});
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

function createIntroMaterialTarget(gpu: Gpu, size: readonly [number, number]) {
	return target(gpu, {
		size,
		format: "rgba16float",
		msaa: true,
		depth: "depth24plus",
		clearColor: [0, 0, 0, 0],
		label: "intro-metal-radiance",
	});
}

function createIntroMaterialResources(gpu: Gpu, resources: RendererResources, mesh: MeshInput) {
	const visibility = createIntroVisibility(gpu, mesh);
	const material = draw(gpu, {
		shader: materialShader,
		geometry: resources.gpuMesh.triangles,
		cull: "back",
		depth: { write: true, compare: "less" },
		label: "intro-metal-incident-light",
	});
	return { visibility, material };
}
