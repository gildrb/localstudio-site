// Renderer domain types and GPU resource shapes.
// INVARIANT: Pure move from render.ts; keep shader ABI, binding order, and pixel output unchanged.
// Imported by render/renderer.ts and re-exported only through render.ts facade.

import type { Geometry, PingPongTargets, Target } from "vgpu";
import type { Texture } from "vgpu/core";

export type Bounds = {
	readonly min: readonly [number, number, number];
	readonly max: readonly [number, number, number];
};

/** Read access shared by geometry upload, projection, and aperture extraction. */
export type MeshInput = {
	readonly positions: Readonly<Float32Array<Readonly<ArrayBufferLike>>>;
	readonly normals: Readonly<Float32Array<Readonly<ArrayBufferLike>>>;
	readonly indices: Readonly<Uint32Array<Readonly<ArrayBufferLike>>>;
	readonly bounds: Bounds;
};

/** Decoded typed arrays remain available to mesh producers and asset tools. */
export type MeshData = {
	positions: Float32Array;
	normals: Float32Array;
	indices: Uint32Array;
	bounds: Bounds;
};

export type EveMaterial =
	| "glass"
	| "normal"
	| "camera reflected normal"
	| "metallic"
	| "back-albedo"
	| "back-depth"
	| "thickness"
	| "paint-debug";

export type PaintSeed = {
	readonly width: number;
	readonly height: number;
	readonly values: Readonly<Float32Array<Readonly<ArrayBufferLike>>>;
};

export type PaintStroke = {
	readonly fromCell: readonly [number, number];
	readonly toCell: readonly [number, number];
	readonly duration?: number;
	readonly movementGated?: boolean;
};

export type PaintRenderOptions = {
	readonly seed?: PaintSeed | undefined;
	readonly steps?: number | undefined;
	readonly dt?: number | undefined;
	readonly brushCell?: readonly [number, number];
	readonly brushPreviousCell?: readonly [number, number];
	readonly brushRadius?: number;
	readonly brushStrength?: number;
	readonly brushActive?: boolean;
	readonly decayRate?: number;
	readonly diffusionRate?: number;
	readonly diffusionJitter?: number;
	readonly stroke?: PaintStroke | undefined;
	readonly decaySteps?: number | undefined;
	readonly ripple?:
		| {
				readonly center: readonly [number, number];
				readonly age: number;
				readonly strength: number;
		  }
		| undefined;
};

export type ImprintRenderOptions<TargetResource = Target> = {
	progress?: number;
	gridScaleMultiplier?: number;
	glyphScale?: number;
	time?: number;
	mouse?: readonly [number, number];
	paint?: PaintRenderOptions;
	devicePixelRatio?: number;
	/** Separate full-hero surface. Rect maps the padded logo canvas into hero UV. */
	atmosphere?:
		| {
				target: TargetResource;
				foregroundTarget?: TargetResource | undefined;
				logoRect: readonly [number, number, number, number];
				/** One-shot actual-hole lighting time in seconds. Omitted preserves the approved atmosphere. */
				introTime?: number;
				/** Optional opaque intro presentation. Visibility changes only after the settled frame. */
				introTarget?: TargetResource | undefined;
				/** Actual unpadded host canvas framing and its fixed presentation opacity. */
				introPresentation?: {
					logoRect: readonly [number, number, number, number];
					logoOpacity: number;
				};
				/** Extra same-medium light. Omitted or zero preserves the approved atmosphere. */
				lightGain?: number;
				/** Source-based Prism beams and bloom. Omitted keeps the neutral fallback. */
				prism?: boolean;
				/** Prism linear beam gain; defaults to the requested 0.72. */
				beamOpacity?: number;
				/** Optional neutral day-room display gray; 1 keeps the light layer clear. */
				dayRoom?: number;
				/** Render-target pixels per CSS pixel, for physical dust sizes. */
				pixelScale?: number;
		  }
		| undefined;
};

export type RenderControls = {
	/** Smooth opening amount, 0–1; rear depth extends by at most 12%. */
	depthOpening?: number;
	yaw: number;
	pitch: number;
	radius: number;
	fov: number;
	envYaw: number;
	envPitch: number;
	insideRendering: boolean;
	outsideRendering: boolean;
	material: EveMaterial;
	wireframe: boolean;
	showEnv: boolean;
};

export type PaintPointerRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export type PaintPointerMappingInput = {
	clientX: number;
	clientY: number;
	rect: PaintPointerRect;
	canvasWidth: number;
	canvasHeight: number;
	logicalWidth: number;
	logicalHeight: number;
	controls: Pick<RenderControls, "radius" | "yaw" | "pitch" | "fov">;
	meshBounds: Bounds;
	gridScaleMultiplier?: number;
	paddingRadius?: number;
	devicePixelRatio?: number;
};

export type PaintPointerMapping = {
	physical: readonly [number, number];
	logical: readonly [number, number];
	model: readonly [number, number];
	brushCell: readonly [number, number];
	originCell: readonly [number, number];
	gridScale: number;
	pxPerModelUnit: number;
	insideLogicalBounds: boolean;
};

export type GpuMesh = {
	triangles: Geometry;
	lines: Geometry;
};

export type StudioCubemap = {
	texture: Texture;
	view: GPUTextureView;
	sampler: GPUSampler;
};

export type Mat4<Buffer extends ArrayBufferLike = ArrayBufferLike> = Float32Array<Buffer>;
export type Vec3 = readonly [number, number, number];

export type EnvLightConfig = {
	readonly name: string;
	readonly position: readonly [number, number, number];
	readonly color: string;
	readonly intensity: number;
	readonly radius: number;
	readonly softness: number;
	readonly luminance: number;
};

export type BloomTargets = {
	width: number;
	height: number;
	scene: Target;
	backMaterial: Target | undefined;
	backDepth: Target | undefined;
	bloom: PingPongTargets;
};

export type PaintTargets = {
	cols: number;
	rows: number;
	paint: PingPongTargets;
	staticNoise: Target;
	voronoi: Target;
};
