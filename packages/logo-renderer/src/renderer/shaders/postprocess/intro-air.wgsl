import { fullscreen_clip_position, fullscreen_uv } from "../shared/fullscreen.wgsl";

import { AtmosphereParams, canonical_air, display_air } from "../shared/hero-air.wgsl";

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};
@group(0) @binding(0) var<uniform> params: AtmosphereParams;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var texSampler: sampler;
@group(0) @binding(3) var sceneDepth: texture_2d<f32>;

struct IntroAirInputs {
  strengths: vec4f,
  gains: vec4f,
};
@group(0) @binding(4) var<uniform> introAir: IntroAirInputs;
// RGB stores light identities, not display colors.
@group(0) @binding(5) var sourceCoefficients: texture_2d<f32>;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.position = fullscreen_clip_position(vertexIndex);
  output.uv = fullscreen_uv(vertexIndex);
  return output;
}
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let response = canonical_air(input.uv, params, sceneTexture, texSampler, sceneDepth);
  let coefficients = textureSampleLevel(sourceCoefficients, texSampler, input.uv, 0.0).rgb;
  let source = dot(coefficients, introAir.strengths.xyz) * introAir.gains.x;
  return display_air(input.uv, params, response, introAir.gains.y, vec3f(source));
}
