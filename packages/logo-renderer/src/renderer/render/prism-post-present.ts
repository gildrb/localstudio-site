import type { Frame } from "vgpu";
import { DUST_PARTICLES } from "./prism-post-kernels";
import type { PostArgs, PostState, PrismPostArgs } from "./prism-post-types";

/** Cache camera/light work; idle frames change only dust time. Host owns day-room tone. */
export function presentPostLayers(state: PostState, f: Frame, args: PostArgs, nextSplit: boolean) {
	const { display, bloom, work, size, lightSampler } = state;
	const { layers } = state.pipelines;
	layers.forEach((layer, index) => {
		const destination = index === 0 ? args.output : args.foregroundOutput;
		if (!destination) return;
		if ("baseBackground" in args) {
			layer.baseComposite.set({
				deltaTexture: display[index]!,
				baseTexture: index === 0 ? args.baseBackground : args.baseForeground,
				coverageTexture: args.coverage,
			});
			f.pass({ target: destination, clear: [0, 0, 0, 0] }, layer.baseComposite);
			return;
		}
		layer.copy.set({ sourceTexture: display[index]! });
		layer.dust.set({
			colorTexture: bloom[1]!.vertical,
			lightTexture: bloom[3]!.vertical,
			lightSampler,
			sceneTexture: args.scene.view,
			sceneDepth: args.depth.view,
			params: dustParameters(args, size, nextSplit, index),
		});
		f.pass({ target: work[index]!, clear: [0, 0, 0, 0] }, (pass) => {
			pass.draw(layer.copy);
			pass.draw(layer.dust, { instances: DUST_PARTICLES });
		});
		layer.output.set({
			sourceTexture: work[index]!,
			sceneTexture: args.scene.view,
			sceneDepth: args.depth.view,
			params: {
				logoRect: args.logoRect,
				foreground: index,
				room:
					args.day && Number.isFinite(args.dayRoom) ? Math.max(0, Math.min(1, args.dayRoom!)) : 1,
			},
		});
		f.pass({ target: destination, clear: [0, 0, 0, 0] }, layer.output);
	});
}

function dustParameters(
	args: PrismPostArgs,
	size: readonly [number, number],
	nextSplit: boolean,
	index: number,
) {
	return {
		viewProjection: args.viewProj,
		logoRect: args.logoRect,
		camera: args.camera,
		eye: args.eye,
		right: args.right,
		up: args.up,
		forward: args.forward,
		outputSize: size,
		time: args.time,
		foreground: nextSplit ? index : 2,
		revealProgress: 1,
		pixelScale: Number.isFinite(args.pixelScale) && args.pixelScale! > 0 ? args.pixelScale! : 1,
	};
}
