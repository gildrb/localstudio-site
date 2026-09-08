// Shared intro-only density. Source/view transport choose their own integration paths.
export fn atmosphere_hash(p: vec3f) -> f32 {
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
export fn intro_density(p: vec3f, time: f32) -> f32 {
  let drift = vec3f(time * 0.003, time * 0.00125, time * 0.002);
  let shape = atmosphere_fbm(p * 1.8 + drift);
  // Nonperiodic bends advect through a real world-space band; no sine pulse.
  let band = exp(-abs(p.y - (shape - 0.45) * 1.6) * 1.35);
  return max(0.0, shape - 0.30) * band * 1.5;
}
