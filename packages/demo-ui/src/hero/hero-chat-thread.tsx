import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { ScenarioThread, StaticThread } from "./hero-threads";
import type { HeroDemoViewModel } from "./use-hero-demo-model";
type MessageProps = Pick<
	HeroDemoViewModel,
	"messages" | "repositoryUrl" | "output" | "state" | "running" | "tools" | "extras"
>;
type ThreadProps = MessageProps & Pick<HeroDemoViewModel, "submitted" | "scrollerRef" | "mobile">;
export function HeroChatThread(model: ThreadProps) {
	const { submitted, scrollerRef, mobile } = model;
	return submitted ? (
		<div {...stylex.props(demoStyles.reset, styles.div532)}>
			<div
				ref={scrollerRef}
				data-timeline-scroller
				{...stylex.props(
					demoStyles.reset,
					styles.agentChatScroller,
					demoStyles.chatScroller,
					mobile && demoStyles.hiddenOverflow,
				)}
			>
				<div
					data-timeline-list
					{...stylex.props(demoStyles.reset, styles.agentThreadShell, demoStyles.threadShell)}
				>
					<ThreadMessages {...model} />
					<div aria-hidden="true" {...stylex.props(demoStyles.reset, styles.div561)} />
				</div>
			</div>
		</div>
	) : (
		<EmptyThread />
	);
}
function EmptyThread() {
	return (
		<div {...stylex.props(demoStyles.reset, styles.div566)}>
			<div {...stylex.props(demoStyles.reset, styles.agentThreadShell2)}>
				<div {...stylex.props(demoStyles.reset, styles.div568)}>
					<p {...stylex.props(demoStyles.reset, styles.p569)}>
						A dream is something you build for yourself.
					</p>
					<p {...stylex.props(demoStyles.reset, styles.p572)}>Just talk to it.</p>
				</div>
			</div>
		</div>
	);
}
function ThreadMessages({
	messages,
	repositoryUrl,
	output,
	state,
	running,
	tools,
	extras,
}: MessageProps) {
	return messages ? (
		<StaticThread messages={messages} repositoryUrl={repositoryUrl} />
	) : (
		<>
			<ScenarioThread
				output={output}
				resultVisible={state.resultVisible}
				running={running}
				tools={tools}
			/>
			{extras.length > 0 ? (
				<StaticThread lead={false} messages={extras} repositoryUrl={repositoryUrl} />
			) : null}
		</>
	);
}
