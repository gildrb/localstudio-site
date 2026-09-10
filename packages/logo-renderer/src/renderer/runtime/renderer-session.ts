import type { HeroRuntimeState } from "./state";
import type { RendererSettings, SampledSettings } from "./renderer-options";
import type { RendererRefs, RendererCallbacks } from "./renderer-refs";

export type RendererSession = {
	readonly state: HeroRuntimeState;
	readonly settings: RendererSettings;
	readonly sampled: SampledSettings;
	readonly refs: RendererRefs;
	readonly callbacks: RendererCallbacks;
	disposeRuntime: (() => void) | undefined;
};
