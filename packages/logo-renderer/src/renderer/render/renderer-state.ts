// One renderer instance owns these existing resources and lazy frame caches.
import type { Gpu, Target } from "vgpu";
import type { StudioCubemapAtlas } from "./cubemap";
import type { createPaintSystem } from "./paint-system";
import type { writeParams } from "./params";
import type { RendererResources } from "./resources";
import type { createBloomTargetCache } from "./targets";
import type { MeshInput } from "./types";
import type { createIntroAtmosphere } from "./intro-atmosphere";
import type { createPrismAtmosphere } from "./prism/atmosphere";
import type { createIlluminationAtmosphere } from "./illumination/atmosphere";

export type RendererOptions = {
	thicknessScale?: number;
	theme?: "light" | "dark";
	environmentTheme?: "light" | "dark";
	paddingRadius?: number;
	bloom?: boolean;
	backRefraction?: boolean;
	environmentAtlas?: StudioCubemapAtlas;
};

export type RendererState = {
	readonly gpu: Gpu;
	readonly mesh: MeshInput;
	readonly options: RendererOptions;
	readonly r: RendererResources;
	readonly backRefraction: boolean;
	readonly cache: ReturnType<typeof createBloomTargetCache>;
	readonly paint: ReturnType<typeof createPaintSystem>;
	intro: ReturnType<typeof createIntroAtmosphere> | undefined;
	latestScene: Target | undefined;
	latestLogo: Target | undefined;
	atmosphereDepth: Target | undefined;
	atmosphereParams: ReturnType<typeof writeParams> | undefined;
	prism: ReturnType<typeof createPrismAtmosphere> | undefined;
	illumination: ReturnType<typeof createIlluminationAtmosphere> | undefined;
	atmosphereCamera: readonly [number, number, number, number];
};
