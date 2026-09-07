// Mesh alpha and camera-axis depth only. Never treat presented chrome RGB as HDR.
export fn prismMeshSample(
  heroUv: vec2f,
  logoRect: vec4f,
  scene: texture_2d<f32>,
  depth: texture_2d<f32>,
) -> vec2f {
  let uv = (heroUv - logoRect.xy) / max(logoRect.zw, vec2f(0.0001));
  if any(uv < vec2f(0.0)) || any(uv > vec2f(1.0)) { return vec2f(0.0); }
  let size = textureDimensions(depth);
  let pixel = clamp(vec2i(uv * vec2f(size)), vec2i(0), vec2i(size) - vec2i(1));
  let sceneSize = textureDimensions(scene);
  let scenePixel = clamp(vec2i(uv * vec2f(sceneSize)), vec2i(0), vec2i(sceneSize) - vec2i(1));
  return vec2f(textureLoad(scene, scenePixel, 0).a, textureLoad(depth, pixel, 0).r);
}
