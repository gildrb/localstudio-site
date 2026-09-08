import { Params } from "./scene-params.wgsl";
import { intro_density } from "./intro-medium.wgsl";

// Unit-radiance source-only transport. RGB carries aperture identities, not colors.
// Resource bindings stay in entry shaders. The caller fixes physical.medium.z at zero.
export struct PhysicalParams { camera:vec4f, logoRect:vec4f, apertureRect:vec4f, source:vec4f, counts:vec4f, medium:vec4f, };
export struct BvhNode { lower:vec3f, index:f32, upper:vec3f, count:f32, };
export struct Triangle { origin:vec4f, edge1:vec4f, edge2:vec4f, };
export struct Basis { ports:vec3f, transmittance:f32, };
export const EPS=0.0002;
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
export fn closest_hit(params: Params, bvhNodes: ptr<storage, array<BvhNode>, read>, bvhTriangles: ptr<storage, array<Triangle>, read>, origin:vec3f,direction:vec3f,maximum:f32)->f32 {
 let inverseDepth=vec3f(1.0,1.0,1.0/max(params.depthTransform.x,0.000001));
 let baseOrigin=origin*inverseDepth;let baseDirection=direction*inverseDepth;
 var stack:array<u32,48>;stack[0]=0u;var count=1u;var nearest=maximum;var visited=0u;
 loop {
  if(count==0u){break;}if(visited>=arrayLength(bvhNodes)){return EPS;}visited+=1u;
  count-=1u;let index=stack[count];let node=(*bvhNodes)[index];
  if(!box_hit(baseOrigin,baseDirection,node,nearest)){continue;}
  if(node.count>0.0){for(var j=0u;j<u32(node.count);j+=1u){nearest=triangle_hit(baseOrigin,baseDirection,(*bvhTriangles)[u32(node.index)+j],nearest);}}
  else{if(count+2u>48u){return EPS;}stack[count]=u32(node.index);stack[count+1u]=index+1u;count+=2u;}
 }
 return nearest;
}

export fn aperture_identity(physical: PhysicalParams, apertureMask: texture_2d<f32>, apertureSampler: sampler, a:vec3f,b:vec3f)->vec3f {
 let direction=b-a;if(abs(direction.z)<0.0000001){return vec3f(0.0);}
 let t=-a.z/direction.z;if(t<0.0||t>1.0){return vec3f(0.0);}
 let uv=(a.xy+direction.xy*t-physical.apertureRect.xy)/physical.apertureRect.zw;
 if(any(uv<vec2f(0.0))||any(uv>vec2f(1.0))){return vec3f(0.0);}
 return textureSampleLevel(apertureMask,apertureSampler,vec2f(uv.x,1.0-uv.y),0.0).rgb;
}
export fn path_identity(physical: PhysicalParams, apertureMask: texture_2d<f32>, apertureSampler: sampler, source:vec3f,point:vec3f,receiver:vec3f)->vec3f {
 // Outgoing port emission requires an actual SOURCE->receiver crossing.
 // A later view/return crossing is not incident illumination of this point.
 if(point.z<0.0){return vec3f(0.0);}
 return aperture_identity(physical, apertureMask, apertureSampler, source,point);
}
fn medium_density(params: Params, physical: PhysicalParams, point:vec3f)->f32 {
 let d=point-params.cameraPos;
 let camera=vec3f(dot(d,params.cameraRight),-dot(d,params.cameraUp),dot(d,params.cameraForward));
 let near=max(.05,physical.camera.w-1.25);
 if(camera.z<near||camera.z>physical.camera.w+1.65){return 0.0;}
 let parallax=vec2f(clamp(params.envYaw,-.65,.65),clamp(params.envPitch,-.5,.5))*vec2f(.018,-.016);
 let field=vec3f(camera.xy+parallax*(camera.z-physical.camera.w)*2.0,camera.z-physical.camera.w);
 return intro_density(field,physical.medium.z)*smoothstep(near,near+.45,camera.z);
}
fn medium_interval(params: Params, physical: PhysicalParams, origin:vec3f,direction:vec3f,maximum:f32)->vec2f {
 let start=dot(origin-params.cameraPos,params.cameraForward);
 let slope=dot(direction,params.cameraForward);
 let near=max(.05,physical.camera.w-1.25);let far=physical.camera.w+1.65;
 if(abs(slope)<0.000001){if(start<near||start>far){return vec2f(0.0);}return vec2f(0.0,maximum);}
 let a=(near-start)/slope;let b=(far-start)/slope;
 return vec2f(max(0.0,min(a,b)),max(0.0,min(maximum,max(a,b))));
}
export fn path_transmittance(params: Params, physical: PhysicalParams, a:vec3f,b:vec3f)->f32 {
 let delta=b-a;let distance=length(delta);if(distance<EPS){return 1.0;}
 let direction=delta/distance;let interval=medium_interval(params, physical, a,direction,distance);
 let count=u32(physical.counts.z);let step=max(0.0,interval.y-interval.x)/f32(count);var opticalDepth=0.0;
 for(var i=0u;i<count;i+=1u){opticalDepth+=medium_density(params, physical, a+direction*(interval.x+(f32(i)+.5)*step))*step*physical.medium.x;}
 return exp(-opticalDepth);
}
fn phase(cosine:f32)->f32 {
 // Same directional shape, now normalized over the sphere: integral = 1.75*pi.
 return (.25+1.5*pow(max(cosine,0.0),3.0))/5.49778714378;
}
fn source_visible(params: Params, bvhNodes: ptr<storage, array<BvhNode>, read>, sourceShadows: texture_2d_array<f32>, point:vec3f,source:vec3f,index:u32)->f32 {
 let delta=source-point;let distance=length(delta);
 // Provable segment miss of the complete actual-mesh bounds, not a depth-map guess.
 let inverseDepth=vec3f(1.0,1.0,1.0/max(params.depthTransform.x,0.000001));
 let basePoint=point*inverseDepth;let baseDirection=delta/max(distance,EPS)*inverseDepth;
 if(!box_hit(basePoint,baseDirection,(*bvhNodes)[0],distance)){return 1.0;}
 return sample_visible(sourceShadows,source,point,i32(index),.1,4.0,1.0,.0002);
}
fn incident(params: Params, physical: PhysicalParams, bvhNodes: ptr<storage, array<BvhNode>, read>, apertureMask: texture_2d<f32>, apertureSampler: sampler, sourceNodes: ptr<storage, array<vec4f>, read>, sourceShadows: texture_2d_array<f32>, point:vec3f,outgoing:vec3f,receiver:vec3f)->Basis {
 var ports=vec3f(0.0);
 for(var i=0u;i<u32(physical.counts.y);i+=1u){
  let node=(*sourceNodes)[i];let delta=node.xyz-point;let distance=length(delta);let direction=delta/max(distance,EPS);
  let identity=path_identity(physical, apertureMask, apertureSampler, node.xyz,point,receiver);let cosine=max(-direction.z,0.0);
  if(dot(identity,vec3f(1.0))>0.0&&cosine>0.0){
   let visibility=source_visible(params, bvhNodes, sourceShadows, point,node.xyz,i);
   if(visibility>0.0){ports+=identity*(node.w*cosine/max(distance*distance,EPS)*phase(dot(-direction,outgoing))*path_transmittance(params, physical, node.xyz,point)*visibility);}
  }
 }
 return Basis(ports,1.0);
}
export fn integrate(params: Params, physical: PhysicalParams, bvhNodes: ptr<storage, array<BvhNode>, read>, apertureMask: texture_2d<f32>, apertureSampler: sampler, sourceNodes: ptr<storage, array<vec4f>, read>, sourceShadows: texture_2d_array<f32>, origin:vec3f,direction:vec3f,begin:f32,end:f32,receiver:vec3f)->Basis {
 let interval=medium_interval(params, physical, origin,direction,end);let lo=max(begin,interval.x);let hi=min(end,interval.y);
 var ports=vec3f(0.0);var transmittance=1.0;
 if(hi<=lo){return Basis(ports,transmittance);}
 let count=u32(physical.counts.x);let step=(hi-lo)/f32(count);
 for(var i=0u;i<count;i+=1u){
  let q=origin+direction*(lo+(f32(i)+.5)*step);let sigma=medium_density(params, physical, q)*physical.medium.x;let absorb=exp(-sigma*step);
  if(sigma>0.0){let light=incident(params, physical, bvhNodes, apertureMask, apertureSampler, sourceNodes, sourceShadows, q,-direction,receiver);let weight=(1.0-absorb)*transmittance*physical.medium.y;ports+=light.ports*weight;}
  transmittance*=absorb;
 }
 return Basis(ports,transmittance);
}
export fn disk_distance(physical: PhysicalParams, origin:vec3f,direction:vec3f)->f32 {
 if(abs(direction.z)<0.000001){return 10000.0;}
 let distance=(physical.source.z-origin.z)/direction.z;
 if(distance<=EPS||origin.z<=physical.source.z){return 10000.0;}
 let point=origin+direction*distance;
 return select(10000.0,distance,length(point.xy-physical.source.xy)<=physical.source.w);
}


fn sample_visible(shadows: texture_2d_array<f32>, source: vec3f, receiver: vec3f,
                  layer: i32, nearPlane: f32, farPlane: f32, tanFov: f32,
                  axialBias: f32) -> f32 {
  let q = receiver - source;
  // Outside the captured domain is unknown: return dark, never invent an open ray.
  if (q.z < nearPlane || q.z >= farPlane) { return 0.0; }
  let uv = vec2f(0.5) + vec2f(q.x, -q.y) / (2.0 * q.z * tanFov);
  if (any(uv < vec2f(0.0)) || any(uv >= vec2f(1.0))) { return 0.0; }
  let size = textureDimensions(shadows);
  let texel = clamp(vec2i(floor(uv * vec2f(size))), vec2i(0), vec2i(size)-vec2i(1));
  let nearest = textureLoad(shadows, texel, layer, 0).r;
  return select(0.0, 1.0, q.z <= nearest + max(axialBias, 0.0));
}

