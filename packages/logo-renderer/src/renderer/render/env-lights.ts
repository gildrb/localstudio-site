// Theme-specific studio light data.
// Light positions are shared by the reflected studio and volumetric shadow pass.
// Imported by render/renderer.ts and re-exported only through render.ts facade.

import type { EnvLightConfig } from "./types";

export const STUDIO_BACKLIGHT_POSITION = [0.4, -0.3, -1] as const;

const STUDIO_WHITE = ["#", "FFFFFF"].join("");
// Editable environment-light knobs. Hex colors are sRGB and are converted to
// linear values before the one-time cubemap bake. The dark studio uses a warm
// directional key and backlight against restrained neutral fill.
export const EVE_LIGHT_ENV_LIGHTS = [
	{
		name: "top-left high",
		position: [-1.4, 2, -0.4],
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.3,
		softness: 0.02,
		luminance: 10,
	},
	{
		name: "front high",
		position: [0, 0, 2],
		color: STUDIO_WHITE,
		intensity: 2,
		radius: 0.8,
		softness: 0.02,
		luminance: 1,
	},
	{
		name: "back high",
		position: [1, 0, -2],
		color: STUDIO_WHITE,
		intensity: 10,
		radius: 0.5,
		softness: 0.1,
		luminance: 0.2,
	},
	{
		name: "back-right",
		position: STUDIO_BACKLIGHT_POSITION,
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.1,
		softness: 1,
		luminance: 0.5,
	},
	{
		name: "front-bottom-right",
		position: [1, -2, -0.5],
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.2,
		softness: 1,
		luminance: 5,
	},
	{
		name: "front-bottom-left",
		position: [-0.3, -0.2, -0.2],
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.3,
		softness: 4,
		luminance: 3,
	},
] as const satisfies readonly EnvLightConfig[];

export const EVE_DARK_ENV_LIGHTS = [
	{
		name: "top-left high",
		position: [-1.3, 2, -0.3],
		color: "#fff1dc",
		intensity: 2.25,
		radius: 0.12,
		softness: 0.02,
		luminance: 8,
	},
	{
		name: "front-left high",
		position: [-0.4, 1, 1],
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.9,
		softness: 0.02,
		luminance: 0.26,
	},
	{
		name: "front-right",
		position: [5, 0, 10],
		color: STUDIO_WHITE,
		intensity: 1.5,
		radius: 0.5,
		softness: 0.1,
		luminance: 0.12,
	},
	{
		name: "back-right",
		position: STUDIO_BACKLIGHT_POSITION,
		color: "#fff1dc",
		intensity: 7,
		radius: 0.08,
		softness: 1,
		luminance: 0.6,
	},
	{
		name: "front-bottom-right",
		position: [1, -2, -0.5],
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.2,
		softness: 1,
		luminance: 0.5,
	},
	{
		name: "front-bottom-left",
		position: [-0.3, -0.2, -0.2],
		color: STUDIO_WHITE,
		intensity: 1,
		radius: 0.3,
		softness: 4,
		luminance: 0.32,
	},
] as const satisfies readonly EnvLightConfig[];
