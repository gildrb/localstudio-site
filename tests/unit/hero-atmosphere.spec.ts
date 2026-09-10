/* eslint-disable max-lines -- Keep the atmosphere runtime and CPU-only pass contract tests together. */
import { expect, test } from "vite-plus/test";
import type { Frame, Surface } from "vgpu";
import type { Texture } from "vgpu/core";
import { EVE_DARK_ENV_LIGHTS } from "../../packages/logo-renderer/src/renderer/render/env-lights";
import { renderAtmosphere } from "../../packages/logo-renderer/src/renderer/render/passes/atmosphere-pass";
import type {
	ImprintRenderOptions,
	RenderControls,
} from "../../packages/logo-renderer/src/renderer/render/types";
import { atmosphereLayout } from "../../packages/logo-renderer/src/renderer/runtime/atmosphere-surface";
import { mapPointerToLocalEnvironment } from "../../packages/logo-renderer/src/renderer/runtime/environment-input";
import { createDrawLoop } from "../../packages/logo-renderer/src/renderer/runtime/frame-loop";
import type {
	ControlsRef,
	HeroRuntimeState,
} from "../../packages/logo-renderer/src/renderer/runtime/state";

type RenderCall = { controls: RenderControls; imprint: ImprintRenderOptions | undefined };
type AtmosphereFixture = { current: NonNullable<ImprintRenderOptions["atmosphere"]> };

const idleState: HeroRuntimeState = {
	cancelled: false,
	renderRequested: false,
	cleanup: undefined,
	mouseEnvYaw: 0,
	targetMouseEnvYaw: 0,
	mouseEnvPitch: 0,
	targetMouseEnvPitch: 0,
	asciiMouseX: 0,
	asciiMouseY: 0,
	targetAsciiMouseX: 0,
	targetAsciiMouseY: 0,
	brushCellX: 0,
	brushCellY: 0,
	previousRenderedBrushCellX: 0,
	previousRenderedBrushCellY: 0,
	hasBrushCell: false,
	hasRenderedBrushCell: false,
	brushActive: false,
	paintGridScaleMultiplier: 1,
	targetBrushActive: false,
	activeMesh: undefined,
	previousFrameTime: 0,
	autoRotateStartTime: 0,
	lastBrushMoveTime: -Infinity,
	lastPointerClientX: undefined,
	lastPointerClientY: undefined,
	rippleCellX: 0,
	rippleCellY: 0,
	rippleStartTime: -Infinity,
	lastRippleSpawnTime: -Infinity,
	pointerInsideCanvas: false,
	isCoarsePointer: false,
	paintOnHover: false,
	depthReveal: false,
	depthOpening: 0,
	baseObjectYaw: 0,
	staticPose: true,
};

function createFixture(failAtmosphere = false, intro = false) {
	const state = { ...idleState };
	const controlsRef: ControlsRef = {
		current: {
			yaw: 0,
			pitch: 0,
			radius: 2,
			fov: 35,
			envYaw: 0,
			envPitch: 0,
			insideRendering: true,
			outsideRendering: true,
			material: "glass",
			wireframe: false,
			showEnv: false,
		},
	};
	// SAFETY: The frame loop only reads and writes canvas width/height; no DOM methods run.
	const canvas = { width: 640, height: 320 } as HTMLCanvasElement;
	// SAFETY: Only resize runs on this surface; mocked renderers never submit GPU work.
	// @ts-expect-error CPU-only fixture intentionally omits unused GPU resources.
	const surface = { resize() {} } as Surface;
	const atmosphere: AtmosphereFixture = {
		current: { target: surface, foregroundTarget: surface, logoRect: [0.1, 0.2, 0.8, 0.3] },
	};
	if (intro) atmosphere.current.introTime = 0;
	const introFrames: number[] = [];
	const meshCalls: RenderCall[] = [];
	const atmosphereCalls: RenderCall[] = [];
	let reveals = 0;
	let failures = 0;
	const introFrameMeshCounts: number[] = [];
	const loop = createDrawLoop({
		state,
		canvas,
		surface,
		controlsRef,
		atmosphere,
		canvasLayoutRef: { current: { width: 640, height: 320 } },
		devicePixelRatioRef: { current: 1 },
		renderer: {
			render(_target, controls, _width, _height, imprint) {
				meshCalls.push({ controls: { ...controls }, imprint });
			},
			renderAtmosphere(controls, imprint) {
				if (failAtmosphere) throw new Error("Atmosphere render failed");
				atmosphereCalls.push({ controls: { ...controls }, imprint });
			},
		},
		onCanvasRevealed() {
			reveals += 1;
		},
		onIntroFrame(time) {
			introFrames.push(time);
			introFrameMeshCounts.push(meshCalls.length);
		},
		onFallback() {
			failures += 1;
		},
		onFatalError() {
			failures += 1;
		},
	});
	loop.start();
	state.previousFrameTime = 0;
	for (const time of [0, 40, 80]) loop.step(time);
	return {
		loop,
		state,
		controlsRef,
		atmosphere,
		meshCalls,
		atmosphereCalls,
		introFrames,
		get reveals() {
			return reveals;
		},
		get failures() {
			return failures;
		},
		introFrameMeshCounts,
	};
}

test("atmosphere uses half CSS resolution with a 768px longest-edge cap", () => {
	expect(
		atmosphereLayout(
			{ left: 400, top: 300, width: 1200, height: 400 },
			{ left: 100, top: 100, width: 2400, height: 1200 },
		).size,
	).toEqual([768, 384]);
	expect(
		atmosphereLayout(
			{ left: 0, top: 0, width: 100, height: 100 },
			{ left: 0, top: 0, width: 1200, height: 2400 },
		).size,
	).toEqual([384, 768]);
	expect(
		atmosphereLayout(
			{ left: 0, top: 0, width: 100, height: 100 },
			{ left: 0, top: 0, width: 1200, height: 800 },
		).size,
	).toEqual([600, 400]);
});

test("Prism desktop resolution caps at 1280px without changing logo projection", () => {
	const hero = { left: 20, top: 100, width: 1585, height: 1365 };
	const logo = { left: 140, top: 400, width: 1200, height: 420 };
	const baseline = atmosphereLayout(logo, hero);
	const prism = atmosphereLayout(logo, hero, { scale: 1, maxEdge: 1280 });
	expect(prism.size).toEqual([1280, 1102]);
	expect(prism.logoRect).toEqual(baseline.logoRect);
	expect(prism.logoRect).toEqual([120 / 1585, 300 / 1365, 1200 / 1585, 420 / 1365]);
});

test("Prism mobile resolution uses one render pixel per CSS pixel without upscaling", () => {
	const logo = { left: 0, top: 200, width: 375, height: 120 };
	const mobile = { left: 0, top: 0, width: 375, height: 704 };
	expect(atmosphereLayout(logo, mobile, { scale: 1, maxEdge: 1280 }).size).toEqual([375, 704]);
	for (const [width, height] of [
		[375, 704],
		[1280, 300],
		[300, 1280],
		[320, 1800],
	] as const) {
		const layout = atmosphereLayout(
			logo,
			{ ...mobile, width, height },
			{ scale: 1, maxEdge: 1280 },
		);
		expect(layout.size[0]).toBeLessThanOrEqual(width);
		expect(layout.size[1]).toBeLessThanOrEqual(height);
		expect(Math.max(...layout.size)).toBeLessThanOrEqual(1280);
	}
});

test("mobile atmosphere projects the logo in hero-relative UV without clipping", () => {
	const hero = { left: 20, top: 100, width: 390, height: 844 };
	const logo = { left: -19, top: 311, width: 468, height: 211 };
	const layout = atmosphereLayout(logo, hero);
	expect(layout.size).toEqual([195, 422]);
	expect(layout.logoRect).toEqual([-0.1, 0.25, 1.2, 0.25]);
	expect(
		atmosphereLayout(
			{ ...logo, left: logo.left + 200, top: logo.top - 50 },
			{ ...hero, left: hero.left + 200, top: hero.top - 50 },
		),
	).toEqual(layout);
});

test("zero-sized hero bounds keep the atmosphere finite and nonempty", () => {
	const layout = atmosphereLayout(
		{ left: 0, top: 0, width: 0, height: 0 },
		{ left: 0, top: 0, width: 0, height: 0 },
	);
	expect(layout.size).toEqual([1, 1]);
	for (const value of layout.logoRect) expect(Number.isFinite(value)).toBe(true);
});

test("idle atmosphere advances at most 30fps without redrawing the mesh", () => {
	const fixture = createFixture();
	const { loop, meshCalls, atmosphereCalls } = fixture;
	const initialAtmosphereCount = atmosphereCalls.length;
	expect(meshCalls).toHaveLength(3);
	expect(fixture.reveals).toBe(1);
	expect(meshCalls[2]?.imprint?.atmosphere).toBe(fixture.atmosphere.current);
	expect(meshCalls[2]?.imprint?.atmosphere?.foregroundTarget).toBe(
		fixture.atmosphere.current.foregroundTarget,
	);
	for (const time of [81, 90, 100, 110]) loop.step(time);
	expect(atmosphereCalls).toHaveLength(initialAtmosphereCount);
	loop.step(120);
	expect(atmosphereCalls).toHaveLength(initialAtmosphereCount + 1);
	expect(atmosphereCalls.at(-1)?.imprint?.time).toBeCloseTo(0.12);
	expect(atmosphereCalls.at(-1)?.imprint?.atmosphere).toBe(fixture.atmosphere.current);
	expect(atmosphereCalls.at(-1)?.imprint?.atmosphere?.foregroundTarget).toBe(
		fixture.atmosphere.current.foregroundTarget,
	);
	for (const time of [121, 130, 140, 150]) loop.step(time);
	expect(atmosphereCalls).toHaveLength(initialAtmosphereCount + 1);
	loop.step(160);
	expect(atmosphereCalls).toHaveLength(initialAtmosphereCount + 2);
	expect(meshCalls).toHaveLength(3);
	expect(fixture.reveals).toBe(1);
	expect(fixture.failures).toBe(0);
	loop.dispose();
});

test("mesh and atmosphere share the same smoothed pointer environment", () => {
	const { loop, state, controlsRef, meshCalls, atmosphereCalls } = createFixture();
	const pointer = mapPointerToLocalEnvironment({
		clientX: 640,
		clientY: 0,
		rect: { left: 0, top: 0, width: 640, height: 320 },
	});
	state.targetMouseEnvYaw = pointer.envYaw;
	state.targetMouseEnvPitch = pointer.envPitch;
	loop.step(130);
	const mesh = meshCalls.at(-1);
	expect(mesh?.controls.envYaw).toBeCloseTo(pointer.envYaw * 0.125);
	expect(mesh?.controls.envPitch).toBeCloseTo(pointer.envPitch * 0.125);
	expect(mesh?.controls.envYaw).toBe(controlsRef.current.envYaw);
	expect(mesh?.controls.envPitch).toBe(controlsRef.current.envPitch);
	// Freeze the target at the smoothed value to enter the atmosphere-only path.
	state.targetMouseEnvYaw = state.mouseEnvYaw;
	state.targetMouseEnvPitch = state.mouseEnvPitch;
	const meshCount = meshCalls.length;
	loop.step(170);
	const atmosphere = atmosphereCalls.at(-1);
	expect(atmosphere?.controls.envYaw).toBe(mesh?.controls.envYaw);
	expect(atmosphere?.controls.envPitch).toBe(mesh?.controls.envPitch);
	expect(meshCalls).toHaveLength(meshCount);
	loop.dispose();
});

test("intro starts at presentation, reuses the normal mesh, and pauses offscreen", () => {
	const fixture = createFixture(false, true);
	expect(fixture.introFrames).toEqual([0]);
	expect(fixture.atmosphere.current.introTime).toBe(0);
	fixture.loop.step(120);
	expect(fixture.introFrames.at(-1)).toBeCloseTo(0.04);
	expect(fixture.meshCalls).toHaveLength(3);
	expect(fixture.atmosphereCalls).toHaveLength(1);
	fixture.loop.stop();
	fixture.loop.step(20_000);
	expect(fixture.atmosphere.current.introTime).toBeCloseTo(0.04);
	fixture.loop.start();
	fixture.loop.step(fixture.state.previousFrameTime + 40);
	expect(fixture.introFrames.at(-1)).toBeCloseTo(0.08);
	for (let i = 0; i < 80; i++) fixture.loop.step(fixture.state.previousFrameTime + 40);
	expect(fixture.atmosphere.current.introTime).toBe(2.1);
	expect(fixture.introFrames.at(-1)).toBe(2.1);
	fixture.loop.dispose();
});

test("intro holds the centered pose despite pointer input, then eases toward the latest pointer", () => {
	const fixture = createFixture(false, true);
	fixture.state.staticPose = false;
	fixture.state.depthReveal = true;
	fixture.state.pointerInsideCanvas = true;
	fixture.state.targetAsciiMouseX = 0.8;
	fixture.state.targetAsciiMouseY = -0.6;
	fixture.state.targetMouseEnvYaw = 0.4;
	fixture.state.targetMouseEnvPitch = -0.2;
	fixture.state.renderRequested = true;
	for (let i = 0; i < 45; i++) fixture.loop.step(fixture.state.previousFrameTime + 40);
	expect(fixture.atmosphere.current.introTime).toBeCloseTo(1.8);
	expect(fixture.controlsRef.current.yaw).toBe(0);
	expect(fixture.controlsRef.current.pitch).toBe(0);
	expect(fixture.controlsRef.current.envYaw).toBe(0);
	expect(fixture.controlsRef.current.envPitch).toBe(0);
	expect(fixture.controlsRef.current.depthOpening).toBe(0);
	expect(fixture.meshCalls.length).toBeLessThan(70);
	for (let i = 0; i < 9; i++) fixture.loop.step(fixture.state.previousFrameTime + 40);
	expect(fixture.controlsRef.current.yaw).toBeLessThan(0);
	expect(fixture.controlsRef.current.yaw).toBeGreaterThan(-0.8 * 0.42);
	expect(fixture.controlsRef.current.envYaw).toBeGreaterThan(0);
	expect(fixture.controlsRef.current.depthOpening).toBeGreaterThan(0);
	fixture.loop.dispose();
});

test("intro reuses the mesh and redraws the final baseline frame once", () => {
	const fixture = createFixture(false, true);
	for (let time = 81; time <= 2400; time++) fixture.loop.step(time);
	expect(fixture.meshCalls).toHaveLength(4);
	expect(fixture.introFrames.at(-1)).toBe(2.1);
	const settledMeshCount = fixture.meshCalls.length;
	fixture.loop.step(2500);
	fixture.loop.step(2600);
	expect(fixture.meshCalls.length).toBe(settledMeshCount);
	expect(fixture.atmosphereCalls.length).toBeGreaterThan(0);
	expect(fixture.introFrameMeshCounts.at(-1)).toBe(settledMeshCount);
	fixture.loop.dispose();
});

test("failed intro rendering does not publish another visible frame", () => {
	const fixture = createFixture(true, true);
	expect(fixture.introFrames).toEqual([0]);
	expect(fixture.loop.step(120)).toBe(false);
	expect(fixture.introFrames).toEqual([0]);
	expect(fixture.failures).toBe(2);
	fixture.loop.dispose();
});

test("omitted intro never publishes or adds an intro clock", () => {
	const fixture = createFixture();
	fixture.loop.step(120);
	expect(fixture.introFrames).toEqual([]);
	expect(fixture.atmosphere.current.introTime).toBeUndefined();
	fixture.loop.dispose();
});

test("atmosphere time clamps long frames and does not advance while stopped", () => {
	const { loop, state, meshCalls, atmosphereCalls } = createFixture();
	loop.step(10_000);
	expect(atmosphereCalls.at(-1)?.imprint?.time).toBeCloseTo(0.13);
	loop.stop();
	expect(loop.step(20_000)).toBe(false);
	loop.start();
	loop.step(state.previousFrameTime + 40);
	expect(meshCalls.at(-1)?.imprint?.time).toBeCloseTo(0.17);
	loop.dispose();
});

test("atmosphere failure cancels the loop and invokes both fallback callbacks", () => {
	const fixture = createFixture(true);
	expect(fixture.loop.step(120)).toBe(false);
	expect(fixture.state.cancelled).toBe(true);
	expect(fixture.failures).toBe(2);
	expect(fixture.loop.step(160)).toBe(false);
	expect(fixture.meshCalls).toHaveLength(3);
	expect(fixture.atmosphereCalls).toHaveLength(0);
	expect(fixture.failures).toBe(2);
	fixture.loop.dispose();
});

test("stop and dispose prevent both mesh and atmosphere renders", () => {
	for (const action of ["stop", "dispose"] as const) {
		const { loop, state, meshCalls, atmosphereCalls } = createFixture();
		loop.step(120);
		const meshCount = meshCalls.length;
		const atmosphereCount = atmosphereCalls.length;
		loop[action]();
		state.renderRequested = true;
		state.targetMouseEnvYaw = 0.35;
		for (const time of [160, 200, 1000]) expect(loop.step(time)).toBe(false);
		expect(meshCalls).toHaveLength(meshCount);
		expect(atmosphereCalls).toHaveLength(atmosphereCount);
	}
});

type AtmosphereBindings = {
	sceneTexture: unknown;
	sceneDepth: unknown;
	texSampler: unknown;
	params: {
		logoRect: readonly number[];
		aspect: number;
		time: number;
		envYaw: number;
		envPitch: number;
		day: number;
		camera: readonly number[];
		lightPosition: readonly number[];
		foreground: number;
	};
};

function createPassFixture(
	controls: Partial<RenderControls> = {},
	foreground = true,
	orbitTarget: [number, number, number] = [0, 0, 0],
) {
	const backgroundBindings: AtmosphereBindings[] = [],
		foregroundBindings: AtmosphereBindings[] = [];
	const backgroundEffect = {
		set(bindings: AtmosphereBindings) {
			backgroundBindings.push(bindings);
		},
	};
	const foregroundEffect = {
		set(bindings: AtmosphereBindings) {
			foregroundBindings.push(bindings);
		},
	};
	const passes: { options: unknown; effect: unknown }[] = [];
	// SAFETY: renderAtmosphere only calls pass; this recorder submits no GPU work.
	const frame = {
		pass(options: Parameters<Frame["pass"]>[0], effect: Parameters<Frame["pass"]>[1]) {
			passes.push({ options, effect });
		},
	} as Frame;
	// SAFETY: The pass only reads size and passes target identity to the mocked frame.
	// @ts-expect-error CPU-only fixture intentionally omits unused GPU resources.
	const target = { size: [768, 384] } as Surface;
	// SAFETY: The foreground target is only forwarded to the mocked frame.
	// @ts-expect-error CPU-only fixture intentionally omits unused GPU resources.
	const foregroundTarget = { size: [768, 384] } as Surface;
	// SAFETY: Only view identity is read; no texture methods or real GPU handles are used.
	const scene = { view: { label: "scene" } } as Texture;
	// SAFETY: Only view identity is read; no texture methods or real GPU handles are used.
	const depth = { view: { label: "depth" } } as Texture;
	const sampler = { label: "sampler" };
	// SAFETY: The pass accesses only these resources; effects record set calls without GPU work.
	const resources = {
		isLight: false,
		orbitTarget,
		sampler,
		pipelines: { atmosphere: backgroundEffect, atmosphereForeground: foregroundEffect },
	} as Parameters<typeof renderAtmosphere>[1];
	const renderControls: RenderControls = {
		yaw: 0,
		pitch: 0,
		radius: 2,
		fov: 35,
		envYaw: 0,
		envPitch: 0,
		insideRendering: true,
		outsideRendering: true,
		material: "glass",
		wireframe: false,
		showEnv: false,
		...controls,
	};
	const camera = [0.315, 2.1, 0.42, 0.58] as const;
	const imprint: ImprintRenderOptions = {
		time: 4.25,
		atmosphere: {
			target,
			logoRect: [0.1, 0.2, 0.8, 0.3],
			foregroundTarget: foreground ? foregroundTarget : undefined,
		},
	};
	renderAtmosphere(frame, resources, scene, depth, camera, renderControls, imprint, true);
	return {
		backgroundBindings,
		foregroundBindings,
		backgroundEffect,
		foregroundEffect,
		passes,
		target,
		foregroundTarget,
		scene,
		depth,
		sampler,
		camera,
		renderControls,
	};
}

test("atmosphere uses the approved back-right studio light in camera space", () => {
	const fixture = createPassFixture();
	const source = fixture.backgroundBindings[0]!.params.lightPosition;
	const light = EVE_DARK_ENV_LIGHTS[3];
	expect(source.slice(0, 3)).toEqual([
		light.position[0],
		-light.position[1],
		2 - light.position[2],
	]);
	for (const value of source) expect(Number.isFinite(value)).toBe(true);
});

test("atmosphere light position inverts the shader environment rotation", () => {
	const envPitch = -0.31,
		envYaw = 0.47;
	const fixture = createPassFixture({ envYaw, envPitch });
	const params = fixture.backgroundBindings[0]!.params;
	const source = params.lightPosition;
	const light = EVE_DARK_ENV_LIGHTS[3];
	// Identity camera unprojection, then forward WGSL yaw->pitch rotation.
	const x = source[0]!,
		y = -source[1]!,
		z = 2 - source[2]!;
	const yawX = x * Math.cos(envYaw) - z * Math.sin(envYaw);
	const yawZ = x * Math.sin(envYaw) + z * Math.cos(envYaw);
	const restored = [
		yawX,
		y * Math.cos(envPitch) - yawZ * Math.sin(envPitch),
		y * Math.sin(envPitch) + yawZ * Math.cos(envPitch),
	];
	for (const axis of [0, 1, 2]) expect(restored[axis]).toBeCloseTo(light.position[axis]!, 10);
	expect(params.envYaw).toBe(envYaw);
	expect(params.envPitch).toBe(envPitch);
});

test("atmosphere projects the studio position through the current orbit camera", () => {
	const pitch = 0.26,
		radius = 3.2,
		yaw = -0.38;
	const orbitTarget: [number, number, number] = [0.15, -0.1, 0.2];
	const fixture = createPassFixture({ yaw, pitch, radius }, true, orbitTarget);
	const params = fixture.backgroundBindings[0]!.params;
	const light = EVE_DARK_ENV_LIGHTS[3];
	const cp = Math.cos(pitch),
		cy = Math.cos(yaw),
		sp = Math.sin(pitch),
		sy = Math.sin(yaw);
	const x = light.position[0] - orbitTarget[0],
		y = light.position[1] - orbitTarget[1],
		z = light.position[2] - orbitTarget[2];
	// Analytic orbit view matrix: right, screen-down, forward; no production math helpers.
	const expected = [
		x * cy - z * sy,
		x * sy * sp - y * cp + z * cy * sp,
		radius - x * sy * cp - y * sp - z * cy * cp,
	];
	for (const axis of [0, 1, 2]) expect(params.lightPosition[axis]).toBeCloseTo(expected[axis]!, 10);
	expect(params.camera).toEqual(fixture.camera);
});

test("atmosphere layers use separate effects with identical light, projection and time uniforms", () => {
	const fixture = createPassFixture({ envYaw: 0.3, envPitch: -0.2, yaw: -0.1, pitch: 0.15 });
	expect(fixture.backgroundBindings).toHaveLength(1);
	expect(fixture.foregroundBindings).toHaveLength(1);
	expect(fixture.backgroundEffect).not.toBe(fixture.foregroundEffect);
	const background = fixture.backgroundBindings[0]!,
		foreground = fixture.foregroundBindings[0]!;
	expect(background.params.foreground).toBe(0);
	expect(foreground.params.foreground).toBe(1);
	expect(foreground).toEqual({ ...background, params: { ...background.params, foreground: 1 } });
	expect(background.params.time).toBe(4.25);
	expect(background.params.camera).toBe(fixture.camera);
	expect(background.params.logoRect).toEqual([0.1, 0.2, 0.8, 0.3]);
	expect(background.params.aspect).toBe(2);
	expect(background.params.day).toBe(1);
	expect(background.sceneTexture).toBe(fixture.scene.view);
	expect(background.sceneDepth).toBe(fixture.depth.view);
	expect(background.texSampler).toBe(fixture.sampler);
	expect(fixture.passes).toEqual([
		{ options: { target: fixture.target, clear: [0, 0, 0, 0] }, effect: fixture.backgroundEffect },
		{
			options: { target: fixture.foregroundTarget, clear: [0, 0, 0, 0] },
			effect: fixture.foregroundEffect,
		},
	]);
});

test("an atmosphere without a foreground target submits only the background pass", () => {
	const fixture = createPassFixture({}, false);
	expect(fixture.backgroundBindings).toHaveLength(1);
	expect(fixture.foregroundBindings).toHaveLength(0);
	expect(fixture.passes).toEqual([
		{ options: { target: fixture.target, clear: [0, 0, 0, 0] }, effect: fixture.backgroundEffect },
	]);
});
