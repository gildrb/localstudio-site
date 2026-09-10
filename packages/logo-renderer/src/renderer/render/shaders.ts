// Shader sources reused by intro and atmosphere passes.
import glassBackDepth from "../shaders/glass/back-depth.wgsl";
import bloomBlur from "../shaders/bloom/blur.wgsl";
import bloomComposite from "../shaders/bloom/composite.wgsl";

export const shaders = { glassBackDepth, bloomBlur, bloomComposite };
