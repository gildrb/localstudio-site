// Direct incident-light proof on the real metal. No ambient floor or indirect approximation.
// Disk radiance and four-point source extinction are not a normalized version of the heuristic visible-volume model.
import { intro_density } from "../shared/intro-medium.wgsl";
import { Params } from "../shared/scene-params.wgsl";
import { VertexInput, VertexOutput, glass_vs_main } from "../shared/glass-vertex.wgsl";
import { oriented_normal, env_reflect_dir, env_reflection_from_dir } from "../shared/material-core.wgsl";
struct Illumination { camera:vec4f, source:vec4f, apertureRect:vec4f, sourceStrength:vec4f, energy:vec4f, };
struct BvhNode { lower:vec3f, index:f32, upper:vec3f, count:f32, };
struct Triangle { origin:vec4f, edge1:vec4f, edge2:vec4f, };
@group(0) @binding(0) var<uniform> params:Params;
@group(0) @binding(1) var<uniform> illum:Illumination;
@group(0) @binding(2) var studioCube:texture_2d_array<f32>;
@group(0) @binding(3) var studioSampler:sampler;
@group(0) @binding(4) var apertureMask:texture_2d<f32>;
@group(0) @binding(5) var apertureSampler:sampler;
@group(0) @binding(6) var<storage,read> bvhNodes:array<BvhNode>;
@group(0) @binding(7) var<storage,read> bvhTriangles:array<Triangle>;
const EPS=0.0002;
fn box_hit(origin:vec3f, direction:vec3f, node:BvhNode, maximum:f32)->bool {
 var low=EPS;var high=maximum;
 for(var axis=0u;axis<3u;axis+=1u){
  if(abs(direction[axis])<0.0000001){if(origin[axis]<node.lower[axis]||origin[axis]>node.upper[axis]){return false;}}
  else{let a=(node.lower[axis]-origin[axis])/direction[axis];let b=(node.upper[axis]-origin[axis])/direction[axis];low=max(low,min(a,b));high=min(high,max(a,b));}
 }
 return high>=low;
}
fn triangle_hit(origin:vec3f,direction:vec3f,t:Triangle,maximum:f32)->f32 {
 let h=cross(direction,t.edge2.xyz);let determinant=dot(t.edge1.xyz,h);
 if(abs(determinant)<0.00000001){return maximum;}
 let inv=1.0/determinant;let delta=origin-t.origin.xyz;let u=dot(delta,h)*inv;
 if(u<0.0||u>1.0){return maximum;}
 let q=cross(delta,t.edge1.xyz);let v=dot(direction,q)*inv;
 if(v<0.0||u+v>1.0){return maximum;}
 let hit=dot(t.edge2.xyz,q)*inv;
 return select(maximum,hit,hit>EPS&&hit<maximum);
}
fn closest_hit(origin:vec3f,direction:vec3f,maximum:f32)->f32 {
 let inverseDepth=vec3f(1.0,1.0,1.0/max(params.depthTransform.x,0.000001));
 let baseOrigin=origin*inverseDepth;let baseDirection=direction*inverseDepth;
 var stack:array<u32,48>;stack[0]=0u;var count=1u;var nearest=maximum;var visited=0u;
 loop {
  if(count==0u){break;}if(visited>=arrayLength(&bvhNodes)){return EPS;}visited+=1u;
  count-=1u;let index=stack[count];let node=bvhNodes[index];
  if(!box_hit(baseOrigin,baseDirection,node,nearest)){continue;}
  if(node.count>0.0){for(var j=0u;j<u32(node.count);j+=1u){nearest=triangle_hit(baseOrigin,baseDirection,bvhTriangles[u32(node.index)+j],nearest);}}
  else{if(count+2u>48u){return EPS;}stack[count]=u32(node.index);stack[count+1u]=index+1u;count+=2u;}
 }
 return nearest;
}
fn path_gate(a:vec3f,b:vec3f)->f32 {
 let direction=b-a;if(abs(direction.z)<0.0000001){return 1.0;}
 let t=-a.z/direction.z;if(t<=0.0||t>=1.0){return 1.0;}
 let p=a.xy+direction.xy*t;let uv=(p-illum.apertureRect.xy)/illum.apertureRect.zw;
 if(any(uv<vec2f(0.0))||any(uv>vec2f(1.0))){return 0.0;}
 let identity=textureSampleLevel(apertureMask,apertureSampler,vec2f(uv.x,1.0-uv.y),0.0).rgb;
 return clamp(dot(identity,illum.sourceStrength.xyz),0.0,1.0);
}

fn medium_density(point:vec3f)->f32 {
 let d=point-params.cameraPos;
 let camera=vec3f(dot(d,params.cameraRight),-dot(d,params.cameraUp),dot(d,params.cameraForward));
 let near=max(0.05,illum.camera.w-1.25);
 if(camera.z<near||camera.z>illum.camera.w+1.65){return 0.0;}
 let parallax=vec2f(clamp(params.envYaw,-.65,.65),clamp(params.envPitch,-.5,.5))*vec2f(.018,-.016);
 let field=vec3f(camera.xy+parallax*(camera.z-illum.camera.w)*2.0,camera.z-illum.camera.w);
 return intro_density(field, illum.energy.y)*smoothstep(near,near+.45,camera.z);
}
fn source_transmittance(source:vec3f,point:vec3f)->f32 {
 let distance=length(point-source);var opticalDepth=0.0;
 for(var i=0u;i<4u;i+=1u){opticalDepth+=medium_density(mix(source,point,(f32(i)+.5)/4.0))*distance/4.0*1.8;}
 return exp(-opticalDepth);
}
@vertex fn vs_main(input:VertexInput)->VertexOutput{return glass_vs_main(input,params);}
@fragment fn fs_main(input:VertexOutput)->@location(0) vec4f {
 let v=normalize(input.viewDir);let n=oriented_normal(input.normal,v);let r=env_reflect_dir(n,v);
 let position=input.modelPos+n*EPS*2.0;
 let viewGate=path_gate(position,params.cameraPos);
 var direct=0.0;
 if(abs(r.z)>0.000001&&dot(n,r)>0.0){
  let distance=(illum.source.z-position.z)/r.z;
  if(distance>EPS){let hit=position+r*distance;
   if(length(hit.xy-illum.source.xy)<=illum.source.w&&position.z>illum.source.z){
    let gate=path_gate(position,hit)*viewGate;
    if(gate>0.0&&closest_hit(position,r,distance)>=distance-EPS){direct=illum.energy.x*gate*source_transmittance(hit,position);}
   }
  }
 }
 let environment=env_reflection_from_dir(studioCube,studioSampler,r,params.envYaw,params.envPitch)*illum.sourceStrength.w;
 let fresnel=pow(clamp(1.0-dot(n,v),0.0,1.0),5.0);let reflectance=mix(.16,1.0,fresnel);
 return vec4f((environment+vec3f(direct))*reflectance,1.0);
}
