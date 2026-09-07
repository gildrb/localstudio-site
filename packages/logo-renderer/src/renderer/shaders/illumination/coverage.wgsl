// Geometry coverage is opaque even when the chrome material alpha is 0.92.
import { Params } from "../shared/scene-params.wgsl";
import { VertexInput, VertexOutput, glass_vs_main } from "../shared/glass-vertex.wgsl";
@group(0) @binding(0) var<uniform> params: Params;
@vertex fn vs_main(input: VertexInput) -> VertexOutput {
  return glass_vs_main(input, params);
}
@fragment fn fs_main() -> @location(0) vec4f {
  return vec4f(1.0);
}
