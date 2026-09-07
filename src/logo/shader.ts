import { createElement } from "react";
import { assets } from "../domain/asset";
import { styles } from "../styles/sections-styles";
import { LocalAiLogoShader as LogoRenderer } from "@local-ai/logo-renderer/react";

export default function LocalAiLogoShader(props: {
	onFirstFrame?: (() => void) | undefined;
	onFallback?: (() => void) | undefined;
}) {
	return createElement(LogoRenderer, {
		modelUrl: assets.logoMesh,
		dayUrl: assets.dayEnv,
		nightUrl: assets.nightEnv,
		...props,
		paintOnHover: false,
		depthReveal: true,
		material: "metallic",
		environment: "studio",
		sx: styles.heroRender,
	});
}
