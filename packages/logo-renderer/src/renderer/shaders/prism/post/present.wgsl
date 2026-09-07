// Prism HDR bloom/presentation adapted for two transparent light-only layers.
// One halo is split 90% background / 10% foreground; never copied into both layers.
// Tone-map the sum once, then divide its display energy; never double the bloom.
import { linearToSrgb3, tonemapAces } from "@vgpu/wgsl-std/color";
struct PresentParams { foreground: f32, bloomStrength: f32, splitForeground: f32, }
@group(0) @binding(0) var backgroundTexture: texture_2d<f32>;
@group(0) @binding(1) var foregroundTexture: texture_2d<f32>;
@group(0) @binding(2) var bloomTexture: texture_2d<f32>;
@group(0) @binding(3) var lightSampler: sampler;
@group(0) @binding(4) var<uniform> params: PresentParams;
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let back = max(textureSampleLevel(backgroundTexture, lightSampler, uv, 0.0).rgb, vec3f(0.0));
  let front = max(textureSampleLevel(foregroundTexture, lightSampler, uv, 0.0).rgb, vec3f(0.0));
  let bloom = max(textureSampleLevel(bloomTexture, lightSampler, uv, 0.0).rgb, vec3f(0.0)) * params.bloomStrength;
  let total = back + front + bloom;
  var layer = select(back + bloom * 0.9, front + bloom * 0.1, params.foreground > 0.5);
  if params.splitForeground < 0.5 { layer = total; }
  let display = linearToSrgb3(tonemapAces(total));
  let color = display * layer / max(total, vec3f(0.000001));
  let alpha = clamp(max(max(color.r, color.g), color.b), 0.0, 1.0);
  return vec4f(min(color, vec3f(alpha)), alpha);
}
