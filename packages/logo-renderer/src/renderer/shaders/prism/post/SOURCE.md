# Prism post-processing provenance

Adapted from the actual https://vgpu.sh/?debug landing Prism, not the examples gallery.
Upstream: https://github.com/vercel-labs/vgpu/tree/e1661e3385ac63dc88535c1a0e819e52702f02f8/apps/docs/app/%5Blang%5D/(home)/components/prism-background

Copyright (c) 2025 Vercel, Inc. MIT license: see LICENSE in this directory.

Copied bloom-extract.wgsl, bloom-blur.wgsl, bloom-blur-paired.wgsl,
bloom-composite.wgsl from pipelines/dark/passes/bloom/ and
particle-light-downsample.wgsl from pipelines/dark/passes/particles/.
Kernel construction in render/prism-post.ts adapts bloom/config.ts, pairing.ts,
and uniforms.ts. dust.wgsl adapts the reference particle shader.

Exact controls: threshold .1, radius .25 (normalized spread 0), strength .7;
visible pyramid /2,/4,/8, half-kernel taps 6/10/14, factors 1/.8/.55;
independent unthresholded /16 dust light, 8x8 area filter and 18-tap half-kernel;
2200 particles with original populations, lifecycle, response 82, falloff 5.5,
and dust exposure .72. Optional host pixelScale (framebuffer/CSS pixels, default
1) scales billboard diameters without changing those source populations or their
inverse-size energy response. Subpixel grains additionally receive
min(1, framebufferDiameter²) coverage because a pixel-centered quad otherwise
covers a whole raster sample regardless of its area. Coverage multiplies final
display opacity after the unchanged particle tone mapping, not HDR energy. This corrects downsampled
display sizing; it is not an authored grain/exposure retune.
Beam opacity .72 is supplied by the host BEFORE this postprocess.
The dust .72 is a distinct upstream constant, not a second beam-opacity application.

Adaptations: only white beam HDR enters the combined light target. The chrome
material, existing SDR fog and room color never enter this pipeline. One shared
bloom is added once. Combined beam+bloom is tone mapped once; its display energy
is split into direct background/foreground contributions and a 90%/10% halo share.
The two transparent canvases bracket the unchanged chrome canvas. This is a
layered compositing approximation, not identical to Prism's opaque unified scene.
The display work layers accumulate moving dust before a final premultiplied-alpha
clamp. Foreground total alpha (beam plus dust) is capped at .03 over actual mesh.
Exterior diffusion is not clipped to a triangle or the logo silhouette. The
complete output (beam, dust and optional room) feathers only at the hero canvas
edge and has an exact transparent outer pixel border in both layers/themes.

Particles use the host camera basis and full-hero projection. Per-fragment mesh
alpha and actual camera-axis depth replace Prism's triangle discard. No glass
refraction, Cauchy dispersion, or fake opaque-metal rainbow is introduced.
World-depth and screen-space light sampling are retained artistic approximations,
not general volumetric light transport or radiance cascades. White transparent
outputs do not add a blue day veil. Optional host-selected dayRoom is display gray;
1/default disables the room completely. Values below 1 add only a broad elliptical
neutral backdrop behind the light layer (squared radial falloff, no flat panel),
after tone mapping and never into HDR
bloom/dust. A requested room can remain with zero emission; the host may set
dayRoom=1 when beamOpacity=0 for an exact transparent isolation check.

All resources use installed vgpu 0.3.1 APIs and rgba16float intermediates. Distinct
effects per blur axis/level avoid immediate uniform-write aliasing. Idle frames
reuse HDR/bloom/display caches and animate only particles.

## Additive continuous-atmosphere candidate

`createPrismPostprocess` with Target-valued `baseBackground`/`baseForeground`
arguments and `sceneChanged: true` reuses this same bloom/presentation graph
with a separate final `base-composite.wgsl` pass. Inputs `background`/`foreground` are only the new
linear-HDR in-scattering delta. `baseBackground`/`baseForeground` are the untouched
approved atmosphere outputs; they never enter bloom or tone mapping. This mode
does not run dust, its particle-light passes, or a new room backdrop. It updates
the light graph every call because the shared atmosphere density animates.

The full-hero `coverage` target stores actual opaque mesh coverage in ALPHA,
independent of chrome's .92 material alpha. Both new display deltas are multiplied
by `1 - coverage` AFTER all bloom and presentation, before premultiplied-over
composition on the base. Fully covered metal, zero delta, and outer edges return
the original base texture sample directly. Only the delta receives the canvas
feather; the old atmosphere is not re-feathered or modified. No source geometry,
old density, pointer policy, or material is changed by this reusable post module.

The earlier standalone ribbon mode remains an inactive reference; its 3% new
foreground-light allowance does NOT apply to this strict additive candidate.
