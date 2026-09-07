// Adapted from Vercel VGPU Prism dark/passes/light/light.wgsl.
// See ../../render/prism/LICENSE and SOURCE.md. White transport only:
// opaque chrome does not refract a Cauchy spectrum.
struct BeamParams {
  viewProj: mat4x4f,
  lightViewProj: mat4x4f,
  logoRect: vec4f,
  lightPosition: vec3f,
  beamOpacity: f32,
  lightForward: vec3f,
  foreground: f32,
  cameraForward: vec3f,
  _reserved: f32,
  resolution: vec2f,
  _padding: vec2f,
}
@group(0) @binding(0) var<uniform> params: BeamParams;
@group(0) @binding(1) var lightDepth: texture_2d<f32>;
@group(0) @binding(2) var sceneDepth: texture_2d<f32>;
@group(0) @binding(3) var sceneTexture: texture_2d<f32>;

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) beam: vec2f,
}
struct BeamVertex {
  @builtin(position) position: vec4f,
  @location(0) world: vec3f,
  @location(1) radial: f32,
  @location(2) travel: f32,
}
@vertex
fn vs_main(input: VertexInput) -> BeamVertex {
  var output: BeamVertex;
  // A true world-space ribbon: 24 nonoverlapping strips across the exact
  // aperture cross-section, as in Prism's white finite-width mesh. No density
  // slices, stochastic noise, or division by strip count.
  let t = input.beam.y;
  let world = mix(params.lightPosition, input.position, t);
  var clip = params.viewProj * vec4f(world, 1.0);
  let heroScale = params.logoRect.zw;
  let heroOffset = vec2f(2.0 * params.logoRect.x + heroScale.x - 1.0,
    1.0 - 2.0 * params.logoRect.y - heroScale.y);
  clip.x = clip.x * heroScale.x + clip.w * heroOffset.x;
  clip.y = clip.y * heroScale.y + clip.w * heroOffset.y;
  output.position = clip;
  output.world = world;
  output.radial = input.beam.x;
  output.travel = t;
  return output;
}

fn sourceVisibility(world: vec3f) -> f32 {
  let clip = params.lightViewProj * vec4f(world, 1.0);
  if (clip.w <= 0.0) { return 0.0; }
  let uv = clip.xy / clip.w * vec2f(0.5, -0.5) + vec2f(0.5);
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0))) { return 0.0; }
  let size = vec2i(textureDimensions(lightDepth));
  let texel = uv * vec2f(size) - vec2f(0.5);
  let at = vec2i(floor(texel));
  let fraction = fract(texel);
  let depth = dot(world, params.lightForward);
  // Bilinear PCF interpolates four VISIBILITY comparisons, never stored depth:
  // cleared aperture texels must not become fictitious interpolated surfaces.
  let nearest = vec4f(
    textureLoad(lightDepth, clamp(at, vec2i(0), size - 1), 0).r,
    textureLoad(lightDepth, clamp(at + vec2i(1, 0), vec2i(0), size - 1), 0).r,
    textureLoad(lightDepth, clamp(at + vec2i(0, 1), vec2i(0), size - 1), 0).r,
    textureLoad(lightDepth, clamp(at + vec2i(1, 1), vec2i(0), size - 1), 0).r,
  );
  let visible = select(vec4f(0.0), vec4f(1.0), vec4f(depth) <= nearest + vec4f(0.002));
  return mix(mix(visible.x, visible.y, fraction.x),
    mix(visible.z, visible.w, fraction.x), fraction.y);
}

@fragment
fn fs_main(input: BeamVertex) -> @location(0) vec4f {
  let heroUV = input.position.xy / params.resolution;
  let logoUV = (heroUV - params.logoRect.xy) / params.logoRect.zw;
  var surfaceDepth = 0.0;
  if (all(logoUV >= vec2f(0.0)) && all(logoUV <= vec2f(1.0))) {
    let size = vec2i(textureDimensions(sceneDepth));
    let pixel = clamp(vec2i(logoUV * vec2f(size)), vec2i(0), size - 1);
    if (textureLoad(sceneTexture, pixel, 0).a > 0.05) {
      surfaceDepth = textureLoad(sceneDepth, pixel, 0).r;
    }
  }
  let depth = dot(input.world, params.cameraForward);
  let inFront = depth < surfaceDepth;
  if (inFront != (params.foreground > 0.5)) { discard; }
  let r = clamp(abs(input.radial), 0.0, 1.0);
  let radial = exp(-16.0 * r * r) * (1.0 - smoothstep(0.55, 1.0, r));
  // Prism's exact outgoing falloff, used here for aperture-emergent white light.
  // Its original incoming white branch has zero travel; no fake dispersion.
  let travel = clamp((input.travel - 1.0) / 0.8, 0.0, 1.0);
  let longitudinal = 1.0 / pow(1.0 + 3.8 * travel, 3.7);
  // Incoming source-to-aperture ramp; the reference ramps from its frame entry.
  let incoming = min(input.travel, 1.0);
  let radiance = 6.0 * params.beamOpacity * radial * longitudinal * incoming
    * sourceVisibility(input.world);
  return vec4f(vec3f(radiance), 0.0);
}
