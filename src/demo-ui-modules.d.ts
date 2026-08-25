declare module "@local-studio/demo-ui/hero" {
	export function HeroDemo(props: {
		clock?: {
			now: () => number;
			timeout: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
			clear: (id: ReturnType<typeof setTimeout>) => void;
		};
		repositoryUrl: string;
	}): import("react").ReactNode;
	export default HeroDemo;
}
declare module "@local-studio/demo-ui/story" {
	import type { ComponentType } from "react";
	const FeatureDemo: ComponentType<{ scene: string }>;
	export default FeatureDemo;
}
