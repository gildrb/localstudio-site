// Owns resize-sensitive bloom/back render targets.
// INVARIANT: Target formats, labels, and destroy-before-recreate order match the original renderer.
// Imported only by render/renderer.ts.

import { Device } from "@vgpu/core";
import { SCENE_SAMPLE_COUNT } from "./constants";
import {
  createBackDepthTexture,
  createBloomTexture,
  createSceneMsaaTexture,
  getPaddedRenderSize,
} from "./textures";
import type { BloomTargets } from "./types";

export function createBloomTargetCache(device: Device) {
  let targets: (BloomTargets & { paddingRadius: number }) | undefined;

  const dispose = () => {
    targets?.scene.destroy();
    targets?.sceneMsaa.destroy();
    targets?.backMaterial?.destroy();
    targets?.backDepth?.destroy();
    targets?.backSurfaceDepth?.destroy();
    targets?.horizontal.destroy();
    targets?.vertical.destroy();
    targets = undefined;
  };

  return {
    ensure(
      logicalWidth: number,
      logicalHeight: number,
      paddingRadius: number,
      includeBackSurface: boolean,
    ) {
      const padded = getPaddedRenderSize(logicalWidth, logicalHeight, paddingRadius);
      if (
        targets?.width === padded.width &&
        targets.height === padded.height &&
        targets.paddingRadius === paddingRadius
      ) {
        if (includeBackSurface && !targets.backMaterial) {
          targets.backMaterial = createBloomTexture(
            device,
            "eve-5-back-material-linear-hdr",
            padded.width,
            padded.height,
          );
          targets.backDepth = createBloomTexture(
            device,
            "eve-5-back-camera-axis-depth",
            padded.width,
            padded.height,
          );
          targets.backSurfaceDepth = createBackDepthTexture(
            device,
            "eve-5-back-surface-depth",
            padded.width,
            padded.height,
          );
        }
        return targets;
      }
      dispose();
      targets = {
        width: padded.width,
        height: padded.height,
        paddingRadius,
        scene: createBloomTexture(device, "eve-5-scene-linear-hdr", padded.width, padded.height),
        sceneMsaa: createSceneMsaaTexture(
          device,
          "eve-5-scene-linear-hdr-msaa",
          padded.width,
          padded.height,
          SCENE_SAMPLE_COUNT,
        ),
        backMaterial: includeBackSurface
          ? createBloomTexture(
              device,
              "eve-5-back-material-linear-hdr",
              padded.width,
              padded.height,
            )
          : undefined,
        backDepth: includeBackSurface
          ? createBloomTexture(
              device,
              "eve-5-back-camera-axis-depth",
              padded.width,
              padded.height,
            )
          : undefined,
        backSurfaceDepth: includeBackSurface
          ? createBackDepthTexture(
              device,
              "eve-5-back-surface-depth",
              padded.width,
              padded.height,
            )
          : undefined,
        // Bloom runs at half resolution: the glow is a low-frequency effect,
        // so quartering the blur pixels is visually identical and cuts the
        // dominant per-frame cost of the wide separable gaussian.
        horizontal: createBloomTexture(
          device,
          "eve-5-bloom-horizontal",
          Math.max(1, Math.ceil(padded.width / 2)),
          Math.max(1, Math.ceil(padded.height / 2)),
        ),
        vertical: createBloomTexture(
          device,
          "eve-5-bloom-vertical",
          Math.max(1, Math.ceil(padded.width / 2)),
          Math.max(1, Math.ceil(padded.height / 2)),
        ),
      };
      return targets;
    },
    dispose,
  };
}
