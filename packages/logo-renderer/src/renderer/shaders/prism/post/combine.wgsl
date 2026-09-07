// Combine only linear HDR beam partitions. Base/chrome RGB never enters this pass.
@group(0) @binding(0) var backgroundTexture: texture_2d<f32>;
@group(0) @binding(1) var foregroundTexture: texture_2d<f32>;
@group(0) @binding(2) var lightSampler: sampler;
@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let back = textureSampleLevel(backgroundTexture, lightSampler, uv, 0.0).rgb;
  let front = textureSampleLevel(foregroundTexture, lightSampler, uv, 0.0).rgb;
  return vec4f(max(back + front, vec3f(0.0)), 1.0);
}
