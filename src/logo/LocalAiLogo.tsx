import { lazy, Suspense, useState } from "react";
import { LogoPoster } from "@local-ai/logo-renderer/react";
import { assets } from "../domain/asset";
import { styles } from "../styles/sections-styles";

const Shader = lazy(() => import("./shader"));

export function LocalAiLogo() {
	const [ready, setReady] = useState(false);
	return (
		<>
			<Suspense fallback={null}>
				<Shader onFirstFrame={() => setReady(true)} onFallback={() => setReady(false)} />
			</Suspense>
			{!ready && (
				<LogoPoster sx={styles.heroRender} dayUrl={assets.heroRenderDay} nightUrl={assets.heroRenderNight} />
			)}
		</>
	);
}
