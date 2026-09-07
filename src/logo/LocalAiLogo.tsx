import { lazy, Suspense, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { LogoPoster } from "@local-ai/logo-renderer/react";
import { assets } from "../domain/asset";
import { styles } from "../styles/sections-styles";

const Shader = lazy(() => import("./shader"));

export function LocalAiLogo() {
	const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
	const ready = status === "ready";
	const atmosphereRef = useRef<HTMLCanvasElement>(null);
	const atmosphereForegroundRef = useRef<HTMLCanvasElement>(null);
	return (
		<>
			{status === "fallback" && (
				<picture aria-hidden="true" {...stylex.props(styles.heroAtmosphere)}>
					<source media="(prefers-color-scheme: light)" srcSet={assets.heroAtmosphereDay} />
					<img {...stylex.props(styles.heroAtmosphereImage)} src={assets.heroAtmosphereNight} alt="" draggable={false} />
				</picture>
			)}
			<canvas ref={atmosphereRef} aria-hidden="true" {...stylex.props(styles.heroAtmosphere, !ready && styles.heroAtmospherePending)} />
			<Suspense fallback={null}>
				<Shader atmosphereRef={atmosphereRef} atmosphereForegroundRef={atmosphereForegroundRef} onPending={() => setStatus("loading")} onFirstFrame={() => setStatus("ready")} onFallback={() => setStatus("fallback")} />
			</Suspense>
			<canvas ref={atmosphereForegroundRef} aria-hidden="true" {...stylex.props(styles.heroAtmosphere, styles.heroAtmosphereForeground, !ready && styles.heroAtmospherePending)} />
			{status === "fallback" && (
				<LogoPoster sx={styles.heroRender} dayUrl={assets.heroRenderDay} nightUrl={assets.heroRenderNight} />
			)}
		</>
	);
}
