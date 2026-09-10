import { memo } from "react";
import { scenes, type FeatureScene } from "./scenes";

export type { FeatureScene } from "./scenes";

export const FeatureDemo = memo(function FeatureDemo({ scene }: { scene: FeatureScene }) {
	const Scene = scenes[scene];
	return <Scene />;
});

export default FeatureDemo;
