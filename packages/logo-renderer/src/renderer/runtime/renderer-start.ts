import { surface, type Gpu } from "vgpu";
import { DEFAULT_CAMERA_FOV, cameraRadiusForBounds, type MeshData } from "../render";
import { resizeCanvas } from "./canvas-sizing";
import { createAtmosphereSurface } from "./atmosphere-surface";
import type { RendererSession } from "./renderer-session";

export function resolveRendererResources(
	session: RendererSession,
	[meshResult, gpuResult]: readonly [PromiseSettledResult<MeshData>, PromiseSettledResult<Gpu>],
) {
	if (meshResult.status === "rejected") {
		if (gpuResult.status === "fulfilled") gpuResult.value.dispose();
		throw meshResult.reason;
	}
	if (gpuResult.status === "rejected") throw gpuResult.reason;
	const mesh = meshResult.value;
	const gpu = gpuResult.value;
	let resources: { readonly mesh: MeshData; readonly gpu: Gpu } | undefined;
	if (session.state.cancelled) {
		gpu.dispose();
	} else {
		session.disposeRuntime = () => {
			gpu.dispose();
		};
		session.state.activeMesh = mesh;
		resources = { mesh, gpu };
	}
	return resources;
}

function initializeAtmosphere(session: RendererSession, gpu: Gpu, activeCanvas: HTMLCanvasElement) {
	const {
		atmosphereRef,
		atmosphereForegroundRef,
		prismAtmosphere,
		atmosphereIntro,
		atmosphereBeamOpacity,
		atmosphereDayRoom,
	} = session.settings.atmosphere;
	const atmosphere = atmosphereRef?.current
		? createAtmosphereSurface(
				gpu,
				atmosphereRef.current,
				activeCanvas,
				session.callbacks.requestRender,
				atmosphereForegroundRef?.current ?? undefined,
				prismAtmosphere ? { scale: 1, maxEdge: 1280 } : undefined,
			)
		: undefined;
	if (atmosphere) {
		if (atmosphereIntro) atmosphere.current.introTime = 0;
		atmosphere.current.prism = prismAtmosphere;
		if (atmosphereBeamOpacity !== undefined) atmosphere.current.beamOpacity = atmosphereBeamOpacity;
		if (atmosphereDayRoom !== undefined) atmosphere.current.dayRoom = atmosphereDayRoom;
	}
	return atmosphere;
}

export function initializeSurfaces(
	session: RendererSession,
	resources: NonNullable<ReturnType<typeof resolveRendererResources>>,
	activeCanvas: HTMLCanvasElement,
) {
	const { controlsRef, containerRef, canvasLayoutRef, devicePixelRatioRef } = session.refs;
	// Frame the real mark: it is wider than tall, so a height-only fit
	// would clip the silhouette at both canvas edges.
	controlsRef.current.radius = cameraRadiusForBounds(
		DEFAULT_CAMERA_FOV,
		resources.mesh.bounds,
		session.sampled.viewportAspect,
	);
	const initialRect = containerRef.current?.getBoundingClientRect();
	if (initialRect && initialRect.width > 0 && initialRect.height > 0) {
		canvasLayoutRef.current = { width: initialRect.width, height: initialRect.height };
	}
	resizeCanvas(activeCanvas, canvasLayoutRef, devicePixelRatioRef);
	const canvasSurface = surface(resources.gpu, activeCanvas, {
		autoResize: false,
		size: [activeCanvas.width, activeCanvas.height],
		alphaMode: "premultiplied",
	});
	const atmosphere = initializeAtmosphere(session, resources.gpu, activeCanvas);
	return { canvasSurface, atmosphere };
}

export type RendererResources = NonNullable<ReturnType<typeof resolveRendererResources>>;
export type RendererSurfaces = ReturnType<typeof initializeSurfaces>;
