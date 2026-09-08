// Continuous added scattering in the APPROVED adaptive-quality atmosphere.
// The baseline shader stays byte-for-byte unchanged. Its field functions below
// are copied exactly, so this adds illumination, not a second fog/noise layer.
// Attribution: ../../render/illumination/SOURCE.md and LICENSE.
struct LightParams {
  logoRect: vec4f,
  camera: vec4f,
  lightViewProj: mat4x4f,
  lightPosition: vec3f,
  gain: f32,
  lightRadiance: vec3f,
  _radiancePadding: f32,
  lightForward: vec3f,
  foreground: f32,
  eye: vec3f,
  time: f32,
  right: vec3f,
  envYaw: f32,
  up: vec3f,
  envPitch: f32,
  forward: vec3f,
  _reserved: f32,
}
@group(0) @binding(0) var<uniform> params: LightParams;
@group(0) @binding(1) var sourceDepth: texture_2d<f32>;
@group(0) @binding(2) var cameraDepth: texture_2d<f32>;
@group(0) @binding(3) var coverage: texture_2d<f32>;

fn atmosphere_hash(p: vec3f) -> f32 {
  let q = fract(p * vec3f(0.1031, 0.1030, 0.0973));
  let r = q + dot(q, q.yxz + 33.33);
  return fract((r.x + r.y) * r.z);
}
fn atmosphere_noise(p: vec3f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = mix(atmosphere_hash(i), atmosphere_hash(i + vec3f(1.0, 0.0, 0.0)), u.x);
  let b = mix(atmosphere_hash(i + vec3f(0.0, 1.0, 0.0)), atmosphere_hash(i + vec3f(1.0, 1.0, 0.0)), u.x);
  let c = mix(atmosphere_hash(i + vec3f(0.0, 0.0, 1.0)), atmosphere_hash(i + vec3f(1.0, 0.0, 1.0)), u.x);
  let d = mix(atmosphere_hash(i + vec3f(0.0, 1.0, 1.0)), atmosphere_hash(i + vec3f(1.0, 1.0, 1.0)), u.x);
  return mix(mix(a, b, u.y), mix(c, d, u.y), u.z);
}
fn atmosphere_fbm(p: vec3f) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var q = p;
  for (var i = 0u; i < 4u; i += 1u) {
    value += amplitude * atmosphere_noise(q);
    q = q * 2.02 + vec3f(1.7, 9.2, 3.1);
    amplitude *= 0.5;
  }
  return value;
}
fn density(p: vec3f) -> f32 {
  let drift = vec3f(params.time * 0.003, params.time * 0.00125, params.time * 0.002);
  let shape = atmosphere_fbm(p * 1.8 + drift);
  // Nonperiodic bends advect through a real world-space band; no sine pulse.
  let band = exp(-abs(p.y - (shape - 0.45) * 1.6) * 1.35);
  return max(0.0, shape - 0.30) * band * 1.5;
}

fn sourceVisibility(world: vec3f) -> f32 {
  let projected = params.lightViewProj * vec4f(world, 1.0);
  // The source projection contains the WHOLE mesh. Rays outside it cannot hit
  // that mesh; treating them as dark would invent another finite light cone.
  if (projected.w <= 0.0) { return 1.0; }
  let uv = projected.xy / projected.w * vec2f(0.5, -0.5) + vec2f(0.5);
  if (any(uv < vec2f(0.0)) || any(uv > vec2f(1.0))) { return 1.0; }
  let size = vec2i(textureDimensions(sourceDepth));
  let texel = uv * vec2f(size) - vec2f(0.5);
  let pixel = vec2i(floor(texel));
  let fraction = fract(texel);
  let nearest = vec4f(
    textureLoad(sourceDepth, clamp(pixel, vec2i(0), size - 1), 0).r,
    textureLoad(sourceDepth, clamp(pixel + vec2i(1, 0), vec2i(0), size - 1), 0).r,
    textureLoad(sourceDepth, clamp(pixel + vec2i(0, 1), vec2i(0), size - 1), 0).r,
    textureLoad(sourceDepth, clamp(pixel + vec2i(1, 1), vec2i(0), size - 1), 0).r,
  );
  let depth = dot(world, params.lightForward);
  let visible = select(vec4f(0.0), vec4f(1.0), vec4f(depth) <= nearest + vec4f(0.002));
  // Filter comparisons, NEVER a blend of real depth and cleared hole texels.
  return mix(mix(visible.x, visible.y, fraction.x),
    mix(visible.z, visible.w, fraction.x), fraction.y);
}

@fragment
fn fs_main(@location(0) uv: vec2f, @builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let occupied = textureLoad(coverage, vec2i(pixel.xy), 0).a;
  if (occupied >= 1.0 || params.gain <= 0.0) { return vec4f(0.0); }
  let logoUV = (uv - params.logoRect.xy) / max(params.logoRect.zw, vec2f(0.001));
  let screen = (logoUV * 2.0 - 1.0) * vec2f(params.camera.y, 1.0);
  let ray = vec3f(screen * params.camera.x, 1.0);
  let near = max(0.05, params.camera.w - 1.25);
  let far = params.camera.w + 1.65;
  var split = params.camera.w;
  if (occupied > 0.0 && all(logoUV >= vec2f(0.0)) && all(logoUV <= vec2f(1.0))) {
    let size = vec2i(textureDimensions(cameraDepth));
    let at = clamp(vec2i(logoUV * vec2f(size)), vec2i(0), size - 1);
    split = textureLoad(cameraDepth, at, 0).r + params.camera.z;
  }
  split = clamp(split, near + 0.01, far - 0.01);
  let parallax = vec2f(clamp(params.envYaw, -0.65, 0.65),
    clamp(params.envPitch, -0.5, 0.5)) * vec2f(0.018, -0.016);
  let toLight = params.lightPosition - params.eye;
  let light = vec3f(dot(toLight, params.right), -dot(toLight, params.up),
    dot(toLight, params.forward));
  let stepDepth = (far - near) / 32.0;
  let stepSize = stepDepth * length(ray);
  var transmittance = 1.0;
  var scattered = vec3f(0.0);
  // Both layers integrate the same entire ray/transmittance. They only select
  // which side of the mesh contributes; no independent reset at the split.
  for (var i = 0u; i < 32u; i += 1u) {
    let depth = near + (f32(i) + 0.5) * stepDepth;
    let p = ray * depth;
    let field = vec3f(p.xy + parallax * (depth - params.camera.w) * 2.0,
      p.z - params.camera.w);
    let d = density(field);
    let absorb = exp(-d * stepSize * 1.8);
    let weight = (1.0 - absorb) * transmittance;
    transmittance *= absorb;
    if ((depth < split) != (params.foreground > 0.5)) { continue; }
    let world = params.eye + params.right * p.x - params.up * p.y + params.forward * p.z;
    let offset = light - p;
    let distance = length(offset);
    // Henyey-Greenstein scattering conserves angular energy but favors light
    // travelling from the backlight toward the eye through the open mesh.
    // Unlike a broad ambient pedestal, this leaves off-axis air subdued.
    let anisotropy = 0.65;
    let cosine = clamp(dot(offset / max(distance, 0.0001), normalize(p)), -1.0, 1.0);
    let phaseDenominator = 1.0 + anisotropy * anisotropy - 2.0 * anisotropy * cosine;
    let phase = (1.0 - anisotropy * anisotropy)
      / (4.0 * 3.141592653589793 * pow(phaseDenominator, 1.5));
    let illumination = phase / (1.0 + 0.28 * distance * distance);
    // Integrate hard visibility within each density step instead of exposing
    // its midpoint as a visible shadow ring. Density/T/phase stay midpoint;
    // only the cheap source query gets four fixed, non-jittered substeps.
    let worldStep = (params.right * ray.x - params.up * ray.y + params.forward) * stepDepth;
    var visibility = 0.0;
    for (var substep = 0u; substep < 4u; substep += 1u) {
      let fraction = (f32(substep) + 0.5) * 0.25 - 0.5;
      visibility += sourceVisibility(world + worldStep * fraction);
    }
    visibility *= 0.25;
    // The incident light already has distance falloff above. A second
    // exponential distance cutoff erased the shafts as they left the holes.
    // Only feather the numerical integration bounds, not the light transport.
    let tail = smoothstep(near, near + 0.4, depth)
      * (1.0 - smoothstep(far - 0.6, far, depth));
    scattered += params.lightRadiance * (params.gain * weight * illumination * tail
      * visibility);
  }
  return vec4f(scattered, 0.0);
}
