import type { Frame, Target } from "vgpu";
import { renderTargetPreview, renderThicknessDebug } from "./passes/debug-passes";
import type { RendererState } from "./renderer-state";
import type { BloomTargets, PaintTargets, RenderControls } from "./types";

export function renderDiagnostic(
	state: RendererState,
	f: Frame,
	out: Target,
	t: BloomTargets,
	pt: PaintTargets,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad: number,
) {
	const { r, mesh, paint } = state;
	if (
		(c.material === "back-albedo" || c.material === "back-depth") &&
		t.backMaterial &&
		t.backDepth
	) {
		renderTargetPreview(f, r, mesh, out, t.backMaterial.color, t.backDepth.color, c);
		return true;
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
		return true;
	}
	if (c.material === "paint-debug") {
		paint.renderDebug(f, out, pt);
		return true;
	}
	return false;
}
