import { draw, geometry, target, type Frame, type Gpu } from "vgpu";
import type { Texture } from "vgpu/core";
import beamShader from "../../shaders/prism/beam.wgsl";
import { STUDIO_BACKLIGHT_POSITION } from "../env-lights";
import { cameraBasis, dot, lookAt, multiply, perspective } from "../math";
import type { writeParams } from "../params";
import { createPrismPostprocess } from "../prism-post";
import type { RendererResources } from "../resources";
import { shaders } from "../shaders";
import type { ImprintRenderOptions, MeshData, RenderControls, Vec3 } from "../types";
import { createPrismRibbonVertices, PRISM_BEAM_OPACITY } from "./ribbons";

type SceneParams = ReturnType<typeof writeParams>;

/** Source-based, opt-in light graph; no material or cubemap policy lives here. */
export function createPrismAtmosphere(gpu: Gpu, r: RendererResources, mesh: MeshData) {
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
	let cachedKey = "";
	let lightKey = "";
	let lightViewProj: Float32Array = new Float32Array(16);
	let lightForward: Vec3 = [0, 0, 1];
	let lightPosition: Vec3 = [0, 0, -1];
	return {
		targets: { background, foreground, lightDepth },
		render(
			f: Frame,
			scene: Texture,
			depth: Texture,
			params: SceneParams,
			controls: RenderControls,
			imprint: ImprintRenderOptions,
			day: boolean,
			sceneChanged: boolean,
		) {
			const atmosphere = imprint.atmosphere;
			if (!atmosphere) return;
			const size = atmosphere.target.size;
			const beamOpacity = Number.isFinite(atmosphere.beamOpacity)
				? Math.max(0, Math.min(1, atmosphere.beamOpacity!))
				: PRISM_BEAM_OPACITY;
			const nextLightKey = [
				controls.envYaw,
				controls.envPitch,
				controls.depthOpening ?? 0,
				controls.outsideRendering,
			].join(",");
			if (nextLightKey !== lightKey) {
				const [x, y, z] = STUDIO_BACKLIGHT_POSITION;
				const cy = Math.cos(controls.envYaw),
					sy = Math.sin(controls.envYaw);
				const cp = Math.cos(controls.envPitch),
					sp = Math.sin(controls.envPitch);
				const py = y * cp + z * sp,
					pz = -y * sp + z * cp;
				lightPosition = [x * cy + pz * sy, py, -x * sy + pz * cy];
				const basis = cameraBasis(lightPosition, r.orbitTarget);
				lightForward = basis.forward;
				lightViewProj = multiply(
					perspective((Math.PI * 2) / 3, 1, 0.005, 12),
					lookAt(lightPosition, r.orbitTarget, basis.up),
				);
				shadow.set({
					params: {
						...params,
						viewProj: lightViewProj,
						cameraPos: lightPosition,
						cameraRight: basis.right,
						cameraUp: basis.up,
						cameraForward: lightForward,
					},
				});
				f.pass({ target: lightDepth, clear: [1e6, 0, 0, 0] }, (pass) => {
					if (controls.outsideRendering) pass.draw(shadow);
				});
				lightKey = nextLightKey;
			}
			const nextKey = [
				nextLightKey,
				...size,
				...atmosphere.logoRect,
				...params.viewProj,
				beamOpacity,
				day,
				atmosphere.dayRoom ?? 1,
			].join(",");
			const changed = sceneChanged || nextKey !== cachedKey;
			// Keep identical XY projection but extend clipping beyond the mesh bounds.
			const viewProj = multiply(
				perspective(params.fov, params.aspect, 0.005, 30),
				lookAt(params.cameraPos, r.orbitTarget, params.cameraUp),
			);
			if (changed) {
				for (const [layer, destination] of [background, foreground].entries()) {
					if (destination.size[0] !== size[0] || destination.size[1] !== size[1])
						destination.resize(size);
					const beam = beams[layer]!;
					beam.set({
						lightDepth: lightDepth.color.view,
						sceneDepth: depth.view,
						sceneTexture: scene.view,
						params: {
							viewProj,
							lightViewProj,
							logoRect: atmosphere.logoRect,
							lightPosition,
							beamOpacity,
							lightForward,
							foreground: layer,
							cameraForward: params.cameraForward,
							resolution: size,
						},
					});
					f.pass({ target: destination, clear: [0, 0, 0, 0] }, (pass) => {
						if (vertices.length > 0) pass.draw(beam);
					});
				}
				cachedKey = nextKey;
			}
			post.render(f, {
				background,
				foreground,
				scene,
				depth,
				logoRect: atmosphere.logoRect,
				camera: [
					Math.tan(params.fov / 2),
					params.aspect,
					-dot(params.cameraPos, params.cameraForward),
					controls.radius,
				],
				viewProj,
				eye: params.cameraPos,
				forward: params.cameraForward,
				right: params.cameraRight,
				up: params.cameraUp,
				time: imprint.time ?? 0,
				day,
				dayRoom: beamOpacity > 0 ? (atmosphere.dayRoom ?? 1) : 1,
				pixelScale: atmosphere.pixelScale ?? 1,
				output: atmosphere.target,
				foregroundOutput: atmosphere.foregroundTarget,
				sceneChanged: changed,
			});
		},
		dispose() {
			ribbon.destroy();
			post.dispose();
			for (const value of [background, foreground, lightDepth]) {
				value.color.destroy();
				value.depth?.destroy();
			}
			// Target-private MSAA attachments are owned by the parent Gpu lifecycle.
		},
	};
}
