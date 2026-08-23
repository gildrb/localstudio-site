import "../styles/workbench-demo.css";
import { memo } from "react";
import { AutomateDemo } from "./automate-demo";
import { ConfigureDemo } from "./configure-demo";
import { ControlDemo } from "./control-demo";
import { ServeDemo } from "./serve-demo";
import { WorkDemo } from "./work-demo";
import type { FeatureScene } from "./scenes";

export type { FeatureScene };

const SCENES = {
	control: ControlDemo,
	serve: ServeDemo,
	work: WorkDemo,
	automate: AutomateDemo,
	configure: ConfigureDemo,
} as const;

export const FeatureDemo = memo(function FeatureDemo({ scene }: { scene: FeatureScene }) {
	const Scene = SCENES[scene];
	return <Scene />;
});

export default FeatureDemo;
