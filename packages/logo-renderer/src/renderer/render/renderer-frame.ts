import { frame, target as createTarget, type Frame, type Target } from "vgpu";
import { bloomRadiusForDevicePixelRatio } from "./constants";
import { renderBackDepth, renderBackMaterial } from "./passes/back-pass";
import { renderScene } from "./passes/scene-pass";
import { renderAtmosphereDepth, renderAtmosphereFrame } from "./renderer-atmosphere";
import { renderDiagnostic } from "./renderer-debug";
import { compositeScene } from "./renderer-composite";
import type { RendererState } from "./renderer-state";
import type { BloomTargets, ImprintRenderOptions, PaintTargets, RenderControls } from "./types";

export function renderGlass(
	state: RendererState,
	out: Target,
	c: Readonly<RenderControls>,
	lw: number,
	lh: number,
	im: ImprintRenderOptions = {},
) {
	const { gpu, options, backRefraction, cache, paint } = state;
	const w = Math.max(1, Math.round(lw));
	const h = Math.max(1, Math.round(lh));
	const pad = options.paddingRadius ?? bloomRadiusForDevicePixelRatio(im.devicePixelRatio);
	const needs =
		(backRefraction && c.material === "glass") ||
		c.material === "back-albedo" ||
		c.material === "back-depth" ||
		c.material === "thickness";
	const t = cache.ensure(w, h, pad, needs);
	const pt = paint.ensure(w, h, im.gridScaleMultiplier);
	state.latestLogo = out;
	if (im.atmosphere) {
		if (state.atmosphereDepth) state.atmosphereDepth.resize(t.scene.size);
		else
			state.atmosphereDepth = createTarget(gpu, {
				size: t.scene.size,
				format: "r32float",
				depth: "depth24plus",
				clearColor: [0, 0, 0, 0],
				label: "eve-5-atmosphere-front-depth",
			});
	}
	frame(gpu, (f) => {
		renderGlassFrame(state, f, out, c, w, h, pad, needs, t, pt, im);
	});
}

function renderGlassFrame(
	state: RendererState,
	f: Frame,
	out: Target,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad: number,
	needs: boolean,
	t: BloomTargets,
	pt: PaintTargets,
	im: ImprintRenderOptions,
) {
	const { r, mesh, paint, backRefraction } = state;
	renderAtmosphereDepth(state, f, c, w, h, pad, im);
	if (needs && t.backMaterial && t.backDepth) {
		renderBackMaterial(f, r, mesh, t.backMaterial, c, w, h, pad);
		renderBackDepth(f, r, mesh, t.backDepth, c, w, h, pad);
	}
	paint.apply(f, pt, im.paint);
	if (renderDiagnostic(state, f, out, t, pt, c, w, h, pad)) return;
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
	state.latestScene = t.scene;
	if (state.atmosphereDepth)
		renderAtmosphereFrame(state, f, t.scene.color, state.atmosphereDepth.color, c, im, true);
	compositeScene(f, r, out, t, pad, im.progress ?? 0);
}
