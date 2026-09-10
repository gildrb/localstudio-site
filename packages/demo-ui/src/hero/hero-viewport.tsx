import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { DEMO_HEIGHT } from "./hero-data";
import { HeroApp } from "./hero-app";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
export function HeroViewport({ model }: { readonly model: HeroDemoViewModel }) {
	const { mobile, scale, renderContents } = model;
	return (
		<div
			data-demo-viewport
			{...stylex.props(
				demoStyles.reset,
				styles.demoViewport,
				demoStyles.viewport,
				demoStyles.viewportHeight(mobile ? DEMO_HEIGHT * scale : DEMO_HEIGHT),
			)}
		>
			{renderContents ? <HeroApp model={model} /> : null}
		</div>
	);
}
