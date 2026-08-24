import "../styles/workbench-demo.css";
import { memo } from "react";
import { HeroDemo } from "../hero/HeroDemo";
import { immediateDemoClock } from "../scenario/sequence";
import { scenes, type FeatureScene } from "./scenes";

export type { FeatureScene } from "./scenes";

export const FeatureDemo = memo(function FeatureDemo({
	scene,
	repositoryUrl,
}: {
	scene: FeatureScene;
	repositoryUrl: string;
}) {
	if (scene === "workbench") {
		return <HeroDemo clock={immediateDemoClock} repositoryUrl={repositoryUrl} />;
	}
	const Scene = scenes[scene];
	return <Scene />;
});

export default FeatureDemo;
