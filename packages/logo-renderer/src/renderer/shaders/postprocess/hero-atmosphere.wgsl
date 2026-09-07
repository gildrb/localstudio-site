import { fullscreen_clip_position, fullscreen_uv } from "../shared/fullscreen.wgsl";

// Adapted from https://vgpu.sh/examples/adaptive-quality/source.md field.wgsl: trilinear 3D
// value-noise/fBm and Beer-Lambert integration, not animated screen-space fog.
// Eight samples per partition, split into independent front/back effects so
// immediate uniform writes cannot alias between passes in the same frame.
struct AtmosphereParams {
  logoRect: vec4f,
  // padded tan(fov/2), padded aspect, -dot(eye, forward), orbit radius
  camera: vec4f,
  lightPosition: vec4f,
  aspect: f32,
  time: f32,
  envYaw: f32,
  envPitch: f32,
  day: f32,
  foreground: f32,
};
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};
@group(0) @binding(0) var<uniform> params: AtmosphereParams;
@group(0) @binding(1) var sceneTexture: texture_2d<f32>;
@group(0) @binding(2) var texSampler: sampler;
@group(0) @binding(3) var sceneDepth: texture_2d<f32>;

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
  let hitT = clamp((first.y - p.z) / max(light.z - p.z, 0.001), 0.0, 1.0);
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
  let lightPosition = params.lightPosition.xyz;
  let front = logo_sample(uv);
  let near = max(0.05, params.camera.w - 1.25);
  let far = params.camera.w + 1.65;
  let split = clamp(select(params.camera.w, front.y, front.x > 0.05), near + 0.01, far - 0.01);
  let start = select(split, near, params.foreground > 0.5);
  let end = select(far, split, params.foreground > 0.5);
  let stepDepth = (end - start) / 8.0;
  let rayLength = length(ray_position(uv, 1.0));
  let stepSize = stepDepth * rayLength;
  var accumulated = vec3f(0.0);
  var transmittance = 1.0;
  for (var i = 0u; i < 8u; i += 1u) {
    let depth = start + (f32(i) + 0.5) * stepDepth;
    let p = ray_position(uv, depth);
    let field = vec3f(p.xy + parallax * (depth - params.camera.w) * 2.0, p.z - params.camera.w);
    let d = density(field);
    let penumbra = vec2f(0.004, 0.002) * max(0.2, abs(depth - params.camera.w));
    let occlusion = shadow(p, lightPosition, vec2f(0.0)) * 0.5
      + shadow(p, lightPosition, penumbra) * 0.25
      + shadow(p, lightPosition, -penumbra) * 0.25;
    let sourceDistance = length(p - lightPosition);
    let forwardScatter = pow(max(dot(normalize(lightPosition - p), normalize(p)), 0.0), 3.0);
    let illumination = (0.25 + forwardScatter * 1.5) / (1.0 + sourceDistance * sourceDistance * 0.28);
    let lit = illumination * (1.0 - occlusion * 0.88);
    let nightGlow = vec3f(0.32, 0.35, 0.38) * (0.22 + lit * 1.8);
    let dayGlow = vec3f(0.73, 0.75, 0.76) + vec3f(0.29, 0.27, 0.23) * lit;
    let glow = mix(nightGlow, dayGlow, params.day);
    let absorb = exp(-d * stepSize * 1.8);
    accumulated += glow * (1.0 - absorb) * transmittance;
    transmittance *= absorb;
  }
  let edge = smoothstep(vec2f(0.012, 0.018), vec2f(0.105, 0.115), uv)
    * (1.0 - smoothstep(vec2f(0.895, 0.78), vec2f(0.988, 0.975), uv));
  let feather = edge.x * edge.y;
  if (params.foreground > 0.5) {
    // True near-volume layer over the mesh. Cap extinction at 3% on chrome;
    // outside its silhouette the near air has room to reveal the light shafts.
    let gain = mix(0.55, 0.10, smoothstep(0.0, 0.8, front.x));
    let alpha = min((1.0 - transmittance) * gain, mix(0.16, 0.03, smoothstep(0.0, 0.8, front.x)));
    let color = accumulated / max(1.0 - transmittance, 0.0001);
    return vec4f(color * alpha * feather, alpha * feather);
  }
  let room = mix(vec3f(0.022, 0.026, 0.031), vec3f(0.96, 0.96, 0.95), params.day);
  let color = clamp(room * transmittance + accumulated, vec3f(0.0), vec3f(1.0));
  return vec4f(color * feather, feather);
}
