declare module "@local-ai/logo-renderer/react" {
	import type { ComponentType } from "react";
	const LocalAiLogoShader: ComponentType;
	export default LocalAiLogoShader;
	export { LocalAiLogoShader };
}


declare const GPUTextureUsage: {
	readonly COPY_SRC: number;
	readonly COPY_DST: number;
	readonly TEXTURE_BINDING: number;
	readonly STORAGE_BINDING: number;
	readonly RENDER_ATTACHMENT: number;
};

declare module "*.wgsl" {
	const source: string;
	export default source;
}
