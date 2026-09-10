import { styles as composerStyles } from "./HeroDemo.composer.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { AgentComposerTextArea } from "../workbench/agent-composer-textarea";
import { AgentComposerStatusBar } from "../workbench/agent-composer-status-bar";
import { contextWindow, demoProject } from "./hero-data";
import { ComposerControls } from "./hero-composer-controls";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
type ComposerProps = Pick<
	HeroDemoViewModel,
	| "state"
	| "weekendTask"
	| "autoPrompt"
	| "composerValue"
	| "sendFollowUp"
	| "inputRef"
	| "takeComposer"
	| "submitted"
	| "selectModel"
	| "selectTab"
	| "gitSummary"
>;
export function HeroComposer({
	state,
	weekendTask,
	autoPrompt,
	composerValue,
	sendFollowUp,
	inputRef,
	takeComposer,
	submitted,
	selectModel,
	selectTab,
	gitSummary,
}: ComposerProps) {
	const sendDisabled = !composerValue.trim() || autoPrompt;
	return (
		<form
			onSubmit={(event: Readonly<Pick<SubmitEvent, "preventDefault">>) => {
				event.preventDefault();
				sendFollowUp();
			}}
			{...stylex.props(demoStyles.reset, composerStyles.element584)}
		>
			<div
				{...stylex.props(demoStyles.reset, composerStyles.agentComposerBox, demoStyles.composer)}
			>
				<label {...stylex.props(demoStyles.reset, styles.p504)} htmlFor="hero-demo-composer">
					Message
				</label>
				<ComposerInput
					inputRef={inputRef}
					composerValue={composerValue}
					takeComposer={takeComposer}
					sendFollowUp={sendFollowUp}
					submitted={submitted}
				/>
				<ComposerControls
					selectModel={selectModel}
					modelSelected={state.modelSelected || !weekendTask}
					sendDisabled={sendDisabled}
				/>
			</div>
			<ComposerStatus
				selectTab={selectTab}
				gitSummary={gitSummary}
				contextActive={state.resultVisible || !weekendTask}
			/>
		</form>
	);
}
function ComposerStatus({
	selectTab,
	gitSummary,
	contextActive,
}: Pick<HeroDemoViewModel, "selectTab" | "gitSummary"> & { readonly contextActive: boolean }) {
	return (
		<AgentComposerStatusBar
			cwd={demoProject.path}
			gitBranch="main"
			gitSummary={gitSummary}
			currentContextTokens={contextActive ? 2400 : 0}
			contextWindow={contextWindow}
			onOpenStatus={() => {
				selectTab("status");
			}}
			onOpenDiff={() => {
				selectTab("diff");
			}}
		/>
	);
}

function ComposerInput({
	inputRef,
	composerValue,
	takeComposer,
	sendFollowUp,
	submitted,
}: Pick<
	ComposerProps,
	"inputRef" | "composerValue" | "takeComposer" | "sendFollowUp" | "submitted"
>) {
	return (
		<AgentComposerTextArea
			inputRef={inputRef}
			value={composerValue}
			onChange={(event: { readonly target: Readonly<Pick<HTMLTextAreaElement, "value">> }) => {
				takeComposer(event.target.value);
			}}
			onKeyDown={(
				event: Readonly<
					Pick<
						import("react").KeyboardEvent<HTMLTextAreaElement>,
						"key" | "shiftKey" | "preventDefault"
					>
				>,
			) => {
				if (event.key !== "Enter" || event.shiftKey) return;
				event.preventDefault();
				sendFollowUp();
			}}
			placeholder={
				submitted
					? "Ask for follow-up changes, e.g. add tests…"
					: "Describe a task, e.g. plan a weekend…"
			}
		/>
	);
}
