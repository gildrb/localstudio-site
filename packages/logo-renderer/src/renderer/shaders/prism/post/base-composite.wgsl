// Continuous-atmosphere addition: never feed the SDR base through HDR bloom/ACES.
// Metal presentation alpha is .92, so BOTH delta layers need independent opaque
// GEOMETRY exclusion after all image-based light diffusion.
@group(0) @binding(0) var deltaTexture: texture_2d<f32>;
@group(0) @binding(1) var baseTexture: texture_2d<f32>;
@group(0) @binding(2) var coverageTexture: texture_2d<f32>;

@fragment fn fs_main(
  @location(0) uv: vec2f,
  @builtin(position) position: vec4f,
) -> @location(0) vec4f {
  let pixel = vec2i(position.xy);
  let base = textureLoad(baseTexture, pixel, 0);
  let coverage = clamp(textureLoad(coverageTexture, pixel, 0).a, 0.0, 1.0);
  if coverage >= 1.0 { return base; }
  let delta = max(textureLoad(deltaTexture, pixel, 0), vec4f(0.0));
  // Preserve the original stored base exactly, including transparent edges.
  if all(delta == vec4f(0.0)) { return base; }
  let size = vec2f(textureDimensions(deltaTexture));
  if any(position.xy < vec2f(1.0)) || any(position.xy >= size - 1.0) { return base; }
  let edge = smoothstep(vec2f(0.012, 0.018), vec2f(0.105, 0.115), uv)
    * (1.0 - smoothstep(vec2f(0.895, 0.885), vec2f(0.988, 0.982), uv));
  let amount = (1.0 - coverage) * edge.x * edge.y;
  if amount <= 0.0 { return base; }
  let alpha = clamp(delta.a * amount, 0.0, 1.0);
  let color = min(delta.rgb * amount, vec3f(alpha));
  return vec4f(color + base.rgb * (1.0 - alpha), alpha + base.a * (1.0 - alpha));
}
