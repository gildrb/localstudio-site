import { Params } from "../shared/scene-params.wgsl";
import { PhysicalParams, BvhNode, Triangle, EPS, closest_hit, aperture_identity, path_transmittance, integrate, disk_distance } from "../shared/intro-source-transport.wgsl";
@group(0) @binding(0) var<uniform> params:Params;
@group(0) @binding(1) var<uniform> physical:PhysicalParams;
@group(0) @binding(2) var<storage,read> bvhNodes:array<BvhNode>;
@group(0) @binding(3) var<storage,read> bvhTriangles:array<Triangle>;
@group(0) @binding(4) var apertureMask:texture_2d<f32>;
@group(0) @binding(5) var apertureSampler:sampler;
@group(0) @binding(8) var<storage,read> sourceNodes:array<vec4f>;
@group(0) @binding(12) var sourceShadows:texture_2d_array<f32>;
@group(0) @binding(10) var sceneTexture:texture_2d<f32>;
@group(0) @binding(11) var sceneDepth:texture_2d<f32>;
@fragment fn fs_main(@location(0) uv:vec2f)->@location(0) vec4f {
 let logoUV=(uv-physical.logoRect.xy)/physical.logoRect.zw;
 let xy=(logoUV*2.0-1.0)*vec2f(physical.camera.x*physical.camera.y,-physical.camera.x);
 let direction=normalize(params.cameraRight*xy.x+params.cameraUp*xy.y+params.cameraForward);
 let origin=params.cameraPos;
 let plane=max(0.0,-origin.z/min(direction.z,-.000001));
 var surface=plane;
 if(all(logoUV>=vec2f(0.0))&&all(logoUV<=vec2f(1.0))){
  let size=vec2i(textureDimensions(sceneDepth));let cell=clamp(vec2i(logoUV*vec2f(size)),vec2i(0),size-1);
  if(textureSampleLevel(sceneTexture,apertureSampler,logoUV,0.0).a>.01){surface=max(0.0,(textureLoad(sceneDepth,cell,0).r-dot(origin,params.cameraForward))/dot(direction,params.cameraForward));}
 }
 let rear=physical.medium.w>.5;
 let begin=select(0.0,plane,rear);let end=select(surface,8.0,rear);
 var radiance=integrate(params, physical, &bvhNodes, apertureMask, apertureSampler, &sourceNodes, sourceShadows, origin,direction,begin,end,origin);
 if(rear){
  let direct=disk_distance(physical, origin,direction);
  if(direct<8.0){
   let sourcePoint=origin+direction*direct;
   let identity=aperture_identity(physical, apertureMask, apertureSampler, origin,sourcePoint);
   if(dot(identity,vec3f(1.0))>0.0&&closest_hit(params, &bvhNodes, &bvhTriangles, origin,direction,direct)>=direct-EPS){radiance.ports+=identity*path_transmittance(params, physical, origin+direction*plane,sourcePoint);}
  }
 }
 return vec4f(radiance.ports,1.0-radiance.transmittance);
}
