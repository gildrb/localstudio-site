import { fullscreen_clip_position } from "../shared/fullscreen.wgsl";
import { METALLIC_OPACITY } from "../shared/material-core.wgsl";
struct Inputs { strengths:vec4f, gains:vec4f };
@group(0) @binding(0) var canonicalScene:texture_2d<f32>;
@group(0) @binding(1) var sourceCoefficients:texture_2d<f32>;
@group(0) @binding(2) var<uniform> inputs:Inputs;
@vertex fn vs_main(@builtin(vertex_index) vertexIndex:u32)->@builtin(position) vec4f {return fullscreen_clip_position(vertexIndex);}
@fragment fn fs_main(@builtin(position) position:vec4f)->@location(0) vec4f {
 let pixel=vec2i(position.xy);
 let canonical=textureLoad(canonicalScene,pixel,0);
 let source=textureLoad(sourceCoefficients,pixel,0);
 // Both terms are unit-light responses in linear HDR, before original bloom/display.
 // Source RGB already contains MSAA coverage. Apply material opacity once, not coverage again.
 let added=dot(source.rgb,inputs.strengths.xyz)*inputs.gains.x*METALLIC_OPACITY;
 return vec4f(canonical.rgb*inputs.gains.y+vec3f(added),canonical.a);
}
