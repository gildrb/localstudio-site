import { fullscreen_clip_position, fullscreen_uv } from "../shared/fullscreen.wgsl";
import { aces_tonemap, linear_to_display } from "../shared/tonemap.wgsl";

// Bloom composite pass. Adds finite-radius blurred bloom in linear HDR, then tonemaps once.

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

struct CompositeParams {
  strength: f32,
  time: f32,
  light: vec2f,
};

@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var bloomTexture: texture_2d<f32>;
@group(0) @binding(2) var texSampler: sampler;
@group(0) @binding(3) var<uniform> params: CompositeParams;

const BLOOM_RADIAL_FULL_RADIUS = 0.55;
const MAX_DARK_DISPLAY_LUMA = 0.43;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.position = fullscreen_clip_position(vertexIndex);
  output.uv = fullscreen_uv(vertexIndex);
  return output;
}

fn interleaved_noise(pixel: vec2f, time: f32) -> f32 {
  return fract(52.9829189 * fract(dot(pixel + vec2f(time * 17.0, time * 29.0), vec2f(0.06711056, 0.00583715))));
}

// Screen-space radial scattering follows the vgpu Next.js Flare technique,
// using this renderer's blurred HDR cubemap highlights as the light field.
// https://vgpu.sh/examples/nextjs-flare/source.md
fn volumetric_flare(uv: vec2f, light: vec2f, sceneSize: vec2f, time: f32) -> vec3f {
  let direction = uv - light;
  let delta = direction * (0.82 / 40.0);
  let jitter = select(0.5, interleaved_noise(floor(uv * sceneSize), floor(time * 30.0)), time >= 0.0);
  var coordinate = uv - delta * jitter;
  var illumination = 1.0;
  var accumulated = vec3f(0.0);
  var illuminationSum = 0.0;
  for (var step = 0; step < 40; step = step + 1) {
    coordinate -= delta;
    let sampleColor = textureSample(bloomTexture, texSampler, clamp(coordinate, vec2f(0.0), vec2f(1.0))).rgb;
    let sampleLuma = dot(sampleColor, vec3f(0.2126, 0.7152, 0.0722));
    accumulated += sampleColor * smoothstep(0.015, 0.24, sampleLuma) * illumination;
    illuminationSum += illumination;
    illumination *= 0.955;
  }
  return accumulated / max(illuminationSum, 0.001) * 5.2;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let scene = textureSample(sceneTexture, texSampler, input.uv);
  let bloom = textureSample(bloomTexture, texSampler, input.uv).rgb;
  let sceneSize = vec2f(textureDimensions(sceneTexture));
  let aspectCorrectUv = (input.uv - vec2f(0.5)) * vec2f(sceneSize.x / max(sceneSize.y, 1.0), 1.0);
  let bloomRadial = smoothstep(0.0, BLOOM_RADIAL_FULL_RADIUS, length(aspectCorrectUv));
  let bloomMask = smoothstep(0.0, 0.4, scene.a);
  // The glass scene is premultiplied. Resolve its cubemap transmission first,
  // then let a screen-space ray walk scatter the same reflected light through
  // the dark atmosphere. This stays separate from the untouched light path.
  let straightScene = scene.rgb / max(scene.a, 0.0001);
  let flare = volumetric_flare(input.uv, params.light, sceneSize, params.time);
  let flareRadius = 1.0 - smoothstep(0.16, 0.82, length(aspectCorrectUv));
  let pulse = 0.88 + 0.12 * sin(params.time * 0.8);
  let flareRadiance = flare * flareRadius * pulse;
  let linearColor = straightScene + bloom * params.strength * bloomRadial * bloomMask + flareRadiance;
  let displayColor = linear_to_display(aces_tonemap(linearColor));
  let neutral = vec3f(dot(displayColor, vec3f(0.2126, 0.7152, 0.0722)));
  let vibrantColor = clamp(neutral + (displayColor - neutral) * 1.50, vec3f(0.0), vec3f(1.0));
  let displayLuma = dot(vibrantColor, vec3f(0.2126, 0.7152, 0.0722));
  let nightSky = vibrantColor * min(1.0, MAX_DARK_DISPLAY_LUMA / max(displayLuma, 0.001));
  // Most scattering stays inside the glass. A restrained exterior alpha makes
  // the volume visible against black without turning it into a detached disc.
  let flareLuma = dot(flareRadiance, vec3f(0.2126, 0.7152, 0.0722));
  let flareAlpha = clamp(smoothstep(0.006, 0.18, flareLuma) * 0.24 * flareRadius, 0.0, 0.24);
  let outputAlpha = scene.a + flareAlpha * (1.0 - scene.a);
  return vec4f(nightSky * outputAlpha, outputAlpha);
}
