import type { Frame } from "vgpu";
import type { Texture } from "vgpu/core";
import { STUDIO_BACKLIGHT_POSITION } from "../env-lights";
import { cameraBasis, dot, lookAt, multiply, perspective } from "../math";
import type { IntroSceneParameters as SceneParams } from "../intro-inputs";
import type { ImprintRenderOptions, Mat4, RenderControls } from "../types";
import type { PrismAtmosphereState } from "./atmosphere-resources";
import { PRISM_BEAM_OPACITY } from "./ribbons";

type PrismAtmosphere = NonNullable<ImprintRenderOptions["atmosphere"]>;
type PrismProjection = Readonly<Mat4<Readonly<ArrayBufferLike>>>;

export function renderPrismAtmosphere(
	state: PrismAtmosphereState,
	f: Frame,
	scene: Texture,
	depth: Texture,
	params: SceneParams,
	controls: Readonly<RenderControls>,
	imprint: ImprintRenderOptions,
	day: boolean,
	sceneChanged: boolean,
) {
	const atmosphere = imprint.atmosphere;
	if (atmosphere === undefined) return;
	const size = atmosphere.target.size;
	const beamOpacity =
		atmosphere.beamOpacity !== undefined && Number.isFinite(atmosphere.beamOpacity)
			? Math.max(0, Math.min(1, atmosphere.beamOpacity))
			: PRISM_BEAM_OPACITY;
	const nextLightKey = [
		controls.envYaw,
		controls.envPitch,
		controls.depthOpening ?? 0,
		controls.outsideRendering,
	].join(",");
	if (nextLightKey !== state.lightKey) renderPrismShadow(state, f, params, controls, nextLightKey);

	const nextKey = [
		nextLightKey,
		...size,
		...atmosphere.logoRect,
		...params.viewProj,
		beamOpacity,
		day,
		atmosphere.dayRoom ?? 1,
	].join(",");
	const changed = sceneChanged || nextKey !== state.cachedKey;
	// Keep identical XY projection but extend clipping beyond the mesh bounds.
	const viewProj = multiply(
		perspective(params.fov, params.aspect, 0.005, 30),
		lookAt(params.cameraPos, state.r.orbitTarget, params.cameraUp),
	);
	if (changed) {
		renderPrismBeams(state, f, scene, depth, params, atmosphere, viewProj, beamOpacity);
		state.cachedKey = nextKey;
	}
	renderPrismPresentation(
		state,
		f,
		scene,
		depth,
		params,
		controls,
		imprint,
		atmosphere,
		viewProj,
		day,
		beamOpacity,
		changed,
	);
}

function renderPrismShadow(
	state: PrismAtmosphereState,
	f: Frame,
	params: SceneParams,
	controls: Readonly<RenderControls>,
	nextLightKey: string,
) {
	const [x, y, z] = STUDIO_BACKLIGHT_POSITION;
	const cy = Math.cos(controls.envYaw),
		sy = Math.sin(controls.envYaw);
	const cp = Math.cos(controls.envPitch),
		sp = Math.sin(controls.envPitch);
	const py = y * cp + z * sp,
		pz = -y * sp + z * cp;
	state.lightPosition = [x * cy + pz * sy, py, -x * sy + pz * cy];
	const basis = cameraBasis(state.lightPosition, state.r.orbitTarget);
	state.lightForward = basis.forward;
	state.lightViewProj = multiply(
		perspective((Math.PI * 2) / 3, 1, 0.005, 12),
		lookAt(state.lightPosition, state.r.orbitTarget, basis.up),
	);
	state.shadow.set({
		params: {
			...params,
			viewProj: state.lightViewProj,
			cameraPos: state.lightPosition,
			cameraRight: basis.right,
			cameraUp: basis.up,
			cameraForward: state.lightForward,
		},
	});
	f.pass({ target: state.lightDepth, clear: [1e6, 0, 0, 0] }, (pass) => {
		if (controls.outsideRendering) pass.draw(state.shadow);
	});
	state.lightKey = nextLightKey;
}

function renderPrismBeams(
	state: PrismAtmosphereState,
	f: Frame,
	scene: Texture,
	depth: Texture,
	params: SceneParams,
	atmosphere: PrismAtmosphere,
	viewProj: PrismProjection,
	beamOpacity: number,
) {
	const {
		background,
		foreground,
		beams,
		lightDepth,
		lightViewProj,
		lightPosition,
		lightForward,
		vertices,
	} = state;
	const size = atmosphere.target.size;
	for (const [layer, destination] of [background, foreground].entries()) {
		if (destination.size[0] !== size[0] || destination.size[1] !== size[1])
			destination.resize(size);
		const beam = beams[layer];
		if (beam === undefined) throw new Error("Missing Prism beam layer.");
		beam.set({
			lightDepth: lightDepth.color.view,
			sceneDepth: depth.view,
			sceneTexture: scene.view,
			params: {
				viewProj,
				lightViewProj,
				logoRect: atmosphere.logoRect,
				lightPosition,
				beamOpacity,
				lightForward,
				foreground: layer,
				cameraForward: params.cameraForward,
				resolution: size,
			},
		});
		f.pass({ target: destination, clear: [0, 0, 0, 0] }, (pass) => {
			if (vertices.length > 0) pass.draw(beam);
		});
	}
}

function renderPrismPresentation(
	state: PrismAtmosphereState,
	f: Frame,
	scene: Texture,
	depth: Texture,
	params: SceneParams,
	controls: Readonly<RenderControls>,
	imprint: ImprintRenderOptions,
	atmosphere: PrismAtmosphere,
	viewProj: PrismProjection,
	day: boolean,
	beamOpacity: number,
	changed: boolean,
) {
	const { post, background, foreground } = state;
	post.render(f, {
		background,
		foreground,
		scene,
		depth,
		logoRect: atmosphere.logoRect,
		camera: [
			Math.tan(params.fov / 2),
			params.aspect,
			-dot(params.cameraPos, params.cameraForward),
			controls.radius,
		],
		viewProj,
		eye: params.cameraPos,
		forward: params.cameraForward,
		right: params.cameraRight,
		up: params.cameraUp,
		time: imprint.time ?? 0,
		day,
		dayRoom: beamOpacity > 0 ? (atmosphere.dayRoom ?? 1) : 1,
		pixelScale: atmosphere.pixelScale ?? 1,
		output: atmosphere.target,
		foregroundOutput: atmosphere.foregroundTarget,
		sceneChanged: changed,
	});
}
