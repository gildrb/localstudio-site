import type { Frame, Target } from "vgpu";
import type { Texture } from "vgpu/core";
import { PASS_OUTSIDE, PASS_WIREFRAME } from "../constants";
import { writeParams } from "../params";
import type { RendererResources } from "../resources";
import type { ImprintRenderOptions, MeshInput, RenderControls } from "../types";
export function renderScene(
	f: Frame,
	r: RendererResources,
	m: MeshInput,
	target: Target,
	backMaterial: Texture,
	backDepth: Texture,
	paint: Texture,
	voronoiValue: Texture,
	voronoiEdge: Texture,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad = r.paddingRadius,
	im: ImprintRenderOptions = {},
) {
	const base = sceneParameters(r, m, c, w, h, pad);
	// Cached views preserve resource identity and avoid per-frame createView() calls.
	const bindings = {
		studioCube: r.studioCubemap.view,
		studioSampler: r.studioCubemap.sampler,
		backMaterial: backMaterial.view,
		backDepth: backDepth.view,
		paintTex: paint.view,
		asciiVoronoiValueTex: voronoiValue.view,
		asciiVoronoiEdgeTex: voronoiEdge.view,
	};
	setSceneMaterials(r, base, bindings, c, im);
	f.pass(target, (pass) => {
		if (c.showEnv) pass.draw(r.pipelines.envBg);
		if (c.outsideRendering)
			pass.draw(
				c.material === "glass" || c.material === "thickness"
					? r.pipelines.frontMaterial
					: r.pipelines.opaque,
			);
		if (c.wireframe) pass.draw(r.pipelines.wire);
	});
}

function sceneParameters(
	r: RendererResources,
	m: MeshInput,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad: number,
) {
	return {
		controls: c,
		logicalWidth: w,
		logicalHeight: h,
		projectionPaddingRadius: pad,
		meshBounds: m.bounds,
		orbitTarget: r.orbitTarget,
		thicknessScale: r.thicknessScale,
		isLight: r.isLight,
	};
}

function setSceneMaterials(
	r: RendererResources,
	base: Readonly<ReturnType<typeof sceneParameters>>,
	bindings: {
		readonly studioCube: RendererResources["studioCubemap"]["view"];
		readonly studioSampler: RendererResources["studioCubemap"]["sampler"];
		readonly backMaterial: Texture["view"];
		readonly backDepth: Texture["view"];
		readonly paintTex: Texture["view"];
		readonly asciiVoronoiValueTex: Texture["view"];
		readonly asciiVoronoiEdgeTex: Texture["view"];
	},
	c: Readonly<RenderControls>,
	im: ImprintRenderOptions,
) {
	if (c.showEnv)
		r.pipelines.envBg.set({
			params: writeParams({ ...base, passKind: PASS_OUTSIDE }),
			studioCube: r.studioCubemap.view,
			studioSampler: r.studioCubemap.sampler,
		});
	if (c.material === "glass" || c.material === "thickness")
		r.pipelines.frontMaterial.set({
			...bindings,
			params: writeParams({ ...base, passKind: PASS_OUTSIDE, imprint: im }),
		});
	else
		r.pipelines.opaque.set({
			...bindings,
			params: writeParams({ ...base, passKind: PASS_OUTSIDE }),
		});
	if (c.wireframe)
		r.pipelines.wire.set({
			...bindings,
			params: writeParams({ ...base, passKind: PASS_WIREFRAME }),
		});
}
