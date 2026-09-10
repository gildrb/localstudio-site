import { surface, type Gpu } from "vgpu";
import type { ImprintRenderOptions } from "../render/types";

type Rect = Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">;
type AtmosphereSurface = {
	current: NonNullable<ImprintRenderOptions["atmosphere"]>;
	dispose: () => void;
};

type AtmosphereResolution = { readonly scale: number; readonly maxEdge: number };
const DEFAULT_RESOLUTION: AtmosphereResolution = { scale: 0.5, maxEdge: 768 };
const INTRO_RESOLUTION: AtmosphereResolution = { scale: 1, maxEdge: 1280 };

export function atmosphereLayout(logo: Rect, hero: Rect, resolution = DEFAULT_RESOLUTION) {
	const width = Math.max(1, hero.width);
	const height = Math.max(1, hero.height);
	const scale = Math.min(resolution.scale, resolution.maxEdge / Math.max(width, height));
	return {
		size: [
			Math.max(1, Math.round(width * scale)),
			Math.max(1, Math.round(height * scale)),
		] as const,
		logoRect: [
			(logo.left - hero.left) / width,
			(logo.top - hero.top) / height,
			logo.width / width,
			logo.height / height,
		] as const,
	};
}

function createAtmosphereTargets(
	gpu: Gpu,
	canvas: HTMLCanvasElement,
	logo: HTMLCanvasElement,
	foreground: HTMLCanvasElement | undefined,
	introCanvas: HTMLCanvasElement | undefined,
	heroRect: Rect,
	layout: Readonly<ReturnType<typeof atmosphereLayout>>,
) {
	const target = surface(gpu, canvas, {
		autoResize: false,
		size: layout.size,
		alphaMode: "premultiplied",
		label: "hero-atmosphere",
	});
	const foregroundTarget = foreground
		? surface(gpu, foreground, {
				autoResize: false,
				size: layout.size,
				alphaMode: "premultiplied",
				label: "hero-atmosphere-foreground",
			})
		: undefined;
	const introTarget = introCanvas
		? surface(gpu, introCanvas, {
				autoResize: false,
				size: atmosphereLayout(logo.getBoundingClientRect(), heroRect, INTRO_RESOLUTION).size,
				alphaMode: "opaque",
				label: "hero-atmosphere-intro",
			})
		: undefined;
	return { target, foregroundTarget, introTarget };
}

function observeAtmosphere(
	canvas: HTMLCanvasElement,
	logo: HTMLCanvasElement,
	resolution: AtmosphereResolution,
	atmosphere: AtmosphereSurface,
	requestRender: () => void,
) {
	const { target, foregroundTarget, introTarget } = atmosphere.current;
	const resize = () => {
		const nextHeroRect = canvas.getBoundingClientRect();
		const next = atmosphereLayout(logo.getBoundingClientRect(), nextHeroRect, resolution);
		target.resize(next.size);
		foregroundTarget?.resize(next.size);
		introTarget?.resize(
			atmosphereLayout(logo.getBoundingClientRect(), nextHeroRect, INTRO_RESOLUTION).size,
		);
		atmosphere.current.logoRect = next.logoRect;
		if (atmosphere.current.introPresentation) {
			// Keep the original host canvas rectangle, before renderer padding expansion.
			atmosphere.current.introPresentation.logoRect = next.logoRect;
			atmosphere.current.introPresentation.logoOpacity = Number(
				window.getComputedStyle(logo.parentElement ?? logo).opacity,
			);
		}
		atmosphere.current.pixelScale = next.size[0] / Math.max(1, nextHeroRect.width);
		requestRender();
	};
	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	observer.observe(logo);
	window.addEventListener("resize", resize, { passive: true });
	return () => {
		observer.disconnect();
		window.removeEventListener("resize", resize);
	};
}

export function createAtmosphereSurface(
	gpu: Gpu,
	canvas: HTMLCanvasElement,
	logo: HTMLCanvasElement,
	requestRender: () => void,
	foreground?: HTMLCanvasElement,
	resolution = DEFAULT_RESOLUTION,
	introCanvas?: HTMLCanvasElement,
) {
	const heroRect = canvas.getBoundingClientRect();
	const layout = atmosphereLayout(logo.getBoundingClientRect(), heroRect, resolution);
	const { target, foregroundTarget, introTarget } = createAtmosphereTargets(
		gpu,
		canvas,
		logo,
		foreground,
		introCanvas,
		heroRect,
		layout,
	);
	const atmosphere: AtmosphereSurface = {
		current: {
			target,
			logoRect: layout.logoRect,
			pixelScale: layout.size[0] / Math.max(1, heroRect.width),
		},
		dispose() {
			stopObserving();
			introTarget?.dispose();
			foregroundTarget?.dispose();
			target.dispose();
		},
	};
	if (foregroundTarget) atmosphere.current.foregroundTarget = foregroundTarget;
	if (introTarget) {
		atmosphere.current.introTarget = introTarget;
		atmosphere.current.introPresentation = {
			logoRect: layout.logoRect,
			logoOpacity: Number(window.getComputedStyle(logo.parentElement ?? logo).opacity),
		};
	}
	const stopObserving = observeAtmosphere(canvas, logo, resolution, atmosphere, requestRender);
	return atmosphere;
}
