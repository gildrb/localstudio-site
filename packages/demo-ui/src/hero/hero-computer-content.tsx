import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { ComputerStatusPanel } from "../workbench/computer-status-panel";
import { ComputerLauncherPanel } from "./computer-header";
import { HeroFilesystemTree } from "./files-tree";
import { HeroReviewPanel } from "./review-panel";
import { demoProject, demoModel } from "./hero-data";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
type ContentProps = Pick<
	HeroDemoViewModel,
	| "tab"
	| "state"
	| "weekendTask"
	| "session"
	| "selectTab"
	| "openFile"
	| "setPickedTab"
	| "setUserFile"
>;
export function ComputerContent({
	tab,
	state,
	weekendTask,
	session,
	selectTab,
	openFile,
	setPickedTab,
	setUserFile,
}: ContentProps) {
	return (
		<>
			<StatusContent tab={tab} state={state} weekendTask={weekendTask} session={session} />
			{tab === "tools" ? (
				<ComputerLauncherPanel
					activeTab={tab}
					onOpenSideChat={() => {
						selectTab("side-chat");
					}}
					onOpenTerminal={() => {
						selectTab("terminal");
					}}
					onSelectTab={selectTab}
				/>
			) : null}
			{tab === "files" ? (
				<HeroFilesystemTree
					openFile={openFile}
					onOpenFile={(rel) => {
						setPickedTab("files");
						setUserFile(rel);
					}}
				/>
			) : null}
			{tab === "diff" ? <HeroReviewPanel ready={state.reviewReady} /> : null}
			{tab === "browser" ? <BrowserPreview /> : null}
			{tab === "terminal" ? (
				<section {...stylex.props(demoStyles.reset, styles.section751)}>Home shell</section>
			) : null}
			{tab === "side-chat" ? (
				<section {...stylex.props(demoStyles.reset, styles.section751)}>Side chat</section>
			) : null}
		</>
	);
}
function BrowserPreview() {
	return (
		<div {...stylex.props(demoStyles.reset, styles.div738)}>
			<div {...stylex.props(demoStyles.reset, styles.div739)}>
				<div {...stylex.props(demoStyles.reset, styles.div740)}>Trip research</div>
				<div {...stylex.props(demoStyles.reset, styles.div743)}>
					Saturday stays dry until 16:00. Rydal Water to Grasmere keeps the route under two hours.
				</div>
			</div>
		</div>
	);
}

function StatusContent({
	tab,
	state,
	weekendTask,
	session,
}: Pick<ContentProps, "tab" | "state" | "weekendTask" | "session">) {
	return tab === "status" ? (
		<ComputerStatusPanel
			activeProject={demoProject}
			activeModel={state.modelSelected || !weekendTask ? demoModel : null}
			focusedSession={session}
		/>
	) : null;
}
