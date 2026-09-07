import { createElement, useEffect, useState, type RefObject } from "react";
import { assets } from "../domain/asset";
import { styles } from "../styles/sections-styles";
import { LocalAiLogoShader as LogoRenderer } from "@local-ai/logo-renderer/react";

export default function LocalAiLogoShader(props: {
	atmosphereRef?: RefObject<HTMLCanvasElement | null> | undefined;
	atmosphereForegroundRef?: RefObject<HTMLCanvasElement | null> | undefined;
	onPending?: (() => void) | undefined;
	onFirstFrame?: (() => void) | undefined;
	onFallback?: (() => void) | undefined;
}) {
	const [darkScheme, setDarkScheme] = useState(false);
	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setDarkScheme(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	return createElement(LogoRenderer, {
		modelUrl: assets.logoMesh,
		dayUrl: assets.dayEnv,
		nightUrl: assets.nightEnv,
		...props,
		// The dark prelude would hide the light theme's black hero text.
		atmosphereIntro: darkScheme,
		paintOnHover: false,
		depthReveal: true,
		material: "metallic",
		environment: "studio",
		sx: styles.heroRender,
	});
}
