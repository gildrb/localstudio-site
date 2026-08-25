import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./agent-chat-pane-header.styles.ts";
import { useState } from "react";
import { Menu, PanelRightFilled, PanelRightHollow } from "../ui/icon-registry";

export function AgentChatPaneHeader({
	title,
	rightPanelOpen,
	onRename,
	onToggleRightPanel,
}: {
	title: string;
	rightPanelOpen: boolean;
	onRename: (title: string) => void;
	onToggleRightPanel: () => void;
}) {
	const [renaming, setRenaming] = useState(false);
	const [draftTitle, setDraftTitle] = useState(title);
	const RightPanelIcon = rightPanelOpen ? PanelRightFilled : PanelRightHollow;
	const finishRename = () => {
		const trimmed = draftTitle.trim();
		if (trimmed) onRename(trimmed);
		setRenaming(false);
	};
	return (
		<div {...stylex.props(demoStyles.reset, styles.div24)}>
			<div {...stylex.props(demoStyles.reset, styles.div25)}>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button28)}
					aria-label="Open navigation menu"
				>
					<Menu {...stylex.props(demoStyles.reset, styles.menu31, styles.lucideScale)} />
				</button>
				{renaming ? (
					<input
						autoFocus
						name="session-title"
						autoComplete="off"
						value={draftTitle}
						onFocus={(event) => event.currentTarget.select()}
						onChange={(event) => setDraftTitle(event.target.value)}
						onBlur={finishRename}
						onKeyDown={(event) => {
							if (event.key === "Enter") finishRename();
							if (event.key === "Escape") {
								setDraftTitle(title);
								setRenaming(false);
							}
						}}
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element47)}
						aria-label="Rename session"
					/>
				) : (
					<button
						type="button"
						onClick={() => {
							setDraftTitle(title);
							setRenaming(true);
						}}
						{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element57)}
						title={title}
						aria-label={`Rename session: ${title}`}
					>
						{title}
					</button>
				)}
			</div>
			<button
				type="button"
				onClick={onToggleRightPanel}
				aria-pressed={rightPanelOpen}
				{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.panelToggle, rightPanelOpen ? styles.panelToggleOpen : styles.panelToggleClosed)}
				title={rightPanelOpen ? "Hide right sidebar" : "Show right sidebar"}
				aria-label={
					rightPanelOpen ? "Hide right sidebar" : "Show right sidebar"
				}
			>
				<RightPanelIcon {...stylex.props(demoStyles.reset, styles.rightpanelicon79, styles.lucideScale)} />
			</button>
		</div>
	);
}
