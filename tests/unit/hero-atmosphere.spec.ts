import { expect, test } from "bun:test";
import type { Surface } from "vgpu";
import type { ImprintRenderOptions, RenderControls } from "../../packages/logo-renderer/src/renderer/render/types";
import { atmosphereLayout } from "../../packages/logo-renderer/src/renderer/runtime/atmosphere-surface";
import { mapPointerToLocalEnvironment } from "../../packages/logo-renderer/src/renderer/runtime/environment-input";
import { createDrawLoop } from "../../packages/logo-renderer/src/renderer/runtime/frame-loop";
import type { ControlsRef, HeroRuntimeState } from "../../packages/logo-renderer/src/renderer/runtime/state";

type RenderCall = { controls: RenderControls; imprint: ImprintRenderOptions | undefined };

const idleState: HeroRuntimeState = {
  cancelled: false, renderRequested: false, cleanup: undefined,
  mouseEnvYaw: 0, targetMouseEnvYaw: 0, mouseEnvPitch: 0, targetMouseEnvPitch: 0,
  asciiMouseX: 0, asciiMouseY: 0, targetAsciiMouseX: 0, targetAsciiMouseY: 0,
  brushCellX: 0, brushCellY: 0, previousRenderedBrushCellX: 0, previousRenderedBrushCellY: 0,
  hasBrushCell: false, hasRenderedBrushCell: false, brushActive: false,
  paintGridScaleMultiplier: 1, targetBrushActive: false, activeMesh: undefined,
  previousFrameTime: 0, autoRotateStartTime: 0, lastBrushMoveTime: -Infinity,
  lastPointerClientX: undefined, lastPointerClientY: undefined,
  rippleCellX: 0, rippleCellY: 0, rippleStartTime: -Infinity, lastRippleSpawnTime: -Infinity,
  pointerInsideCanvas: false, isCoarsePointer: false, paintOnHover: false,
  depthReveal: false, depthOpening: 0, baseObjectYaw: 0, staticPose: true,
};

function createFixture(failAtmosphere = false) {
  const state = { ...idleState };
  const controlsRef: ControlsRef = { current: {
    yaw: 0, pitch: 0, radius: 2, fov: 35, envYaw: 0, envPitch: 0,
    insideRendering: true, outsideRendering: true, material: "glass", wireframe: false, showEnv: false,
  } };
  // SAFETY: The frame loop only reads and writes canvas width/height; no DOM methods run.
  const canvas = { width: 640, height: 320 } as HTMLCanvasElement;
  // SAFETY: Only resize runs on this surface; mocked renderers never submit GPU work.
  const surface = { resize() {} } as Surface;
  const atmosphere = {
    current: { target: surface, foregroundTarget: surface, logoRect: [0.1, 0.2, 0.8, 0.3] } satisfies ImprintRenderOptions["atmosphere"],
  };
  const meshCalls: RenderCall[] = [];
  const atmosphereCalls: RenderCall[] = [];
  let reveals = 0;
  let failures = 0;
  const loop = createDrawLoop({
    state, canvas, surface, controlsRef, atmosphere,
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
    onCanvasRevealed() { reveals += 1; },
    onFallback() { failures += 1; },
    onFatalError() { failures += 1; },
  });
  loop.start();
  state.previousFrameTime = 0;
  for (const time of [0, 40, 80]) loop.step(time);
  return { loop, state, controlsRef, atmosphere, meshCalls, atmosphereCalls,
    get reveals() { return reveals; }, get failures() { return failures; } };
}

test("atmosphere uses half CSS resolution with a 768px longest-edge cap", () => {
  expect(atmosphereLayout(
    { left: 400, top: 300, width: 1200, height: 400 },
    { left: 100, top: 100, width: 2400, height: 1200 },
  ).size).toEqual([768, 384]);
  expect(atmosphereLayout(
    { left: 0, top: 0, width: 100, height: 100 },
    { left: 0, top: 0, width: 1200, height: 2400 },
  ).size).toEqual([384, 768]);
  expect(atmosphereLayout(
    { left: 0, top: 0, width: 100, height: 100 },
    { left: 0, top: 0, width: 1200, height: 800 },
  ).size).toEqual([600, 400]);
});

test("mobile atmosphere projects the logo in hero-relative UV without clipping", () => {
  const hero = { left: 20, top: 100, width: 390, height: 844 };
  const logo = { left: -19, top: 311, width: 468, height: 211 };
  const layout = atmosphereLayout(logo, hero);
  expect(layout.size).toEqual([195, 422]);
  expect(layout.logoRect).toEqual([-0.1, 0.25, 1.2, 0.25]);
  expect(atmosphereLayout(
    { ...logo, left: logo.left + 200, top: logo.top - 50 },
    { ...hero, left: hero.left + 200, top: hero.top - 50 },
  )).toEqual(layout);
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
  expect(meshCalls[2]?.imprint?.atmosphere?.foregroundTarget).toBe(fixture.atmosphere.current.foregroundTarget);
  for (const time of [81, 90, 100, 110]) loop.step(time);
  expect(atmosphereCalls).toHaveLength(initialAtmosphereCount);
  loop.step(120);
  expect(atmosphereCalls).toHaveLength(initialAtmosphereCount + 1);
  expect(atmosphereCalls.at(-1)?.imprint?.time).toBeCloseTo(0.12);
  expect(atmosphereCalls.at(-1)?.imprint?.atmosphere).toBe(fixture.atmosphere.current);
  expect(atmosphereCalls.at(-1)?.imprint?.atmosphere?.foregroundTarget).toBe(fixture.atmosphere.current.foregroundTarget);
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
    clientX: 640, clientY: 0, rect: { left: 0, top: 0, width: 640, height: 320 },
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
