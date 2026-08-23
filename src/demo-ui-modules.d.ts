declare module "@local-studio/demo-ui/hero" {
	export function HeroDemo(): import("react").ReactNode;
	export default HeroDemo;
}
declare module "@local-studio/demo-ui/story" {
	import type { ComponentType } from "react";
	const FeatureDemo: ComponentType<{ scene: string }>;
	export default FeatureDemo;
}
declare module "@local-studio/demo-ui/styles.css";
