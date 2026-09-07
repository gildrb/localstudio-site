// Prism landing post-processing, adapted under MIT. See ../shaders/prism/post/SOURCE.md.
// Host owns camera, light, depth, theme/room and beam exposure. This module only
// receives linear HDR light; presented chrome and old SDR fog are never relit.
import { draw, effect, target } from "vgpu";
import type { Frame, Gpu, Target, sampler } from "vgpu";
import type { Texture } from "vgpu/core";
import combineWgsl from "../shaders/prism/post/combine.wgsl";
import baseCompositeWgsl from "../shaders/prism/post/base-composite.wgsl";
import extractWgsl from "../shaders/prism/post/bloom-extract.wgsl";
import blurWgsl from "../shaders/prism/post/bloom-blur.wgsl";
import pairedBlurWgsl from "../shaders/prism/post/bloom-blur-paired.wgsl";
import bloomCompositeWgsl from "../shaders/prism/post/bloom-composite.wgsl";
import downsampleWgsl from "../shaders/prism/post/particle-light-downsample.wgsl";
import presentWgsl from "../shaders/prism/post/present.wgsl";
import copyWgsl from "../shaders/prism/post/copy.wgsl";
import outputWgsl from "../shaders/prism/post/output.wgsl";
import dustWgsl from "../shaders/prism/post/dust.wgsl";
import type { Vec3 } from "./types";

const BLOOM_TAPS = [6, 10, 14, 18] as const;
const BLOOM_DIVISORS = [2, 4, 8, 16] as const;
const DUST_PARTICLES = 2200;
const BLOOM_THRESHOLD = 0.1;
const BLOOM_STRENGTH = 0.7;
// Reference radius .25 is the minimum of [.25, 3], hence normalized spread 0.
const BLOOM_SPREAD = 0;
const BLOOM_FACTORS = [1, 0.8, 0.55, 0];

type PrismPostArgs = {
  readonly background: Target;
  readonly foreground: Target;
  readonly scene: Texture;
  readonly depth: Texture;
  readonly logoRect: readonly [number, number, number, number];
  readonly camera: readonly [number, number, number, number];
  readonly viewProj: Float32Array;
  readonly eye: Vec3;
  readonly forward: Vec3;
  readonly right: Vec3;
  readonly up: Vec3;
  readonly time: number;
  readonly day: boolean;
  /** Host-selected display gray. 1 (default) leaves the room transparent. */
  readonly dayRoom?: number;
  /** Framebuffer pixels per CSS pixel; source dust sizes are CSS-pixel sizes. */
  readonly pixelScale?: number;
  readonly output: Target;
  readonly foregroundOutput?: Target | undefined;
  readonly sceneChanged: boolean;
};

type IlluminationPostArgs = {
  readonly baseBackground: Target;
  readonly baseForeground: Target;
  readonly background: Target;
  readonly foreground: Target;
  /** Full-hero opaque geometry coverage in alpha, independent of material alpha. */
  readonly coverage: Target;
  readonly output: Target;
  readonly foregroundOutput?: Target | undefined;
  readonly logoRect: readonly [number, number, number, number];
};

type PostArgs = PrismPostArgs | (IlluminationPostArgs & { readonly sceneChanged: boolean });

// Energy-normalized Gaussian half-kernels and bilinear pairs from upstream
// bloom/config.ts, pairing.ts and uniforms.ts. Downsampling horizontal passes
// at levels 1/2 deliberately retain raw taps, exactly as the reference does.
const KERNELS = BLOOM_TAPS.map((count) => {
  const sigma = count / 3;
  const weights = Array.from({ length: 24 }, (_, i) =>
    i < count ? Math.exp(-0.5 * i * i / (sigma * sigma)) : 0);
  const sum = weights[0]! + 2 * weights.slice(1, count).reduce((a, b) => a + b, 0);
  const normalized = weights.map((weight) => weight / sum);
  const pairedWeights = Array.from({ length: 12 }, () => 0);
  const offsets = Array.from({ length: 12 }, () => 0);
  const pairCount = Math.ceil((count - 1) / 2);
  for (let pair = 0; pair < pairCount; pair++) {
    const first = 1 + pair * 2;
    const second = first + 1;
    const a = normalized[first] ?? 0;
    const b = second < count ? normalized[second] ?? 0 : 0;
    pairedWeights[pair] = a + b;
    offsets[pair] = a + b > 0 ? (first * a + second * b) / (a + b) : first;
  }
  return { normalized, pairedWeights, offsets, pairCount };
});

export function createPrismPostprocess(gpu: Gpu, lightSampler: ReturnType<typeof sampler>) {
  const combine = effect(gpu, combineWgsl, { label: "prism-post-combine-hdr" });
  const extract = effect(gpu, extractWgsl, { label: "prism-post-extract" });
  const blur = BLOOM_TAPS.map((_, level) => [0, 1].map((axis) => effect(
    gpu, axis === 0 && (level === 1 || level === 2) ? blurWgsl : pairedBlurWgsl,
    { label: `prism-post-blur-${level}-${axis}` },
  )));
  const downsample = effect(gpu, downsampleWgsl, { label: "prism-post-dust-light" });
  const bloomComposite = effect(gpu, bloomCompositeWgsl, { label: "prism-post-bloom-composite" });
  const layers = [0, 1].map((layer) => ({
    present: effect(gpu, presentWgsl, { label: `prism-post-present-${layer}` }),
    copy: effect(gpu, copyWgsl, { label: `prism-post-copy-${layer}` }),
    output: effect(gpu, outputWgsl, { label: `prism-post-output-${layer}` }),
    baseComposite: effect(gpu, baseCompositeWgsl, { label: `illumination-base-composite-${layer}` }),
    dust: draw(gpu, { shader: dustWgsl, vertices: 6, instances: DUST_PARTICLES,
      cull: "none", depth: false, blend: "additive", label: `prism-post-dust-${layer}` }),
  }));
  const owned: Target[] = [];
  let size: readonly [number, number] = [0, 0];
  let combined: Target | undefined;
  let bloom: Array<{ horizontal: Target; vertical: Target }> = [];
  let display: Target[] = [];
  let work: Target[] = [];
  let initialized = false;
  let splitForeground = false;
  let baseMode = false;
  let disposed = false;

  function make(dimensions: readonly [number, number], label: string) {
    const value = target(gpu, { size: dimensions, format: "rgba16float", label });
    owned.push(value);
    return value;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    // Every owned target is single-sample/color-only: its color is its only
    // allocation. No private MSAA/depth attachments are left behind.
    for (const value of owned) value.color.destroy();
    owned.length = 0;
  }

  return {
    render(f: Frame, args: PostArgs) {
      if (disposed) throw new Error("Prism postprocess is disposed.");
      const nextSize = args.output.size;
      const nextSplit = args.foregroundOutput !== undefined;
      const composeBase = "baseBackground" in args;
      if (composeBase) {
        for (const value of [args.baseBackground, args.baseForeground, args.coverage]) {
          if (value.size[0] !== nextSize[0] || value.size[1] !== nextSize[1]) {
            throw new Error("Illumination base, coverage and output sizes must match.");
          }
        }
        if (args.baseBackground === args.output || args.baseForeground === args.foregroundOutput) {
          throw new Error("Illumination base and output must be separate targets.");
        }
      }
      if (args.foregroundOutput && (args.foregroundOutput.size[0] !== nextSize[0]
        || args.foregroundOutput.size[1] !== nextSize[1])) {
        throw new Error("Prism foreground and background output sizes must match.");
      }
      const resized = size[0] !== nextSize[0] || size[1] !== nextSize[1];
      if (!combined) {
        combined = make(nextSize, "prism-post-combined-hdr");
        bloom = BLOOM_DIVISORS.map((divisor, level) => {
          const dimensions: readonly [number, number] = [
            Math.max(1, Math.ceil(nextSize[0] / divisor)),
            Math.max(1, Math.ceil(nextSize[1] / divisor)),
          ];
          return { horizontal: make(dimensions, `prism-post-bloom-${level}-h`),
            vertical: make(dimensions, `prism-post-bloom-${level}-v`) };
        });
        display = [0, 1].map((layer) => make(nextSize, `prism-post-cache-${layer}`));
      } else if (resized) {
        combined.resize(nextSize);
        for (const value of [...display, ...work]) value.resize(nextSize);
        bloom.forEach((level, i) => {
          const divisor = BLOOM_DIVISORS[i]!;
          const dimensions: readonly [number, number] = [
            Math.max(1, Math.ceil(nextSize[0] / divisor)),
            Math.max(1, Math.ceil(nextSize[1] / divisor)),
          ];
          level.horizontal.resize(dimensions);
          level.vertical.resize(dimensions);
        });
      }
      if (!composeBase && work.length === 0) {
        work = [0, 1].map((layer) => make(nextSize, `prism-post-work-${layer}`));
      }
      size = [nextSize[0], nextSize[1]];
      const update = !initialized || resized || nextSplit !== splitForeground
        || composeBase !== baseMode || args.sceneChanged;
      splitForeground = nextSplit;
      baseMode = composeBase;
      if (update) {
        combine.set({ backgroundTexture: args.background, foregroundTexture: args.foreground, lightSampler });
        f.pass({ target: combined, clear: [0, 0, 0, 0] }, combine);
        extract.set({ sourceTexture: combined, sourceSampler: lightSampler,
          params: { threshold: BLOOM_THRESHOLD } });
        f.pass({ target: bloom[0]!.vertical, clear: [0, 0, 0, 0] }, extract);
        // The additive-volume candidate has no particles or particle-light passes.
        for (let level = 0; level < (composeBase ? 3 : 4); level++) {
          const targets = bloom[level]!;
          if (level === 3) {
            downsample.set({ sourceTexture: combined, sourceSampler: lightSampler,
              params: { sourceTexelSize: [1 / size[0], 1 / size[1]],
                sourceToTargetScale: [size[0] / targets.vertical.size[0], size[1] / targets.vertical.size[1]] } });
            f.pass({ target: targets.vertical, clear: [0, 0, 0, 0] }, downsample);
          }
          for (let axis = 0; axis < 2; axis++) {
            const destination = axis === 0 ? targets.horizontal : targets.vertical;
            const source = axis === 1 ? targets.horizontal
              : level === 0 || level === 3 ? targets.vertical : bloom[level - 1]!.vertical;
            const kernel = KERNELS[level]!;
            const common = { direction: axis === 0 ? [1, 0] : [0, 1],
              texelSize: [1 / destination.size[0], 1 / destination.size[1]] };
            const params = axis === 0 && (level === 1 || level === 2)
              ? { ...common, tapCount: BLOOM_TAPS[level],
                coefficients0: kernel.normalized.slice(0, 4), coefficients1: kernel.normalized.slice(4, 8),
                coefficients2: kernel.normalized.slice(8, 12), coefficients3: kernel.normalized.slice(12, 16),
                coefficients4: kernel.normalized.slice(16, 20), coefficients5: kernel.normalized.slice(20, 24) }
              : { ...common, kernel: [kernel.normalized[0], kernel.pairCount, 0, 0],
                weights0: kernel.pairedWeights.slice(0, 4), weights1: kernel.pairedWeights.slice(4, 8),
                weights2: kernel.pairedWeights.slice(8, 12), offsets0: kernel.offsets.slice(0, 4),
                offsets1: kernel.offsets.slice(4, 8), offsets2: kernel.offsets.slice(8, 12) };
            const shader = blur[level]![axis]!;
            shader.set({ sourceTexture: source, sourceSampler: lightSampler, params });
            f.pass({ target: destination, clear: [0, 0, 0, 0] }, shader);
          }
        }
        bloomComposite.set({ level0Texture: bloom[0]!.vertical, level1Texture: bloom[1]!.vertical,
          level2Texture: bloom[2]!.vertical, levelSampler: lightSampler,
          params: { radius: BLOOM_SPREAD, factors: BLOOM_FACTORS } });
        f.pass({ target: bloom[0]!.horizontal, clear: [0, 0, 0, 0] }, bloomComposite);
        layers.forEach((layer, index) => {
          layer.present.set({ backgroundTexture: args.background, foregroundTexture: args.foreground,
            bloomTexture: bloom[0]!.horizontal, lightSampler,
            params: { foreground: index, bloomStrength: BLOOM_STRENGTH, splitForeground: nextSplit ? 1 : 0 } });
          f.pass({ target: display[index]!, clear: [0, 0, 0, 0] }, layer.present);
        });
        initialized = true;
      }
      // The camera and light are retained between scene updates; only dust time
      // changes on idle frames. Day policy is deliberately white/transparent:
      // room tone belongs to the host, never a dark or blue veil in this pass.
      layers.forEach((layer, index) => {
        const destination = index === 0 ? args.output : args.foregroundOutput;
        if (!destination) return;
        if ("baseBackground" in args) {
          layer.baseComposite.set({ deltaTexture: display[index]!,
            baseTexture: index === 0 ? args.baseBackground : args.baseForeground,
            coverageTexture: args.coverage });
          f.pass({ target: destination, clear: [0, 0, 0, 0] }, layer.baseComposite);
          return;
        }
        layer.copy.set({ sourceTexture: display[index]! });
        layer.dust.set({ colorTexture: bloom[1]!.vertical, lightTexture: bloom[3]!.vertical,
          lightSampler, sceneTexture: args.scene.view, sceneDepth: args.depth.view,
          params: { viewProjection: args.viewProj, logoRect: args.logoRect, camera: args.camera,
            eye: args.eye, right: args.right, up: args.up, forward: args.forward,
            outputSize: size, time: args.time, foreground: nextSplit ? index : 2, revealProgress: 1,
            pixelScale: Number.isFinite(args.pixelScale) && args.pixelScale! > 0 ? args.pixelScale! : 1 } });
        f.pass({ target: work[index]!, clear: [0, 0, 0, 0] }, (pass) => {
          pass.draw(layer.copy);
          pass.draw(layer.dust, { instances: DUST_PARTICLES });
        });
        layer.output.set({ sourceTexture: work[index]!, sceneTexture: args.scene.view,
          sceneDepth: args.depth.view, params: { logoRect: args.logoRect, foreground: index,
            room: args.day && Number.isFinite(args.dayRoom) ? Math.max(0, Math.min(1, args.dayRoom!)) : 1 } });
        f.pass({ target: destination, clear: [0, 0, 0, 0] }, layer.output);
      });
    },
    dispose,
  };
}

