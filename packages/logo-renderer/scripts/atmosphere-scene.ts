import { checkIllumination, checkPrism } from "./atmosphere-light.ts";
import { checkNearChrome } from "./atmosphere-apertures.ts";
import { writePng, type SnapshotBytes } from "./atmosphere-images.ts";
import { checkSceneInteraction } from "./atmosphere-interaction.ts";
import { createEve5Renderer } from "../src/renderer/render.ts";
import { logoWidth, logoHeight } from "./atmosphere-options.ts";
import {
	gpu,
	mesh,
	options,
	controls,
	imprint,
	logo,
	out,
	foreground,
} from "./atmosphere-runtime.ts";

export type ScenePixels = {
	readonly base: SnapshotBytes;
	readonly near: SnapshotBytes;
	readonly logoPixels: SnapshotBytes;
};

export type AtmosphereRenderer = ReturnType<typeof createEve5Renderer>;
export type AtmosphereCommands = Readonly<Pick<AtmosphereRenderer, "render" | "renderAtmosphere">>;

type IlluminationTargets = NonNullable<AtmosphereRenderer["illuminationTargets"]>;
type PrismTargets = NonNullable<AtmosphereRenderer["prismTargets"]>;

// Diagnostics only read target pixels. Keep creation, mutation and native metadata with the renderer.
export type AtmosphereDiagnostics = AtmosphereCommands & {
	readonly illuminationTargets:
		| Readonly<{
				[Key in keyof IlluminationTargets]: Readonly<
					Pick<IlluminationTargets[Key], "read" | "readFloats">
				>;
		  }>
		| undefined;
	readonly prismTargets:
		| Readonly<{
				[Key in keyof PrismTargets]: Readonly<Pick<PrismTargets[Key], "read" | "readFloats">>;
		  }>
		| undefined;
};

async function validateScheme(
	renderer: AtmosphereDiagnostics,
	scheme: string,
	pixels: Readonly<ScenePixels>,
) {
	const { base, near, logoPixels } = pixels;
	const illumination =
		options.lightGain > 0 ? await checkIllumination(renderer, scheme, pixels) : undefined;
	const prismHdr = options.prism ? await checkPrism(renderer, logoPixels) : undefined;
	const { nearOverLogoMax, nearOverLogoCount } = checkNearChrome(options, near, logoPixels);
	writePng(
		options,
		`${options.output}/hero-atmosphere-${scheme}.png`,
		base,
		scheme,
		undefined,
		near,
	);
	const interactions = await checkSceneInteraction(renderer, pixels, scheme);
	return {
		scheme,
		prismHdr,
		illumination,
		apertures: interactions.apertures,
		nearOverLogoMax,
		nearOverLogoCount,
		pointerDiff: interactions.pointerDiff,
		driftDiff: interactions.driftDiff,
		alphaDiff: interactions.alphaDiff,
		alphaNearDiff: interactions.alphaNearDiff,
		depthDiff: interactions.depthDiff,
		idleMs: interactions.idleMs,
		borders: "zero",
		deterministic: true,
	};
}

export async function renderScheme(scheme: string) {
	const renderer = createEve5Renderer(gpu, mesh, {
		theme: "dark",
		environmentTheme: scheme === "day" ? "light" : "dark",
		bloom: true,
		backRefraction: false,
	});
	try {
		// Safe before first scene.
		renderer.renderAtmosphere(controls, imprint);
		renderer.render(logo, controls, logoWidth, logoHeight, imprint);
		const base = await out.read();
		const near = await foreground.read();
		const logoPixels = await logo.read();
		if (options.validate) return await validateScheme(renderer, scheme, { base, near, logoPixels });
		writePng(
			options,
			`${options.output}/hero-atmosphere-${scheme}.png`,
			base,
			scheme,
			undefined,
			near,
		);
		return null;
	} finally {
		renderer.dispose();
	}
}
