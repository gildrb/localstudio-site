import type { Frame } from "vgpu";
import type { Texture } from "vgpu/core";
import { STUDIO_BACKLIGHT_POSITION } from "../env-lights";
import type { createApertureMask } from "../aperture-mask";
import { atmosphereIntroState } from "../intro";
import { cameraBasis, dot, orbitEye, sub } from "../math";
import type { RendererResources } from "../resources";
import type { ImprintRenderOptions, RenderControls } from "../types";

export function renderAtmosphere(
  f: Frame,
  r: RendererResources,
  scene: Texture,
  depth: Texture,
  camera: readonly [number, number, number, number],
  controls: RenderControls,
  imprint: ImprintRenderOptions,
  day: boolean,
  aperture?: ReturnType<typeof createApertureMask>,
) {
  const atmosphere = imprint.atmosphere;
  if (!atmosphere) return;
  // Inverse of env-sample.wgsl rotate_x(rotate_y(direction, yaw), pitch).
  // Preserve the actual existing studio-light position and distance.
  const [x, y, z] = STUDIO_BACKLIGHT_POSITION;
  const cy = Math.cos(controls.envYaw), sy = Math.sin(controls.envYaw);
  const cp = Math.cos(controls.envPitch), sp = Math.sin(controls.envPitch);
  const pitchedY = y * cp + z * sp, pitchedZ = -y * sp + z * cp;
  const eye = orbitEye(r.orbitTarget, controls.radius, controls.yaw, controls.pitch);
  const basis = cameraBasis(eye, r.orbitTarget);
  const toLight = sub([x * cy + pitchedZ * sy, pitchedY, -x * sy + pitchedZ * cy], eye);
  const intro = atmosphereIntroState(atmosphere.introTime);
  const params = {
    intro: [...(aperture ? intro.strengths : [0, 0, 0]), intro.settle],
    introPulse: [...(aperture ? intro.pulses : [0, 0, 0]), 0],
    introActive: intro.active ? 1 : 0,
    apertureRect: aperture?.rect ?? [0, 0, 1, 1],
    apertureBounds: aperture?.bounds ?? [0, 0, 1, 1],
    eye, right: basis.right, up: basis.up, forward: basis.forward,
    logoRect: atmosphere.logoRect,
    aspect: atmosphere.target.size[0] / Math.max(1, atmosphere.target.size[1]),
    time: imprint.time ?? 0,
    envYaw: controls.envYaw,
    envPitch: controls.envPitch,
    day: day ? 1 : 0,
    camera,
    lightPosition: [dot(toLight, basis.right), -dot(toLight, basis.up), dot(toLight, basis.forward), 0],
  };
  const bindings = {
    apertureMask: aperture?.target.color.view ?? scene.view,
    sceneTexture: scene.view,
    sceneDepth: depth.view,
    texSampler: r.sampler,
  };
  r.pipelines.atmosphere.set({ ...bindings, params: { ...params, foreground: 0 } });
  f.pass({ target: atmosphere.target, clear: [0, 0, 0, 0] }, r.pipelines.atmosphere);
  if (atmosphere.foregroundTarget) {
    r.pipelines.atmosphereForeground.set({ ...bindings, params: { ...params, foreground: 1 } });
    f.pass({ target: atmosphere.foregroundTarget, clear: [0, 0, 0, 0] }, r.pipelines.atmosphereForeground);
  }
}
