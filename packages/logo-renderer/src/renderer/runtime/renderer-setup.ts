import { init } from "vgpu";
import { loadMesh } from "./load-mesh";
import { activateRenderer } from "./renderer-device";
import { resolveRendererResources, initializeSurfaces } from "./renderer-start";
import { createDevicePixelRatio, prefersReducedMotion as prefersReducedMotionSync } from "phase";
import { createPointerController } from "./pointer-input";
import type { RendererSession } from "./renderer-session";

export function setupRendererInputs(session: RendererSession) {
	const { state, refs, settings, sampled, callbacks } = session;
	const { material } = settings.material;
	const { atmosphereIntro } = settings.atmosphere;
	const { prefersReducedMotion } = settings;
	const { staticPose } = sampled;
	const {
		controlsRef,
		stateRef,
		devicePixelRatioRef,
		invalidatePointerCanvasRectRef,
		canvasRef,
		coarsePointerRef,
		canvasLayoutRef,
	} = refs;
	const { requestRender, resetLayers, handleFallback } = callbacks;
	controlsRef.current.material = material;
	controlsRef.current.insideRendering = material === "glass";
	controlsRef.current.yaw = state.baseObjectYaw;
	if (staticPose || atmosphereIntro) {
		state.mouseEnvYaw = 0;
		state.targetMouseEnvYaw = 0;
		state.mouseEnvPitch = 0;
		state.targetMouseEnvPitch = 0;
	}
	stateRef.current = state;

	resetLayers();
	if (prefersReducedMotion || prefersReducedMotionSync()) {
		handleFallback();
	}
	const dprWatcher = observeDevicePixelRatio(session);

	const pointerController = createPointerController({
		state,
		controlsRef,
		canvasRef,
		coarsePointerRef,
		canvasLayoutRef,
		devicePixelRatioRef,
		requestRender,
	});
	invalidatePointerCanvasRectRef.current = pointerController.invalidateCanvasRect;

	return cleanupRendererInputs.bind(null, session, pointerController, dprWatcher);
}

function cleanupRendererInputs(
	session: RendererSession,
	pointerController: Readonly<ReturnType<typeof createPointerController>>,
	dprWatcher: Readonly<ReturnType<typeof createDevicePixelRatio>>,
) {
	const { state, refs, callbacks } = session;
	const { invalidatePointerCanvasRectRef, stateRef, drawLoopRef, fatalErrorRef } = refs;
	const { resetLayers } = callbacks;

	state.cancelled = true;
	pointerController.detach();
	dprWatcher.stop();
	invalidatePointerCanvasRectRef.current = () => {};
	state.cleanup = undefined;
	stateRef.current = null;
	drawLoopRef.current = null;
	fatalErrorRef.current = null;
	resetLayers();
}

export async function startRenderer(session: RendererSession): Promise<(() => void) | undefined> {
	const activeCanvas = session.refs.canvasRef.current;
	let dispose: (() => void) | undefined;
	if (!activeCanvas || !("gpu" in navigator)) {
		// No WebGPU: let the host show the permanent static fallback.
		session.callbacks.handleFallback();
	} else {
		const results = await Promise.allSettled([
			loadMesh(session.settings.material.modelUrl),
			init(),
		]);
		const resources = resolveRendererResources(session, results);
		if (resources) {
			const surfaces = initializeSurfaces(session, resources, activeCanvas);
			let environmentAtlas: ImageBitmap | undefined;
			try {
				if (session.settings.material.environment === "sky") {
					const { dayUrl, nightUrl } = session.settings.material;
					const environmentUrl = session.settings.prefersDarkScheme ? nightUrl : dayUrl;
					const response = await fetch(environmentUrl);
					environmentAtlas = response.ok
						? await createImageBitmap(await response.blob())
						: undefined;
				}
			} catch {
				// The generated cubemap remains available when the image cannot load.
			}
			if (session.state.cancelled) {
				environmentAtlas?.close();
				surfaces.atmosphere?.dispose();
				surfaces.canvasSurface.dispose();
				resources.gpu.dispose();
			} else {
				dispose = activateRenderer(session, activeCanvas, resources, surfaces, environmentAtlas);
			}
		}
	}
	return dispose;
}

export type { RendererSession } from "./renderer-session";

function observeDevicePixelRatio({ refs, callbacks }: RendererSession) {
	const { devicePixelRatioRef, invalidatePointerCanvasRectRef } = refs;
	const { requestRender } = callbacks;
	const dprWatcher = createDevicePixelRatio({
		onChange: (dpr) => {
			devicePixelRatioRef.current = dpr;
			requestRender();
			invalidatePointerCanvasRectRef.current();
		},
	});
	devicePixelRatioRef.current = dprWatcher.dpr;
	return dprWatcher;
}
