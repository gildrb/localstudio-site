import { surface, type Gpu } from "vgpu";
import type { ImprintRenderOptions } from "../render/types";

type Rect = Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">;
type AtmosphereSurface = {
  current: NonNullable<ImprintRenderOptions["atmosphere"]>;
  dispose: () => void;
};

export function atmosphereLayout(logo: Rect, hero: Rect) {
  const width = Math.max(1, hero.width);
  const height = Math.max(1, hero.height);
  const scale = Math.min(0.5, 768 / Math.max(width, height));
  return {
    size: [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))] as const,
    logoRect: [(logo.left - hero.left) / width, (logo.top - hero.top) / height, logo.width / width, logo.height / height] as const,
  };
}

export function createAtmosphereSurface(gpu: Gpu, canvas: HTMLCanvasElement, logo: HTMLCanvasElement, requestRender: () => void, foreground?: HTMLCanvasElement) {
  const layout = atmosphereLayout(logo.getBoundingClientRect(), canvas.getBoundingClientRect());
  const target = surface(gpu, canvas, { autoResize: false, size: layout.size, alphaMode: "premultiplied", label: "hero-atmosphere" });
  const foregroundTarget = foreground ? surface(gpu, foreground, { autoResize: false, size: layout.size, alphaMode: "premultiplied", label: "hero-atmosphere-foreground" }) : undefined;
  const atmosphere: AtmosphereSurface = {
    current: { target, logoRect: layout.logoRect },
    dispose() {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      foregroundTarget?.dispose();
      target.dispose();
    },
  };
  if (foregroundTarget) atmosphere.current.foregroundTarget = foregroundTarget;
  const resize = () => {
    const next = atmosphereLayout(logo.getBoundingClientRect(), canvas.getBoundingClientRect());
    target.resize(next.size);
    foregroundTarget?.resize(next.size);
    atmosphere.current.logoRect = next.logoRect;
    requestRender();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  observer.observe(logo);
  window.addEventListener("resize", resize, { passive: true });
  return atmosphere;
}
