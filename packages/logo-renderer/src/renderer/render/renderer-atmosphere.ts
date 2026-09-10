import type { Frame } from "vgpu";
import type { Texture } from "vgpu/core";
import { PASS_OUTSIDE } from "./constants";
import { dot } from "./math";
import { writeParams } from "./params";
import { createPrismAtmosphere } from "./prism/atmosphere";
import { createIlluminationAtmosphere } from "./illumination/atmosphere";
import { renderAtmosphere } from "./passes/atmosphere-pass";
import type { RendererState } from "./renderer-state";
import type { ImprintRenderOptions, RenderControls } from "./types";

export function renderAtmosphereDepth(
	state: RendererState,
	f: Frame,
	c: Readonly<RenderControls>,
	w: number,
	h: number,
	pad: number,
	im: ImprintRenderOptions,
) {
	const { r, mesh, atmosphereDepth } = state;
	if (!im.atmosphere || !atmosphereDepth) return;
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
	state.atmosphereParams = depthParams;
	state.atmosphereCamera = [
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

export function renderAtmosphereFrame(
	state: RendererState,
	f: Frame,
	scene: Texture,
	depth: Texture,
	controls: Readonly<RenderControls>,
	imprint: ImprintRenderOptions,
	sceneChanged: boolean,
) {
	const { gpu, r, mesh, options, atmosphereParams, atmosphereCamera } = state;
	if (imprint.atmosphere && (imprint.atmosphere.lightGain ?? 0) > 0 && atmosphereParams) {
		state.illumination ??= createIlluminationAtmosphere(gpu, r, mesh, imprint.atmosphere);
		state.illumination.render(
			f,
			scene,
			depth,
			atmosphereParams,
			controls,
			imprint,
			options.environmentTheme === "light",
		);
	} else if (imprint.atmosphere?.prism === true && atmosphereParams) {
		state.prism ??= createPrismAtmosphere(gpu, r, mesh);
		state.prism.render(
			f,
			scene,
			depth,
			atmosphereParams,
			controls,
			imprint,
			options.environmentTheme === "light",
			sceneChanged,
		);
	} else
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
