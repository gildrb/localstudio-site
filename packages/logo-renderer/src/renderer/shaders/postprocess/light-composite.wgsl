import { fullscreen_clip_position, fullscreen_uv } from "../shared/fullscreen.wgsl";
import { aces_tonemap, linear_to_display } from "../shared/tonemap.wgsl";

// Light-mode composite pass. Tonemaps scene color and writes premultiplied alpha for a transparent canvas.

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@group(0) @binding(0) var sceneTexture: texture_2d<f32>;
@group(0) @binding(1) var texSampler: sampler;

const MIN_LIGHT_DISPLAY_CHANNEL = 0.80;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.position = fullscreen_clip_position(vertexIndex);
  output.uv = fullscreen_uv(vertexIndex);
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let scene = textureSample(sceneTexture, texSampler, input.uv);
  let straightScene = scene.rgb / max(scene.a, 0.0001);
  let sky = linear_to_display(aces_tonemap(straightScene));
  let neutral = vec3f(dot(sky, vec3f(0.2126, 0.7152, 0.0722)));
  let vibrantSky = clamp(neutral + (sky - neutral) * 1.10, vec3f(0.0), vec3f(1.0));
  // Add only enough white to meet the APCA-safe channel floor. A fixed 80%
  // white mix erases most of the cubemap's color separation.
  let minChannel = min(vibrantSky.r, min(vibrantSky.g, vibrantSky.b));
  let lift = max(0.0, MIN_LIGHT_DISPLAY_CHANNEL - minChannel);
  let rgb = min(vibrantSky + vec3f(lift), vec3f(1.0));
  let a = clamp(scene.a, 0.0, 1.0);
  return vec4f(rgb * a, a);
}
