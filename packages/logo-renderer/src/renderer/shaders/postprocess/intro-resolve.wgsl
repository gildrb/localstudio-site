import { fullscreen_clip_position, fullscreen_uv } from "../shared/fullscreen.wgsl";
struct Presentation { logoRect:vec4f, logoOpacity:f32 };
struct VertexOutput { @builtin(position) position:vec4f, @location(0) uv:vec2f };
@group(0) @binding(0) var background:texture_2d<f32>;
@group(0) @binding(1) var logo:texture_2d<f32>;
@group(0) @binding(2) var foreground:texture_2d<f32>;
@group(0) @binding(3) var texSampler:sampler;
@group(0) @binding(4) var<uniform> presentation:Presentation;
@vertex fn vs_main(@builtin(vertex_index) vertexIndex:u32)->VertexOutput {return VertexOutput(fullscreen_clip_position(vertexIndex),fullscreen_uv(vertexIndex));}
@fragment fn fs_main(input:VertexOutput)->@location(0) vec4f {
 var color=textureSampleLevel(background,texSampler,input.uv,0.0).rgb;
 let uv=(input.uv-presentation.logoRect.xy)/presentation.logoRect.zw;
 if(all(uv>=vec2f(0.0))&&all(uv<=vec2f(1.0))){
  let surface=textureSampleLevel(logo,texSampler,uv,0.0)*presentation.logoOpacity;
  color=surface.rgb+color*(1.0-surface.a);
 }
 let air=textureSampleLevel(foreground,texSampler,input.uv,0.0);
 // Original display-space host order, not a second tone map or an animated opacity.
 return vec4f(air.rgb+color*(1.0-air.a),1.0);
}
