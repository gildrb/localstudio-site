import { expect, test } from "vite-plus/test";
import { EVE_DARK_ENV_LIGHTS } from "../../packages/logo-renderer/src/renderer/render/env-lights";
import { AtmospherePassFixture } from "./atmosphere-pass-fixture";

test("atmosphere uses the approved back-right studio light in camera space", () => {
	const fixture = new AtmospherePassFixture();
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
	const fixture = new AtmospherePassFixture({ envYaw, envPitch });
	const params = fixture.backgroundBindings[0]!.params;
	const source = params.lightPosition;
	const light = EVE_DARK_ENV_LIGHTS[3];
	// Identity camera unprojection, then forward WGSL yaw->pitch rotation.
	const x = source[0],
		y = -source[1],
		z = 2 - source[2];
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
	const fixture = new AtmospherePassFixture({ yaw, pitch, radius }, true, orbitTarget);
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
	const fixture = new AtmospherePassFixture({
		envYaw: 0.3,
		envPitch: -0.2,
		yaw: -0.1,
		pitch: 0.15,
	});
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
	const fixture = new AtmospherePassFixture({}, false);
	expect(fixture.backgroundBindings).toHaveLength(1);
	expect(fixture.foregroundBindings).toHaveLength(0);
	expect(fixture.passes).toEqual([
		{ options: { target: fixture.target, clear: [0, 0, 0, 0] }, effect: fixture.backgroundEffect },
	]);
});
