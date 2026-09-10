import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./computer-header.styles.ts";
import { Plus, PanelRightFilled, TerminalSquare } from "../ui/icon-registry";
import { TabPill, HeaderIconButton } from "./computer-tab-pill";
import {
	computerTabMeta,
	terminalOwnerLabel,
	type ComputerTab,
	type TerminalOwnersSnapshot,
} from "./computer-tabs";
export type { ComputerTab } from "./computer-tabs";
export { ComputerLauncherPanel } from "./computer-launcher";
type HeaderProps = {
	readonly tab: ComputerTab;
	readonly openTabs: readonly ComputerTab[];
	readonly terminalState: TerminalOwnersSnapshot;
	readonly onSelectTab: (tab: ComputerTab) => void;
	readonly onOpenCurrentTerminal: () => void;
	readonly onSelectTerminalOwner: (ownerKey: string) => void;
	readonly onCloseTerminalOwner: (ownerKey: string) => void;
	readonly onCloseTab: (tab: ComputerTab) => void;
	readonly onShowLauncher: () => void;
	readonly onClosePanel: () => void;
};
export function ComputerHeader({
	tab,
	openTabs,
	terminalState,
	onSelectTab,
	onOpenCurrentTerminal,
	onSelectTerminalOwner,
	onCloseTerminalOwner,
	onCloseTab,
	onShowLauncher,
	onClosePanel,
}: HeaderProps) {
	const visibleTabs = openTabs.filter(
		(openTab) =>
			openTab !== "tools" && (openTab !== "terminal" || terminalState.owners.length === 0),
	);
	return (
		<div {...stylex.props(demoStyles.reset, styles.div205)}>
			<div {...stylex.props(demoStyles.reset, styles.div206)}>
				<VisibleTabs
					visibleTabs={visibleTabs}
					tab={tab}
					onOpenCurrentTerminal={onOpenCurrentTerminal}
					onSelectTab={onSelectTab}
					onCloseTab={onCloseTab}
				/>
				<TerminalTabs
					terminalState={terminalState}
					tab={tab}
					onSelectTerminalOwner={onSelectTerminalOwner}
					onCloseTerminalOwner={onCloseTerminalOwner}
				/>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div247)}>
				<HeaderIconButton
					icon={Plus}
					label="Show tools"
					active={tab === "tools"}
					onClick={onShowLauncher}
				/>
				<HeaderIconButton
					icon={PanelRightFilled}
					label="Close controller panel"
					onClick={onClosePanel}
				/>
			</div>
		</div>
	);
}

function VisibleTabs({
	visibleTabs,
	tab,
	onOpenCurrentTerminal,
	onSelectTab,
	onCloseTab,
}: Pick<HeaderProps, "tab" | "onOpenCurrentTerminal" | "onSelectTab" | "onCloseTab"> & {
	readonly visibleTabs: readonly ComputerTab[];
}) {
	return (
		<>
			{visibleTabs.map((openTab) => {
				const meta = computerTabMeta(openTab);
				return (
					<TabPill
						key={openTab}
						icon={meta.icon}
						label={meta.label}
						title={meta.label}
						selected={tab === openTab}
						onSelect={() => {
							if (openTab === "terminal") onOpenCurrentTerminal();
							else onSelectTab(openTab);
						}}
						onClose={
							openTab === "status"
								? undefined
								: () => {
										onCloseTab(openTab);
									}
						}
					/>
				);
			})}
		</>
	);
}
function TerminalTabs({
	terminalState,
	tab,
	onSelectTerminalOwner,
	onCloseTerminalOwner,
}: Pick<HeaderProps, "terminalState" | "tab" | "onSelectTerminalOwner" | "onCloseTerminalOwner">) {
	return (
		<>
			{terminalState.owners.map((owner, index) => {
				const label = terminalOwnerLabel(owner, index);
				const selected = tab === "terminal" && terminalState.activeOwnerKey === owner.mountKey;
				const shortcut = index < 9 ? `⌘⌥${index + 1}` : undefined;
				return (
					<TabPill
						key={owner.mountKey}
						icon={TerminalSquare}
						label={label}
						title={shortcut !== undefined && shortcut !== "" ? `${label} (${shortcut})` : label}
						shortcut={shortcut}
						selected={selected}
						onSelect={() => {
							onSelectTerminalOwner(owner.mountKey ?? "");
						}}
						onClose={() => {
							onCloseTerminalOwner(owner.mountKey ?? "");
						}}
					/>
				);
			})}
		</>
	);
}
