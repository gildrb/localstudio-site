import { atmosphere_hash, intro_density } from "../shared/intro-medium.wgsl";
import { fullscreen_clip_position, fullscreen_uv } from "../shared/fullscreen.wgsl";

// Adapted from https://vgpu.sh/examples/adaptive-quality/source.md field.wgsl: trilinear 3D
// value-noise/fBm and Beer-Lambert integration, not animated screen-space fog.
// Intro-only HDR field, isolated so the approved baseline shader stays unchanged.
// Independent near/rear effects avoid same-frame uniform aliasing.
struct AtmosphereParams {
  logoRect: vec4f,
  // padded tan(fov/2), padded aspect, -dot(eye, forward), orbit radius
  camera: vec4f,
  // Camera-space source center XYZ and model-plane disk radius W.
  lightPosition: vec4f,
  aspect: f32,
  time: f32,
  envYaw: f32,
  envPitch: f32,
  day: f32,
  foreground: f32,
  // Actual-aperture source strengths, with no presentation fade applied.
  introPulse: vec4f,
  apertureRect: vec4f,
  apertureBounds: vec4f,
  eye: vec3f,
  right: vec3f,
  up: vec3f,
  forward: vec3f,
};
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};
@group(0) @binding(0) var<uniform> params: AtmosphereParams;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var texSampler: sampler;
@group(0) @binding(3) var sceneDepth: texture_2d<f32>;
@group(0) @binding(4) var apertureMask: texture_2d<f32>;

fn model_position(p: vec3f) -> vec3f {
  return params.eye + params.right * p.x - params.up * p.y + params.forward * p.z;
}
fn aperture_identity(origin: vec3f, destination: vec3f) -> vec3f {
  // The actual normalized front cap is z=0, including when the camera orbits.
  let direction = destination - origin;
  if (abs(direction.z) < 0.000001) { return vec3f(0.0); }
  let t = -origin.z / direction.z;
  if (t <= 0.0 || t >= 1.0) { return vec3f(0.0); }
  let point = origin.xy + direction.xy * t;
  let modelUv = (point - params.apertureRect.xy) / params.apertureRect.zw;
  if (any(modelUv <= vec2f(0.0)) || any(modelUv >= vec2f(1.0))) { return vec3f(0.0); }
  let uv = vec2f(modelUv.x, 1.0 - modelUv.y);
  let openings = textureSampleLevel(apertureMask, texSampler, uv, 0.0).rgb;
  return openings;
}

fn logo_sample(heroUv: vec2f) -> vec2f {
  let uv = (heroUv - params.logoRect.xy) / max(params.logoRect.zw, vec2f(0.001));
  let inside = all(uv >= vec2f(0.0)) && all(uv <= vec2f(1.0));
  let size = textureDimensions(sceneDepth);
  let pixel = clamp(vec2i(uv * vec2f(size)), vec2i(0), vec2i(size) - vec2i(1));
  let alpha = select(0.0, textureSampleLevel(sceneTexture, texSampler, uv, 0.0).a, inside);
  let depth = textureLoad(sceneDepth, pixel, 0).r + params.camera.z;
  return vec2f(alpha, depth);
}
fn ray_position(uv: vec2f, depth: f32) -> vec3f {
  let logoUv = (uv - params.logoRect.xy) / max(params.logoRect.zw, vec2f(0.001));
  let screen = (logoUv * 2.0 - 1.0) * vec2f(params.camera.y, 1.0);
  return vec3f(screen * params.camera.x * depth, depth);
}
fn project_position(p: vec3f) -> vec2f {
  let screen = p.xy / max(p.z * params.camera.x, 0.001) / vec2f(params.camera.y, 1.0);
  return params.logoRect.xy + (screen * 0.5 + 0.5) * params.logoRect.zw;
}
fn shadow(p: vec3f, light: vec3f, offset: vec2f) -> f32 {
  // First project toward the nominal mesh distance, then correct the hit using
  // the actual front-face depth. Samples behind the blocker cannot be shadowed.
  if (light.z <= p.z) { return 0.0; }
  let t = clamp((params.camera.w - p.z) / max(light.z - p.z, 0.001), 0.0, 1.0);
  let first = logo_sample(project_position(mix(p, light, t)) + offset);
  // Empty pixels (including all SVG holes) have no surface depth. Refining
  // against their cleared depth bends an open light ray back onto the metal.
  let refinedT = clamp((first.y - p.z) / max(light.z - p.z, 0.001), 0.0, 1.0);
  let hitT = select(t, refinedT, first.x > 0.05);
  let hit = logo_sample(project_position(mix(p, light, hitT)) + offset);
  return hit.x * smoothstep(0.005, 0.035, hit.y - p.z);
}
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.position = fullscreen_clip_position(vertexIndex);
  output.uv = fullscreen_uv(vertexIndex);
  return output;
}
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let uv = input.uv;
  let parallax = vec2f(clamp(params.envYaw, -0.65, 0.65), clamp(params.envPitch, -0.5, 0.5)) * vec2f(0.018, -0.016);
  // Actual existing back-right studio source, in the current camera basis.
  // The intro uses a centered finite-area rear source, independent of the baseline studio.
  let lightPosition = params.lightPosition.xyz;
  let sourceCenter = model_position(lightPosition);
  let front = logo_sample(uv);
  let near = max(0.05, params.camera.w - 1.25);
  let far = params.camera.w + 1.65;
  let split = clamp(select(params.camera.w, front.y, front.x > 0.05), near + 0.01, far - 0.01);
  let start = select(split, near, params.foreground > 0.5);
  let end = select(far, split, params.foreground > 0.5);
  var introRay = true;
  if (introRay) {
    if (params.foreground < 0.5) {
      // Every point on the rear camera ray has the same front-plane crossing.
      introRay = dot(aperture_identity(params.eye, model_position(ray_position(uv, far))), params.introPulse.xyz) > 0.0;
    } else {
      let light = model_position(lightPosition);
      let a = model_position(ray_position(uv, start));
      let b = model_position(ray_position(uv, end));
      let da = light.z - a.z;
      let db = light.z - b.z;
      // The projection is monotonic between endpoints only without a pole.
      // Parallel, singular or sign-changing denominators keep all 48 samples.
      if (abs(da) > 0.00001 && abs(db) > 0.00001 && da * db > 0.0) {
        let pa = a.xy - (light.xy - a.xy) * a.z / da;
        let pb = b.xy - (light.xy - b.xy) * b.z / db;
        let sourceGuard = params.lightPosition.w * max(abs(a.z / da), abs(b.z / db));
        let guard = params.apertureRect.zw * 2.0 / vec2f(textureDimensions(apertureMask)) + vec2f(sourceGuard);
        let low = params.apertureBounds.xy - guard;
        let high = params.apertureBounds.xy + params.apertureBounds.zw + guard;
        introRay = all(max(pa, pb) >= low) && all(min(pa, pb) <= high);
      }
    }
    // Near-air extinction also matters wherever a bright rear ray is visible.
    // Never reject foreground scattering merely because metal is behind it.
    let rearVisible = dot(aperture_identity(params.eye, model_position(ray_position(uv, far))), params.introPulse.xyz) > 0.0;
    if (params.foreground > 0.5) { introRay = introRay || rearVisible; }
    else if (front.x >= 0.8) { introRay = false; }
  }
  let sampleCount = select(8u, 48u, introRay);
  let stepDepth = (end - start) / f32(sampleCount);
  let rayLength = length(ray_position(uv, 1.0));
  let stepSize = stepDepth * rayLength;
  var accumulated = vec3f(0.0);
  var transmittance = 1.0;
  for (var i = 0u; i < sampleCount; i += 1u) {
    // Stable stratified samples remove coherent slice bands without temporal noise.
    // The completed scene retains its exact original eight midpoint samples.
    let offset = select(0.5, atmosphere_hash(vec3f(uv * vec2f(textureDimensions(sceneDepth)), f32(i) + 0.37)), introRay);
    let depth = start + (f32(i) + offset) * stepDepth;
    let p = ray_position(uv, depth);
    let field = vec3f(p.xy + parallax * (depth - params.camera.w) * 2.0, p.z - params.camera.w);
    // Fade the medium density to zero at the finite near boundary. No blunt cutoff.
    let d = intro_density(field, params.time) * smoothstep(near, near + 0.45, depth);
    let seed = atmosphere_hash(vec3f(uv * vec2f(textureDimensions(sceneDepth)), 0.73));
    let angle = 6.28318530718 * fract(f32(i) * 0.569840296 + seed);
    let radius = params.lightPosition.w * sqrt(fract(f32(i) * 0.754877666 + seed * 0.37));
    let sourceModel = sourceCenter + vec3f(cos(angle) * radius, sin(angle) * radius, 0.0);
    let sourceOffset = sourceModel - params.eye;
    let sampleLight = vec3f(dot(sourceOffset, params.right), -dot(sourceOffset, params.up), dot(sourceOffset, params.forward));
    // One finite-area source sample per depth stratum; still 48 transport samples.
    let occlusion = clamp(shadow(p, sampleLight, vec2f(0.0)) / 0.92, 0.0, 1.0);
    let sourceDistance = length(p - sampleLight);
    let forwardScatter = pow(max(dot(normalize(sampleLight - p), normalize(p)), 0.0), 3.0);
    let illumination = (0.25 + forwardScatter * 1.5) / (1.0 + sourceDistance * sourceDistance * 0.28);
    let lit = illumination * (1.0 - occlusion);
    let absorb = exp(-d * stepSize * 1.8);
    let model = model_position(p);
    var identity = aperture_identity(params.eye, model);
    if (params.foreground > 0.5) {
      identity = aperture_identity(model, sourceModel);
    } else {
      identity *= 1.0 - smoothstep(0.0, 0.8, front.x);
    }
    let radiance = vec3f(lit * 2.0) * dot(identity, params.introPulse.xyz);
    accumulated += radiance * (1.0 - absorb) * transmittance;
    transmittance *= absorb;
  }
  // Linear in-scattering and true extinction; no SDR limiter or body-shaped damping.
  return vec4f(accumulated, 1.0 - transmittance);
}
