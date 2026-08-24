declare module "@local-ai/logo-renderer/react" {
	import type { ComponentType } from "react";
	const LocalAiLogoShader: ComponentType<{
		modelUrl: string;
		fallbackUrl: string;
	}>;
	export default LocalAiLogoShader;
	export { LocalAiLogoShader };
}
