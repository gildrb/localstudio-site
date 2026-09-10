import { expect, test } from "vite-plus/test";
import { mapPointerToLocalEnvironment } from "../../packages/logo-renderer/src/renderer/runtime/environment-input";
import { AtmosphereLoopFixture } from "./hero-atmosphere-fixture";

test("idle atmosphere advances at most 30fps without redrawing the mesh", () => {
	const fixture = new AtmosphereLoopFixture();
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
	const { loop, state, controlsRef, meshCalls, atmosphereCalls } = new AtmosphereLoopFixture();
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
	const fixture = new AtmosphereLoopFixture(false, true);
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
	const fixture = new AtmosphereLoopFixture(false, true);
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
	const fixture = new AtmosphereLoopFixture(false, true);
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
	const fixture = new AtmosphereLoopFixture(true, true);
	expect(fixture.introFrames).toEqual([0]);
	expect(fixture.loop.step(120)).toBe(false);
	expect(fixture.introFrames).toEqual([0]);
	expect(fixture.failures).toBe(2);
	fixture.loop.dispose();
});

test("omitted intro never publishes or adds an intro clock", () => {
	const fixture = new AtmosphereLoopFixture();
	fixture.loop.step(120);
	expect(fixture.introFrames).toEqual([]);
	expect(fixture.atmosphere.current.introTime).toBeUndefined();
	fixture.loop.dispose();
});

test("atmosphere time clamps long frames and does not advance while stopped", () => {
	const { loop, state, meshCalls, atmosphereCalls } = new AtmosphereLoopFixture();
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
	const fixture = new AtmosphereLoopFixture(true);
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
		const { loop, state, meshCalls, atmosphereCalls } = new AtmosphereLoopFixture();
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
