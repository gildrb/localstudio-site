import { createElement } from "react";
import { assets } from "../domain/asset";
import { styles } from "../styles/sections-styles";
import {
	LocalAiLogoShader as LogoRenderer,
	type LocalAiLogoShaderProps,
} from "@local-ai/logo-renderer/react";

export default function LocalAiLogoShader(
	props: Pick<
		LocalAiLogoShaderProps,
		| "atmosphereRef"
		| "atmosphereForegroundRef"
		| "atmosphereIntroRef"
		| "onPending"
		| "onFirstFrame"
		| "onFallback"
	>,
) {
	return createElement(LogoRenderer, {
		modelUrl: assets.logoMesh,
		dayUrl: assets.dayEnv,
		nightUrl: assets.nightEnv,
		...props,
		atmosphereIntro: false,
		paintOnHover: false,
		depthReveal: true,
		material: "metallic",
		environment: "studio",
		sx: styles.heroRender,
	});
}
