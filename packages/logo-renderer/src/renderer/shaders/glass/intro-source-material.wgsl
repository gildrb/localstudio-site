import { VertexInput, VertexOutput, glass_vs_main } from "../shared/glass-vertex.wgsl";
import { oriented_normal, env_reflect_dir } from "../shared/material-core.wgsl";
import { Params } from "../shared/scene-params.wgsl";
import { PhysicalParams, BvhNode, Triangle, EPS, closest_hit, path_identity, integrate, disk_distance } from "../shared/intro-source-transport.wgsl";
@group(0) @binding(0) var<uniform> params:Params;
@group(0) @binding(1) var<uniform> physical:PhysicalParams;
@group(0) @binding(2) var<storage,read> bvhNodes:array<BvhNode>;
@group(0) @binding(3) var<storage,read> bvhTriangles:array<Triangle>;
@group(0) @binding(4) var apertureMask:texture_2d<f32>;
@group(0) @binding(5) var apertureSampler:sampler;
@group(0) @binding(8) var<storage,read> sourceNodes:array<vec4f>;
@group(0) @binding(12) var sourceShadows:texture_2d_array<f32>;
@vertex fn vs_main(input:VertexInput)->VertexOutput{return glass_vs_main(input,params);}
@fragment fn fs_main(input:VertexOutput)->@location(0) vec4f {
 let v=normalize(input.viewDir);let n=oriented_normal(input.normal,v);let direction=env_reflect_dir(n,v);
 let origin=input.modelPos+n*EPS*2.0;
 let disk=disk_distance(physical, origin,direction);let hit=closest_hit(params, &bvhNodes, &bvhTriangles, origin,direction,8.0);let end=min(hit,disk);
 var radiance=integrate(params, physical, &bvhNodes, apertureMask, apertureSampler, &sourceNodes, sourceShadows, origin,direction,0.0,end,origin);
 if(disk<hit&&disk<8.0){
  let sourcePoint=origin+direction*disk;
  radiance.ports+=path_identity(physical, apertureMask, apertureSampler, sourcePoint,origin,origin)*radiance.transmittance;
 }
 let fresnel=pow(clamp(1.0-dot(n,v),0.0,1.0),5.0);let reflectance=mix(.16,1.0,fresnel);
 return vec4f(radiance.ports*reflectance,1.0);
}
