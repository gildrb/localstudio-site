import { browserDemoClock, type DemoClock } from "../scenario/sequence";
import { useHeroDemoModel } from "./use-hero-demo-model";
import { HeroDemoView } from "./hero-demo-view";
export type HeroDemoProps = {
	readonly clock?: DemoClock;
	readonly repositoryUrl: string;
};
export function HeroDemo({ clock = browserDemoClock, repositoryUrl }: HeroDemoProps) {
	const model = useHeroDemoModel(clock);
	return <HeroDemoView {...model} repositoryUrl={repositoryUrl} />;
}
export default HeroDemo;
