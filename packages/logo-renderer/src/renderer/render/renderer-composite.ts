import type { Frame, Target } from "vgpu";
import { BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON } from "./constants";
import { clampUnit, mix } from "./math";
import { renderBlur, renderComposite } from "./passes/bloom-pass";
import { renderLightComposite } from "./passes/light-composite-pass";
import type { RendererResources } from "./resources";
import type { BloomTargets } from "./types";

export function compositeScene(
	f: Frame,
	r: RendererResources,
	out: Target,
	t: BloomTargets,
	pad: number,
	progress: number,
) {
	if (r.isLight) {
		renderLightComposite(f, r, out, t);
		return;
	}
	if (!r.bloomEnabled) {
		renderComposite(f, r, out, t, t.scene.color, 0);
		return;
	}
	const strength = mix(BLOOM_STRENGTH_OFF, BLOOM_STRENGTH_ON, clampUnit(progress));
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
}
