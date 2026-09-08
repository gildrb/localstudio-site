import { Params } from "./scene-params.wgsl";

// Shared mesh vertex IO and vertex helper for glass mesh entry shaders.
// INVARIANT: vertex locations and output locations match the pipeline vertex layout.
// This module contains no shader entrypoints; entry files keep their vs_main wrappers.

export struct VertexInput {
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
};

export struct VertexOutput {
  @builtin(position) clipPosition: vec4f,
  @location(0) normal: vec3f,
  @location(1) viewDir: vec3f,
  @location(2) cameraAxisDepth: f32,
  @location(3) modelPos: vec3f,
};

export fn glass_vs_main(input: VertexInput, params: Params) -> VertexOutput {
  var output: VertexOutput;
  // GPU mesh coordinates anchor the front at z=0. Open only the rear depth,
  // preserving the front outline and keeping every depth/material pass aligned.
  let depthScale = params.depthTransform.x;
  let position = input.position * vec3f(1.0, 1.0, depthScale);
  output.clipPosition = params.viewProj * vec4f(position, 1.0);
  output.normal = normalize(input.normal / vec3f(1.0, 1.0, depthScale));
  // Interpolate the affine displacement, then normalize per fragment. Normalizing
  // at vertices makes reflections depend on triangle size and triangulation.
  output.viewDir = params.cameraPos - position;
  output.cameraAxisDepth = dot(position, normalize(params.cameraForward));
  output.modelPos = position;
  return output;
}
