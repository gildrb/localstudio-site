import type { Target } from "vgpu";
import { STUDIO_BACKLIGHT_POSITION } from "../env-lights";
import { cameraBasis, dot, orbitEye, sub } from "../math";
import type { ImprintRenderOptions, RenderControls, Vec3 } from "../types";

type AtmosphereTarget = Pick<Target, "size">;

export type AtmosphereBindings<TextureView, Sampler> = {
	readonly sceneTexture: TextureView;
	readonly sceneDepth: TextureView;
	readonly texSampler: Sampler;
	readonly params: ReturnType<typeof atmosphereParameters>["params"] & {
		readonly foreground: number;
	};
};

type AtmospherePipeline<TextureView, Sampler> = {
	set(bindings: AtmosphereBindings<TextureView, Sampler>): void;
};

export function renderAtmosphere<
	TargetResource extends AtmosphereTarget,
	TextureView,
	Sampler,
	Pipeline extends AtmospherePipeline<TextureView, Sampler>,
>(
	f: {
		pass(
			options: {
				readonly target: TargetResource;
				readonly clear: readonly [number, number, number, number];
			},
			pipeline: NoInfer<Pipeline>,
		): void;
	},
	r: {
		readonly orbitTarget: Vec3;
		readonly sampler: Sampler;
		readonly pipelines: { readonly atmosphere: Pipeline; readonly atmosphereForeground: Pipeline };
	},
	scene: { readonly view: TextureView },
	depth: { readonly view: TextureView },
	camera: readonly [number, number, number, number],
	controls: Readonly<RenderControls>,
	imprint: ImprintRenderOptions<TargetResource>,
	day: boolean,
	prepareOnly = false,
) {
	const atmosphere = imprint.atmosphere;
	const prepared =
		atmosphere &&
		atmosphereParameters(atmosphere, imprint.time ?? 0, camera, controls, r.orbitTarget, day);
	if (atmosphere && prepared && !prepareOnly) {
		const bindings = { sceneTexture: scene.view, sceneDepth: depth.view, texSampler: r.sampler };
		r.pipelines.atmosphere.set({ ...bindings, params: { ...prepared.params, foreground: 0 } });
		f.pass({ target: atmosphere.target, clear: [0, 0, 0, 0] }, r.pipelines.atmosphere);
		if (atmosphere.foregroundTarget) {
			r.pipelines.atmosphereForeground.set({
				...bindings,
				params: { ...prepared.params, foreground: 1 },
			});
			f.pass(
				{ target: atmosphere.foregroundTarget, clear: [0, 0, 0, 0] },
				r.pipelines.atmosphereForeground,
			);
		}
	}
	return prepared;
}

function atmosphereParameters(
	atmosphere: Readonly<
		Pick<NonNullable<ImprintRenderOptions<AtmosphereTarget>["atmosphere"]>, "target" | "logoRect">
	>,
	time: number,
	camera: readonly [number, number, number, number],
	controls: Readonly<RenderControls>,
	orbitTarget: Vec3,
	day: boolean,
) {
	// Inverse of env-sample.wgsl rotate_x(rotate_y(direction, yaw), pitch).
	// Preserve the actual existing studio-light position and distance.
	const [x, y, z] = STUDIO_BACKLIGHT_POSITION;
	const cy = Math.cos(controls.envYaw),
		sy = Math.sin(controls.envYaw);
	const cp = Math.cos(controls.envPitch),
		sp = Math.sin(controls.envPitch);
	const pitchedY = y * cp + z * sp,
		pitchedZ = -y * sp + z * cp;
	const eye = orbitEye(orbitTarget, controls.radius, controls.yaw, controls.pitch);
	const basis = cameraBasis(eye, orbitTarget);
	const toLight = sub([x * cy + pitchedZ * sy, pitchedY, -x * sy + pitchedZ * cy], eye);
	const params = {
		logoRect: atmosphere.logoRect,
		aspect: atmosphere.target.size[0] / Math.max(1, atmosphere.target.size[1]),
		time,
		envYaw: controls.envYaw,
		envPitch: controls.envPitch,
		day: day ? 1 : 0,
		camera,
		lightPosition: [
			dot(toLight, basis.right),
			-dot(toLight, basis.up),
			dot(toLight, basis.forward),
			0,
		],
	} as const;
	return { params, eye, basis };
}
