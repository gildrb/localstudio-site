import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { HeroDesktopSidebar } from "./desktop-sidebar";
import { HeroComputerPanel } from "./hero-computer-panel";
import { HeroChat } from "./hero-chat";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
export function HeroApp({ model }: { readonly model: HeroDemoViewModel }) {
	const { mobile, scale, activeTask, selectTask, titles } = model;
	return (
		<div
			data-demo-app
			{...stylex.props(
				demoStyles.reset,
				styles.demoApp,
				demoStyles.app,
				demoStyles.heroAppTransform(mobile, scale),
			)}
		>
			<HeroDesktopSidebar
				mobile={mobile}
				activeTask={activeTask}
				onSelectTask={selectTask}
				titles={titles}
			/>
			<div data-no-topbar="true" {...stylex.props(demoStyles.reset, styles.div520)}>
				<div {...stylex.props(demoStyles.reset, styles.div522)}>
					<div {...stylex.props(demoStyles.reset, styles.div523)}>
						<HeroChat model={model} />
						<HeroComputerPanel model={model} />
					</div>
				</div>
			</div>
		</div>
	);
}
