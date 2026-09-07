// Internal emission identity from the real front-cap contours; never presented.
struct VertexInput {
  @location(0) clipPosition: vec2f,
  @location(1) identity: vec3f,
};
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) @interpolate(flat) identity: vec3f,
};
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(input.clipPosition, 0.0, 1.0);
  output.identity = input.identity;
  return output;
}
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  return vec4f(input.identity, 1.0);
}
