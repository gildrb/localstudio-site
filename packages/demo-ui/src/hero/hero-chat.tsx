import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { AgentChatPaneHeader } from "../workbench/agent-chat-pane-header";
import { HeroChatThread } from "./hero-chat-thread";
import { HeroComposer } from "./hero-composer";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
export function HeroChat({ model }: { readonly model: HeroDemoViewModel }) {
	const { title, panelOpen, renameTask, setPanelOpen } = model;
	return (
		<section {...stylex.props(demoStyles.reset, styles.section524)}>
			<AgentChatPaneHeader
				title={title}
				rightPanelOpen={panelOpen}
				onRename={renameTask}
				onToggleRightPanel={() => {
					setPanelOpen((open) => !open);
				}}
			/>
			<HeroChatThread {...model} />
			<HeroComposer {...model} />
		</section>
	);
}
