import { createEve5Renderer } from "../render";
import { createDrawLoop, type DrawLoop } from "./frame-loop";
import type { RendererSession } from "./renderer-session";
import type { RendererResources, RendererSurfaces } from "./renderer-start";

// The disposal owner is allocated once, alongside the renderer, never per frame.
type DeviceRuntime = {
	readonly session: RendererSession;
	readonly resources: RendererResources;
	readonly surfaces: RendererSurfaces;
	readonly renderer: ReturnType<typeof createEve5Renderer>;
	disposed: boolean;
	drawLoopDispose: DrawLoop["dispose"] | undefined;
	unsubscribeGpuError: (() => void) | undefined;
};

function disposeDevice(runtime: DeviceRuntime) {
	if (runtime.disposed) return;
	runtime.disposed = true;
	const { session, resources, surfaces, renderer } = runtime;
	session.refs.drawLoopRef.current = null;
	session.refs.fatalErrorRef.current = null;
	runtime.drawLoopDispose?.();
	runtime.unsubscribeGpuError?.();
	// Fatal paths call the fallback explicitly before disposal. Remount cleanup
	// must not flash the SVG placeholder over the outgoing renderer.
	renderer.dispose();
	surfaces.atmosphere?.dispose();
	surfaces.canvasSurface.dispose();
	resources.gpu.dispose();
	session.disposeRuntime = undefined;
}

function observeDevice(runtime: DeviceRuntime, dispose: () => void) {
	const {
		session: { state, callbacks },
		resources: { gpu },
	} = runtime;
	runtime.unsubscribeGpuError = gpu.onError(() => {
		if (state.cancelled || runtime.disposed) return;
		callbacks.handleFallback();
		state.cancelled = true;
		dispose();
	});
	void gpu.gpu.lost.then((info) => {
		if (state.cancelled || runtime.disposed || info?.reason === "destroyed") return;
		callbacks.handleFallback();
		state.cancelled = true;
		dispose();
	});
}

function revealCanvas(runtime: DeviceRuntime, dispose: () => void) {
	const {
		session: { state, callbacks },
		resources: { gpu },
	} = runtime;
	void gpu.device.queue
		.flush()
		.then(() => {
			if (!state.cancelled && !runtime.disposed) callbacks.handleCanvasRevealed();
		})
		.catch(() => {
			if (state.cancelled || runtime.disposed) return;
			callbacks.handleFallback();
			state.cancelled = true;
			dispose();
		});
}

function attachDrawLoop(
	runtime: DeviceRuntime,
	activeCanvas: HTMLCanvasElement,
	dispose: () => void,
) {
	const {
		session: { state, refs, callbacks },
		surfaces,
		renderer,
	} = runtime;
	const drawLoop = createDrawLoop({
		state,
		canvas: activeCanvas,
		surface: surfaces.canvasSurface,
		atmosphere: surfaces.atmosphere,
		renderer,
		controlsRef: refs.controlsRef,
		canvasLayoutRef: refs.canvasLayoutRef,
		devicePixelRatioRef: refs.devicePixelRatioRef,
		onCanvasRevealed: revealCanvas.bind(null, runtime, dispose),
		onFallback: callbacks.handleFallback,
		onFatalError: callbacks.handleFatalError,
	});
	runtime.drawLoopDispose = drawLoop.dispose;
	refs.drawLoopRef.current = drawLoop;
	refs.fatalErrorRef.current = dispose;
	callbacks.requestRender();
}

export function activateRenderer(
	session: RendererSession,
	activeCanvas: HTMLCanvasElement,
	resources: RendererResources,
	surfaces: RendererSurfaces,
	environmentAtlas: ImageBitmap | undefined,
) {
	const rendererOptions: NonNullable<Parameters<typeof createEve5Renderer>[2]> = {
		// Day/night selects the sky atlas, not a pale mask composite.
		theme: "dark",
		environmentTheme: session.settings.prefersDarkScheme ? "dark" : "light",
		bloom: true,
		backRefraction: session.settings.material.material === "glass",
	};
	if (environmentAtlas) rendererOptions.environmentAtlas = environmentAtlas;
	const renderer = createEve5Renderer(resources.gpu, resources.mesh, rendererOptions);
	environmentAtlas?.close();
	const runtime: DeviceRuntime = {
		session,
		resources,
		surfaces,
		renderer,
		disposed: false,
		drawLoopDispose: undefined,
		unsubscribeGpuError: undefined,
	};
	session.state.previousFrameTime = performance.now();
	session.state.autoRotateStartTime = session.state.previousFrameTime;
	const dispose = disposeDevice.bind(null, runtime);
	session.disposeRuntime = dispose;
	observeDevice(runtime, dispose);
	attachDrawLoop(runtime, activeCanvas, dispose);
	return dispose;
}
