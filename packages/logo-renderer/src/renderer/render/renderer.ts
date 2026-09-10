// Eve renderer frame graph on the public vgpu API.
import { frame, target as createTarget, type Gpu, type Target } from "vgpu";
import {
	PASS_OUTSIDE,
	BLOOM_STRENGTH_OFF,
	BLOOM_STRENGTH_ON,
	bloomRadiusForDevicePixelRatio,
} from "./constants";
import type { StudioCubemapAtlas } from "./cubemap";
import { clampUnit, dot, mix } from "./math";
import { writeParams } from "./params";
import { createPaintSystem } from "./paint-system";
import { createPrismAtmosphere } from "./prism/atmosphere";
import { createIlluminationAtmosphere } from "./illumination/atmosphere";
import { renderAtmosphere } from "./passes/atmosphere-pass";
import { createIntroAtmosphere } from "./intro-atmosphere";
import { renderBackDepth, renderBackMaterial } from "./passes/back-pass";
import { renderBlur, renderComposite } from "./passes/bloom-pass";
import { renderTargetPreview, renderThicknessDebug } from "./passes/debug-passes";
import { renderLightComposite } from "./passes/light-composite-pass";
import { renderScene } from "./passes/scene-pass";
import { createResources, disposeResources } from "./resources";
import { createBloomTargetCache } from "./targets";
import type { ImprintRenderOptions, MeshData, RenderControls } from "./types";
export function createEve5Renderer(
	gpu: Gpu,
	mesh: MeshData,
	options: {
		thicknessScale?: number;
		theme?: "light" | "dark";
		environmentTheme?: "light" | "dark";
		paddingRadius?: number;
		bloom?: boolean;
		backRefraction?: boolean;
		environmentAtlas?: StudioCubemapAtlas;
	} = {},
) {
	const r = createResources(gpu, mesh, options),
		backRefraction = options.backRefraction ?? true,
		cache = createBloomTargetCache(gpu),
		paint = createPaintSystem(gpu, r, mesh);
	let intro: ReturnType<typeof createIntroAtmosphere> | undefined;
	let latestScene: Target | undefined;
	let latestLogo: Target | undefined;
	let atmosphereDepth: Target | undefined;
	let atmosphereParams: ReturnType<typeof writeParams> | undefined;
	let prism: ReturnType<typeof createPrismAtmosphere> | undefined;
	let illumination: ReturnType<typeof createIlluminationAtmosphere> | undefined;
	let atmosphereCamera: readonly [number, number, number, number] = [1, 1, 0, 1];
	const renderGlass = (
		out: Target,
		c: RenderControls,
		lw: number,
		lh: number,
		im: ImprintRenderOptions = {},
	) => {
		const w = Math.max(1, Math.round(lw)),
			h = Math.max(1, Math.round(lh)),
			pad = options.paddingRadius ?? bloomRadiusForDevicePixelRatio(im.devicePixelRatio),
			needs =
				(backRefraction && c.material === "glass") ||
				c.material === "back-albedo" ||
				c.material === "back-depth" ||
				c.material === "thickness",
			t = cache.ensure(w, h, pad, needs),
			pt = paint.ensure(w, h, im.gridScaleMultiplier);
		latestLogo = out;
		if (im.atmosphere) {
			if (!atmosphereDepth) {
				atmosphereDepth = createTarget(gpu, {
					size: t.scene.size,
					format: "r32float",
					depth: "depth24plus",
					clearColor: [0, 0, 0, 0],
					label: "eve-5-atmosphere-front-depth",
				});
			} else atmosphereDepth.resize(t.scene.size);
		}
		frame(gpu, (f) => {
			if (im.atmosphere && atmosphereDepth) {
				const depthParams = writeParams({
					controls: c,
					logicalWidth: w,
					logicalHeight: h,
					passKind: PASS_OUTSIDE,
					projectionPaddingRadius: pad,
					meshBounds: mesh.bounds,
					orbitTarget: r.orbitTarget,
					thicknessScale: r.thicknessScale,
					isLight: r.isLight,
					imprint: im,
				});
				atmosphereParams = depthParams;
				atmosphereCamera = [
					Math.tan(depthParams.fov / 2),
					depthParams.aspect,
					-dot(depthParams.cameraPos, depthParams.cameraForward),
					c.radius,
				];
				r.pipelines.atmosphereDepth.set({ params: depthParams });
				f.pass(atmosphereDepth, (pass) => {
					if (c.outsideRendering) pass.draw(r.pipelines.atmosphereDepth);
				});
			}
			if (needs && t.backMaterial && t.backDepth) {
				renderBackMaterial(f, r, mesh, t.backMaterial, c, w, h, pad);
				renderBackDepth(f, r, mesh, t.backDepth, c, w, h, pad);
			}
			paint.apply(f, pt, im.paint);
			if (
				(c.material === "back-albedo" || c.material === "back-depth") &&
				t.backMaterial &&
				t.backDepth
			) {
				renderTargetPreview(f, r, mesh, out, t.backMaterial.color, t.backDepth.color, c);
				return;
			}
			if (c.material === "thickness" && t.backMaterial && t.backDepth) {
				renderThicknessDebug(
					f,
					r,
					mesh,
					out,
					t.backMaterial.color,
					t.backDepth.color,
					pt.paint.read.color,
					c,
					w,
					h,
					pad,
				);
				return;
			}
			if (c.material === "paint-debug") {
				paint.renderDebug(f, out, pt);
				return;
			}
			paint.renderVoronoiNoise(f, pt, c, w, h, pad, im);
			renderScene(
				f,
				r,
				mesh,
				t.scene,
				backRefraction && t.backMaterial
					? t.backMaterial.color
					: r.fallbacks.fallbackBackMaterial.color,
				backRefraction && t.backDepth ? t.backDepth.color : r.fallbacks.fallbackBackDepth.color,
				pt.paint.read.color,
				pt.voronoi.colors[0],
				pt.voronoi.colors[1]!,
				c,
				w,
				h,
				pad,
				im,
			);
			latestScene = t.scene;
			if (
				im.atmosphere &&
				(im.atmosphere.lightGain ?? 0) > 0 &&
				atmosphereDepth &&
				atmosphereParams
			) {
				illumination ??= createIlluminationAtmosphere(gpu, r, mesh, im.atmosphere);
				illumination.render(
					f,
					t.scene.color,
					atmosphereDepth.color,
					atmosphereParams,
					c,
					im,
					options.environmentTheme === "light",
				);
			} else if (im.atmosphere?.prism && atmosphereDepth && atmosphereParams) {
				prism ??= createPrismAtmosphere(gpu, r, mesh);
				prism.render(
					f,
					t.scene.color,
					atmosphereDepth.color,
					atmosphereParams,
					c,
					im,
					options.environmentTheme === "light",
					true,
				);
			} else if (atmosphereDepth) {
				renderAtmosphere(
					f,
					r,
					t.scene.color,
					atmosphereDepth.color,
					atmosphereCamera,
					c,
					im,
					options.environmentTheme === "light",
				);
			}
			if (r.isLight) {
				renderLightComposite(f, r, out, t);
				return;
			}
			if (!r.bloomEnabled) {
				renderComposite(f, r, out, t, t.scene.color, 0);
				return;
			}
			const strength = mix(BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON, clampUnit(im.progress ?? 0));
			renderBlur(f, r, t.scene.color, t.bloom.write, [1, 0], true, pad);
			t.bloom.swap();
			renderBlur(
				f,
				r,
				t.bloom.read.color,
				t.bloom.write,
				[0, 1],
				false,
				Math.max(0, Math.round(pad / 2)),
			);
			t.bloom.swap();
			renderComposite(f, r, out, t, t.bloom.read.color, strength);
		});
	};
	return {
		render(
			target: Target,
			controls: RenderControls,
			logicalWidth: number,
			logicalHeight: number,
			imprint?: ImprintRenderOptions,
		) {
			renderGlass(target, controls, logicalWidth, logicalHeight, imprint);
		},
		/** Reuses the baseline mesh frame. An active intro has its own material-light pass. */
		renderAtmosphere(controls: RenderControls, imprint: ImprintRenderOptions) {
			if (!latestScene || !latestLogo || !atmosphereDepth || !imprint.atmosphere) return;
			const scene = latestScene.color;
			const depth = atmosphereDepth.color;
			frame(gpu, (f) => {
				if (imprint.atmosphere && (imprint.atmosphere.lightGain ?? 0) > 0 && atmosphereParams) {
					illumination ??= createIlluminationAtmosphere(gpu, r, mesh, imprint.atmosphere);
					illumination.render(
						f,
						scene,
						depth,
						atmosphereParams,
						controls,
						imprint,
						options.environmentTheme === "light",
					);
				} else if (imprint.atmosphere?.prism && atmosphereParams) {
					prism ??= createPrismAtmosphere(gpu, r, mesh);
					prism.render(
						f,
						scene,
						depth,
						atmosphereParams,
						controls,
						imprint,
						options.environmentTheme === "light",
						false,
					);
				} else {
					renderAtmosphere(
						f,
						r,
						scene,
						depth,
						atmosphereCamera,
						controls,
						imprint,
						options.environmentTheme === "light",
					);
				}
			});
		},
		/** Opt-in native diagnostics; no allocations until Prism is rendered. */
		get prismTargets() {
			return prism?.targets;
		},
		/** Last active added-light targets; gain zero uses the original direct path. */
		get illuminationTargets() {
			return illumination?.targets;
		},
		/** Exact model-plane RGB opening identity; allocated only for the intro. */
		get apertureMask() {
			return intro?.apertureMask;
		},
		/** Linear HDR fields for native diagnostics, never SDR canvas overlays. */
		get introTargets() {
			return intro?.targets;
		},
		dispose() {
			intro?.dispose();
			intro = undefined;
			illumination?.dispose();
			illumination = undefined;
			prism?.dispose();
			prism = undefined;
			atmosphereParams = undefined;
			latestScene = undefined;
			latestLogo = undefined;
			atmosphereDepth?.color.destroy();
			atmosphereDepth?.depth?.destroy();
			atmosphereDepth = undefined;
			paint.dispose();
			cache.dispose();
			disposeResources(r);
		},
	};
}
