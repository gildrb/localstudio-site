# VGPU Prism lighting adaptation

Source: https://github.com/vercel-labs/vgpu/tree/e1661e3385ac63dc88535c1a0e819e52702f02f8/apps/docs/app/%5Blang%5D/(home)/components/prism-background

Pinned commit: `e1661e3385ac63dc88535c1a0e819e52702f02f8`.
Copyright (c) 2025 Vercel, Inc. The full MIT notice is in `LICENSE`.

The white beam profile and radiance come from `pipelines/dark/passes/light/light.wgsl`. Bloom and particles retain their corresponding source pipeline equations. The user-specified `shared.lightFade.beamOpacity = 0.72` multiplies linear emitted RGB; it is not surface alpha.

Local adaptation: exact logo aperture contours replace triangle Snell/Cauchy transport. Three world-space ribbons pass through exact principal-axis cross-sections of the front-cap contours. Each uses 24 nonoverlapping width strips; intensity is not divided by their count. The incoming ramp starts at our actual studio source, rather than the reference frame edge. Aperture-emergent travel is normalized over a finite 0.8 source-to-hole-distance extension. A separate light-space depth map includes closed mesh side walls and the same depth-opening transform as chrome. Camera depth separates foreground and background. The chrome renderer, environment, and its tonemapping remain unchanged; separate hero canvases make this an intentional layered approximation, not the reference unified glass composite.

No spectral LUT or optical-glass refraction is used for opaque chrome.
