struct Camera {
  source: vec4f,
  // Near, far, tan(FOV/2), mesh depth scale (front stays anchored at z=0).
  projection: vec4f,
};
@group(0) @binding(0) var<uniform> camera: Camera;
struct Out { @builtin(position) clip: vec4f, @location(0) axial: f32 };
@vertex fn vs_main(@location(0) position: vec3f, @location(1) normal: vec3f) -> Out {
  let meshPosition = position * vec3f(1.0, 1.0, camera.projection.w);
  let q = meshPosition - camera.source.xyz;
  let n = camera.projection.x;
  let f = camera.projection.y;
  // +Z optical axis, +X right, +Y up. WebGPU z clip interval is [0,w].
  return Out(vec4f(q.xy / camera.projection.z, f/(f-n)*q.z-f*n/(f-n), q.z), q.z);
}
@fragment fn fs_main(input: Out) -> @location(0) f32 { return input.axial; }
