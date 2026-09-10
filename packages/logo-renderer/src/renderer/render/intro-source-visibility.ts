// Fixed disk-source visibility. Each array layer stores nearest axial mesh depth.
// Like cubemap.faceTarget, the layer adapter uses only public vgpu target APIs.
import { draw, type Frame, type Gpu, type Target } from "vgpu";
import {
	createResourceIdentity,
	Uniform,
	type ResourceDestroyCallback,
	type Texture,
} from "vgpu/core";
import shadowShader from "../shaders/glass/intro-source-shadow.wgsl";
import type { RendererResources } from "./resources";

const radius = 0.8;
const count = 16;
const resolution = 512;
const near = 0.1;
const far = 4;
const tanFov = 1;
const azimuthCount = 8;

export function createIntroSourceVisibility(gpu: Gpu, resources: RendererResources) {
	const nodes = sourceNodes();
	const { texture, depth, arrayView } = createSourceTextures(gpu);
	const layers = nodes.map((_, i) => createSourceLayer(texture, depth, i));
	const { cameraData, uniforms, draws } = createSourceDraws(gpu, resources, nodes);
	let disposed = false;
	let previousDepthScale = 1;
	return {
		nodes,
		texture,
		arrayView,
		depth,
		resolution,
		near,
		far,
		tanFov,
		render(frame: Frame, depthScale: number) {
			if (disposed) throw new Error("Intro source visibility disposed");
			if (depthScale !== previousDepthScale) {
				for (let i = 0; i < count; i++) {
					cameraData[i]![7] = depthScale;
					uniforms[i]!.write(cameraData[i]!);
				}
				previousDepthScale = depthScale;
			}
			for (let i = 0; i < count; i++) {
				frame.pass({ target: layers[i]!.target, clear: [far, 0, 0, 1], clearDepth: 1 }, (pass) => {
					pass.draw(draws[i]!);
				});
			}
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			for (let i = 0; i < count; i++) {
				for (const callback of layers[i]!.listeners) callback(layers[i]!.target);
				layers[i]!.listeners.clear();
			}
			for (const uniform of uniforms) uniform.destroy();
			texture.destroy();
			depth.destroy();
			// Draw has no public disposal API; pipelines belong to the parent Gpu.
		},
	};
}

type SourceNode = {
	readonly position: readonly [number, number, number];
	readonly weight: number;
};

function sourceNodes(): readonly SourceNode[] {
	// Gauss–Legendre in s=(r/R)^2, then half-step uniform azimuth.
	// Keep radial-major ordering identical to the reviewed physical prototype.
	const radial = [
		[(1 - 1 / Math.sqrt(3)) / 2, 0.5],
		[(1 + 1 / Math.sqrt(3)) / 2, 0.5],
	] as const;
	return radial.flatMap(([s, weight]) =>
		Array.from({ length: azimuthCount }, (_, i) => {
			const angle = ((i + 0.5) * 2 * Math.PI) / azimuthCount;
			const r = radius * Math.sqrt(s);
			return {
				position: [0 + r * Math.cos(angle), 0 + r * Math.sin(angle), -2] as const,
				weight: Math.PI * radius * radius * (weight / azimuthCount),
			};
		}),
	);
}

function createSourceTextures(gpu: Gpu) {
	const texture = gpu.device.createTexture({
		size: [resolution, resolution, count],
		dimension: "2d",
		format: "r32float",
		usage: ["render_attachment", "texture_binding", "copy_src"],
		label: "intro-source-nearest-axial",
	});
	const depth = gpu.device.createTexture({
		size: [resolution, resolution, count],
		dimension: "2d",
		format: "depth32float",
		usage: ["render_attachment"],
		label: "intro-source-hardware-depth",
	});
	const arrayView = texture.createView({
		dimension: "2d-array",
		baseArrayLayer: 0,
		arrayLayerCount: count,
	});
	return { texture, depth, arrayView };
}

function createSourceLayer(texture: Texture, depth: Texture, i: number) {
	const listeners = new Set<ResourceDestroyCallback<Target>>();
	const view = texture.createView({ dimension: "2d", baseArrayLayer: i, arrayLayerCount: 1 });
	const depthView = depth.createView({ dimension: "2d", baseArrayLayer: i, arrayLayerCount: 1 });
	const layer: Target = {
		gpu: texture.gpu,
		size: [resolution, resolution],
		texelSize: [1 / resolution, 1 / resolution],
		color: texture,
		colors: [texture],
		depth,
		format: "r32float",
		sampleCount: 1,
		clearColor: [far, 0, 0, 1],
		resourceIdentity: createResourceIdentity("render-target"),
		resize() {
			throw new Error("Intro source layer targets are fixed-size");
		},
		read() {
			throw new Error("Blit an intro source layer to a 2D target before reading");
		},
		readFloats() {
			throw new Error("Blit an intro source layer to a 2D target before reading");
		},
		onDestroy(callback) {
			listeners.add(callback);
			return () => {
				listeners.delete(callback);
			};
		},
		renderPassDescriptor: sourceLayerDescriptor(view, depthView),
	};
	return { target: layer, listeners };
}

type TargetPassOptions = NonNullable<Parameters<Target["renderPassDescriptor"]>[0]>;
type SourcePassOptions = Readonly<Omit<TargetPassOptions, "clear">> & {
	readonly clear?: Readonly<NonNullable<TargetPassOptions["clear"]>>;
};

function sourceLayerDescriptor(
	view: Readonly<GPUTextureView>,
	depthView: Readonly<GPUTextureView>,
) {
	return (opts: SourcePassOptions = {}): GPURenderPassDescriptor => {
		const clear = opts.clear ?? [far, 0, 0, 1];
		const clearValue =
			"length" in clear ? { r: clear[0], g: clear[1], b: clear[2], a: clear[3] } : clear;
		const colorAttachment: GPURenderPassColorAttachment = {
			view,
			loadOp: opts.preserve === true ? "load" : "clear",
			storeOp: "store",
		};
		if (opts.preserve !== true) colorAttachment.clearValue = clearValue;
		const depthAttachment: GPURenderPassDepthStencilAttachment = { view: depthView };
		if (opts.depthReadOnly === true) depthAttachment.depthReadOnly = true;
		else {
			depthAttachment.depthLoadOp = opts.preserve === true ? "load" : "clear";
			depthAttachment.depthStoreOp = "store";
			if (opts.preserve !== true) depthAttachment.depthClearValue = opts.clearDepth ?? 1;
		}
		return { colorAttachments: [colorAttachment], depthStencilAttachment: depthAttachment };
	};
}

function createSourceDraws(gpu: Gpu, resources: RendererResources, nodes: readonly SourceNode[]) {
	// Separate explicit buffers avoid shared automatic-uniform writes across passes.
	const cameraData = nodes.map(
		(node) => new Float32Array([...node.position, 0, near, far, tanFov, 1]),
	);
	const uniforms = nodes.map((_, i) => {
		const uniform = new Uniform(gpu.device, { size: 32, label: `intro-source-camera-${i}` });
		uniform.write(cameraData[i]!);
		return uniform;
	});
	const draws = nodes.map((_, i) =>
		draw(gpu, {
			shader: shadowShader,
			geometry: resources.gpuMesh.triangles,
			cull: "none",
			depth: { write: true, compare: "less" },
			set: { camera: uniforms[i]! },
			label: `intro-source-${i}`,
		}),
	);
	return { cameraData, uniforms, draws };
}
