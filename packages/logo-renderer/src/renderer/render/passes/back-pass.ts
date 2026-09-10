import type { Frame } from "vgpu";
import { PASS_INSIDE } from "../constants";
import { writeParams } from "../params";
import type { RendererResources } from "../resources";
import type { MeshInput, RenderControls } from "../types";
const args = (
	r: RendererResources,
	m: MeshInput,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad: number,
) => ({
	controls: c,
	logicalWidth: w,
	logicalHeight: h,
	passKind: PASS_INSIDE,
	projectionPaddingRadius: pad,
	meshBounds: m.bounds,
	orbitTarget: r.orbitTarget,
	thicknessScale: r.thicknessScale,
	isLight: r.isLight,
});
export function renderBackMaterial(
	f: Frame,
	r: RendererResources,
	m: MeshInput,
	target: import("vgpu").Target,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad = r.paddingRadius,
) {
	if (c.insideRendering) {
		r.pipelines.backMaterial.set({
			params: writeParams(args(r, m, c, w, h, pad)),
			studioCube: r.studioCubemap.view,
			studioSampler: r.studioCubemap.sampler,
		});
	}
	f.pass(target, (pass) => {
		if (c.insideRendering) pass.draw(r.pipelines.backMaterial);
	});
}
export function renderBackDepth(
	f: Frame,
	r: RendererResources,
	m: MeshInput,
	target: import("vgpu").Target,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad = r.paddingRadius,
) {
	if (c.insideRendering) {
		r.pipelines.backDepth.set({
			params: writeParams(args(r, m, c, w, h, pad)),
		});
	}
	f.pass(target, (pass) => {
		if (c.insideRendering) pass.draw(r.pipelines.backDepth);
	});
}
