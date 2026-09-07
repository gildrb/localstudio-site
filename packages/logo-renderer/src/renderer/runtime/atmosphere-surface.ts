import { surface, type Gpu } from "vgpu";
import type { ImprintRenderOptions } from "../render/types";

type Rect = Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">;
type AtmosphereSurface = {
  current: NonNullable<ImprintRenderOptions["atmosphere"]>;
  dispose: () => void;
  setResolution: (resolution?: AtmosphereResolution) => void;
};

type AtmosphereResolution = { scale: number; maxEdge: number };
const DEFAULT_RESOLUTION: AtmosphereResolution = { scale: 0.5, maxEdge: 768 };

export function atmosphereLayout(logo: Rect, hero: Rect, resolution = DEFAULT_RESOLUTION) {
  const width = Math.max(1, hero.width);
  const height = Math.max(1, hero.height);
  const scale = Math.min(resolution.scale, resolution.maxEdge / Math.max(width, height));
  return {
    size: [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))] as const,
    logoRect: [(logo.left - hero.left) / width, (logo.top - hero.top) / height, logo.width / width, logo.height / height] as const,
  };
}

export function createAtmosphereSurface(gpu: Gpu, canvas: HTMLCanvasElement, logo: HTMLCanvasElement, requestRender: () => void, foreground?: HTMLCanvasElement, resolution = DEFAULT_RESOLUTION) {
  let currentResolution = resolution;
  const heroRect = canvas.getBoundingClientRect();
  const layout = atmosphereLayout(logo.getBoundingClientRect(), heroRect, resolution);
  const target = surface(gpu, canvas, { autoResize: false, size: layout.size, alphaMode: "premultiplied", label: "hero-atmosphere" });
  const foregroundTarget = foreground ? surface(gpu, foreground, { autoResize: false, size: layout.size, alphaMode: "premultiplied", label: "hero-atmosphere-foreground" }) : undefined;
  const atmosphere: AtmosphereSurface = {
    current: { target, logoRect: layout.logoRect, pixelScale: layout.size[0] / Math.max(1, heroRect.width) },
    setResolution(next = DEFAULT_RESOLUTION) {
      currentResolution = next;
      resize();
    },
    dispose() {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      foregroundTarget?.dispose();
      target.dispose();
    },
  };
  if (foregroundTarget) atmosphere.current.foregroundTarget = foregroundTarget;
  const resize = () => {
    const nextHeroRect = canvas.getBoundingClientRect();
    const next = atmosphereLayout(logo.getBoundingClientRect(), nextHeroRect, currentResolution);
    target.resize(next.size);
    foregroundTarget?.resize(next.size);
    atmosphere.current.logoRect = next.logoRect;
    atmosphere.current.pixelScale = next.size[0] / Math.max(1, nextHeroRect.width);
    requestRender();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  observer.observe(logo);
  window.addEventListener("resize", resize, { passive: true });
  return atmosphere;
}
