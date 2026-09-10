import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { ComputerHeader } from "./computer-header";
import { ComputerContent } from "./hero-computer-content";
import { emptyTerminals, HERO_COMPUTER_WIDTH } from "./hero-data";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
function ignore(): void {}
type PanelProps = {
	readonly model: Pick<
		HeroDemoViewModel,
		| "closeTab"
		| "openTabs"
		| "panelOpen"
		| "selectTab"
		| "setPanelOpen"
		| "tab"
		| "state"
		| "weekendTask"
		| "session"
		| "openFile"
		| "setPickedTab"
		| "setUserFile"
	>;
};
export function HeroComputerPanel({ model }: PanelProps) {
	const { closeTab, openTabs, panelOpen, selectTab, setPanelOpen, tab } = model;
	if (!panelOpen) return null;
	return (
		<aside
			data-computer-panel
			{...stylex.props(
				demoStyles.reset,
				styles.agentComputerPanel,
				demoStyles.fixedWidth(HERO_COMPUTER_WIDTH),
			)}
		>
			<ComputerHeader
				tab={tab}
				openTabs={openTabs}
				terminalState={emptyTerminals}
				onSelectTab={selectTab}
				onOpenCurrentTerminal={() => {
					selectTab("terminal");
				}}
				onSelectTerminalOwner={ignore}
				onCloseTerminalOwner={ignore}
				onCloseTab={closeTab}
				onShowLauncher={() => {
					selectTab("tools");
				}}
				onClosePanel={() => {
					setPanelOpen(false);
				}}
			/>
			<ComputerContent {...model} />
		</aside>
	);
}
