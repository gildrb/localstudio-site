// Apply the chrome protection cap AFTER cached beams and animated dust combine.
// No silhouette mask on exterior diffusion. White premultiplied light cannot darken day.
import { prismMeshSample } from "./mesh-sample.wgsl";
struct OutputParams { logoRect: vec4f, foreground: f32, room: f32, }
@group(0) @binding(0) var sourceTexture: texture_2d<f32>;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var sceneDepth: texture_2d<f32>;
@group(0) @binding(3) var<uniform> params: OutputParams;
@fragment fn fs_main(@location(0) uv: vec2f, @builtin(position) position: vec4f) -> @location(0) vec4f {
  let source = max(textureLoad(sourceTexture, vec2i(position.xy), 0), vec4f(0.0));
  let mesh = prismMeshSample(uv, params.logoRect, sceneTexture, sceneDepth);
  let limit = select(1.0, 0.03, params.foreground > 0.5 && mesh.x > 0.05);
  let alpha = min(source.a, limit);
  let color = source.rgb * min(1.0, alpha / max(source.a, 0.000001));
  let light = vec4f(min(color, vec3f(alpha)), alpha);
  var result = light;
  if params.foreground < 0.5 && params.room < 1.0 {
    // Display-referred room contrast is host policy, not HDR beam emission.
    // A room value of 1 disables this layer instead of painting opaque white.
    // Broad elliptical room falloff: no flat gray rectangular panel on mobile.
    let roomPosition = (uv - vec2f(0.5)) / vec2f(0.5);
    let roomAlpha = pow(max(0.0, 1.0 - dot(roomPosition, roomPosition)), 2.0);
    result = vec4f(light.rgb + vec3f(params.room * roomAlpha * (1.0 - light.a)),
      light.a + roomAlpha * (1.0 - light.a));
  }
  // Canvas-edge policy applies to the complete beam/dust/room layer, not the
  // mesh silhouette. Diffusion remains free to cross the chrome outline.
  let size = vec2f(textureDimensions(sourceTexture));
  if any(position.xy < vec2f(1.0)) || any(position.xy >= size - 1.0) {
    return vec4f(0.0);
  }
  let edge = smoothstep(vec2f(0.012, 0.018), vec2f(0.105, 0.115), uv)
    * (1.0 - smoothstep(vec2f(0.895, 0.885), vec2f(0.988, 0.982), uv));
  return result * edge.x * edge.y;
}
