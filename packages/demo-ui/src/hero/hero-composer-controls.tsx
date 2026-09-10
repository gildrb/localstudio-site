import { styles as composerStyles } from "./HeroDemo.composer.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { ArrowUp, ChevronDown, Plus } from "../ui/icon-registry";
import { DEMO_MODEL } from "../scenario/sequence";
type ModelProps = { readonly modelSelected: boolean; readonly selectModel: () => void };
export function ComposerControls({
	modelSelected,
	selectModel,
	sendDisabled,
}: ModelProps & { readonly sendDisabled: boolean }) {
	return (
		<div {...stylex.props(demoStyles.reset, composerStyles.div611)}>
			<AttachButton />
			<div {...stylex.props(demoStyles.reset, composerStyles.div620)}>
				<ModelButton modelSelected={modelSelected} selectModel={selectModel} />
				<button
					type="submit"
					disabled={sendDisabled}
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, composerStyles.button640)}
					aria-label="Send"
					title={sendDisabled ? undefined : "Send (Enter)"}
				>
					<ArrowUp
						{...stylex.props(demoStyles.reset, composerStyles.arrowup644, styles.lucideScale)}
					/>
				</button>
			</div>
		</div>
	);
}
function AttachButton() {
	return (
		<button
			type="button"
			{...stylex.props(demoStyles.reset, demoStyles.controlReset, composerStyles.button614)}
			aria-label="Attach files"
			title="Attach files (or paste/drop into composer)"
		>
			<Plus
				{...stylex.props(demoStyles.reset, composerStyles.plus618, styles.lucideScale)}
				strokeWidth={1.75}
			/>
		</button>
	);
}
function ModelButton({ modelSelected, selectModel }: ModelProps) {
	return (
		<button
			type="button"
			onClick={selectModel}
			{...stylex.props(demoStyles.reset, demoStyles.controlReset, composerStyles.button624)}
			aria-label={`Model: ${modelSelected ? DEMO_MODEL : "Select model"}`}
		>
			<span {...stylex.props(demoStyles.reset, composerStyles.span628)} translate="no">
				{modelSelected ? DEMO_MODEL : "Select model"}
			</span>
			<ChevronDown
				{...stylex.props(demoStyles.reset, composerStyles.chevrondown635, styles.lucideScale)}
			/>
		</button>
	);
}
