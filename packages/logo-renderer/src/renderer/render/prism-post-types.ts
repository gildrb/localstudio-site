import type { Gpu, Target } from "vgpu";
import type { Texture } from "vgpu/core";
import type { Vec3 } from "./types";
import type { createPostPipelines } from "./prism-post-pipelines";

export type PrismPostArgs = {
	readonly background: Target;
	readonly foreground: Target;
	readonly scene: Texture;
	readonly depth: Texture;
	readonly logoRect: readonly [number, number, number, number];
	readonly camera: readonly [number, number, number, number];
	readonly viewProj: Float32Array;
	readonly eye: Vec3;
	readonly forward: Vec3;
	readonly right: Vec3;
	readonly up: Vec3;
	readonly time: number;
	readonly day: boolean;
	/** Host-selected display gray. 1 (default) leaves the room transparent. */
	readonly dayRoom?: number;
	/** Framebuffer pixels per CSS pixel; source dust sizes are CSS-pixel sizes. */
	readonly pixelScale?: number;
	readonly output: Target;
	readonly foregroundOutput?: Target | undefined;
	readonly sceneChanged: boolean;
};

export type IlluminationPostArgs = {
	readonly baseBackground: Target;
	readonly baseForeground: Target;
	readonly background: Target;
	readonly foreground: Target;
	/** Full-hero opaque geometry coverage in alpha, independent of material alpha. */
	readonly coverage: Target;
	readonly output: Target;
	readonly foregroundOutput?: Target | undefined;
	readonly logoRect: readonly [number, number, number, number];
};

export type PostArgs = PrismPostArgs | (IlluminationPostArgs & { readonly sceneChanged: boolean });

export type PostState = {
	readonly gpu: Gpu;
	readonly lightSampler: GPUSampler;
	readonly pipelines: ReturnType<typeof createPostPipelines>;
	readonly owned: Target[];
	size: readonly [number, number];
	combined: Target | undefined;
	bloom: Array<{ horizontal: Target; vertical: Target }>;
	display: Target[];
	work: Target[];
	initialized: boolean;
	splitForeground: boolean;
	baseMode: boolean;
	disposed: boolean;
};
