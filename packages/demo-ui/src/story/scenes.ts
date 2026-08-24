import { AutomateDemo } from "./automate-demo";
import { ConfigureDemo } from "./configure-demo";
import { ControlDemo } from "./control-demo";
import { ServeDemo } from "./serve-demo";
import { WorkDemo } from "./work-demo";

export const scenes = {
	control: ControlDemo,
	serve: ServeDemo,
	work: WorkDemo,
	automate: AutomateDemo,
	configure: ConfigureDemo,
} as const;

export type FeatureScene = keyof typeof scenes;
