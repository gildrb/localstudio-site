import { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { LogoPoster } from "@local-ai/logo-renderer/react";
import { assets } from "../domain/asset";
import { styles } from "../styles/sections-styles";
import Shader from "./shader";

function AtmosphereBackgroundPoster() {
	return (
		<div
			aria-hidden="true"
			{...stylex.props(styles.heroAtmosphere, styles.heroAtmospherePlaceholder)}
		>
			<picture {...stylex.props(styles.heroAtmosphereBackgroundPoster)}>
				<source media="(prefers-color-scheme: light)" srcSet={assets.heroAtmosphereDay} />
				<img
					{...stylex.props(styles.heroAtmosphereImage)}
					src={assets.heroAtmosphereNight}
					alt=""
					draggable={false}
					decoding="sync"
					fetchPriority="high"
				/>
			</picture>
		</div>
	);
}

function LogoFallback() {
	return (
		<>
			<LogoPoster
				sx={styles.heroRender}
				dayUrl={assets.heroRenderDay}
				nightUrl={assets.heroRenderNight}
			/>
			<picture
				aria-hidden="true"
				{...stylex.props(
					styles.heroAtmosphere,
					styles.heroAtmospherePlaceholder,
					styles.heroAtmosphereForeground,
				)}
			>
				<source media="(prefers-color-scheme: light)" srcSet={assets.heroAtmosphereForegroundDay} />
				<img
					{...stylex.props(styles.heroAtmosphereImage)}
					src={assets.heroAtmosphereForegroundNight}
					alt=""
					draggable={false}
					decoding="sync"
					fetchPriority="high"
				/>
			</picture>
		</>
	);
}

export function LocalAiLogo() {
	const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");
	const ready = status === "ready";
	const atmosphereRef = useRef<HTMLCanvasElement>(null);
	const atmosphereForegroundRef = useRef<HTMLCanvasElement>(null);
	return (
		<>
			{status !== "ready" && <AtmosphereBackgroundPoster />}
			<canvas
				ref={atmosphereRef}
				aria-hidden="true"
				{...stylex.props(styles.heroAtmosphere, !ready && styles.heroAtmospherePending)}
			/>
			<Shader
				atmosphereRef={atmosphereRef}
				atmosphereForegroundRef={atmosphereForegroundRef}
				onPending={() => {
					setStatus("loading");
				}}
				onFirstFrame={() => {
					setStatus("ready");
				}}
				onFallback={() => {
					setStatus("fallback");
				}}
			/>
			<canvas
				ref={atmosphereForegroundRef}
				aria-hidden="true"
				{...stylex.props(
					styles.heroAtmosphere,
					styles.heroAtmosphereForeground,
					!ready && styles.heroAtmospherePending,
				)}
			/>
			{status !== "ready" && <LogoFallback />}
		</>
	);
}
