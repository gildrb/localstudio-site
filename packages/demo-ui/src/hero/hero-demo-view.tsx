import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles, lightTheme } from "../styles/demo-root.styles.ts";
import { useLightScheme } from "../hooks/use-light-scheme";
import { demoStatus } from "../scenario/sequence";
import { HeroViewport } from "./hero-viewport";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
export function HeroDemoView(model: HeroDemoViewModel) {
	const lightScheme = useLightScheme();
	const { hostRef, mobile, clipRight, clipBottom, activeTask, active, state } = model;
	return (
		<section
			ref={hostRef}
			{...stylex.props(
				demoStyles.reset,
				demoStyles.root,
				lightScheme && lightTheme,
				lightScheme && demoStyles.lightScheme,
				mobile && demoStyles.mobile,
				clipRight && demoStyles.clipRight,
				clipBottom && demoStyles.clipBottom,
			)}
			data-theme={lightScheme ? "zai-light" : "zai-dark"}
			data-phase={state.phase}
			data-active={active ? "true" : "false"}
			data-task={activeTask}
			data-mobile={mobile ? "true" : undefined}
			data-clip-right={clipRight ? "true" : undefined}
			data-clip-bottom={clipBottom ? "true" : undefined}
			aria-label="Local Studio workbench"
			inert={mobile}
		>
			<p {...stylex.props(demoStyles.reset, styles.p504)} role="status">
				{demoStatus(state)}
			</p>
			<HeroViewport model={model} />
		</section>
	);
}
