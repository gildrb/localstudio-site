import { styles as threadStyles } from "./HeroDemo.thread.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { AssistantMessageActions } from "../workbench/assistant-message-actions";
import { ToolBlockView, type ToolBlock } from "../workbench/tool-block";
import { UserMessage } from "../workbench/user-message";
import { userMessage } from "./hero-data";
import type { ChatMessage } from "./hero-types";
export function ScenarioThread({
	output,
	resultVisible,
	running,
	tools,
}: {
	readonly output: string;
	readonly resultVisible: boolean;
	readonly running: boolean;
	readonly tools: readonly Readonly<ToolBlock>[];
}) {
	return (
		<>
			<div
				data-timeline-message-id="user-1"
				{...stylex.props(demoStyles.reset, threadStyles.div787)}
			>
				<UserMessage message={userMessage()} />
			</div>
			{tools.map((tool) => (
				<div {...stylex.props(demoStyles.reset, threadStyles.div791)} key={tool.id}>
					<ToolBlockView block={tool} />
				</div>
			))}
			<ScenarioOutput output={output} resultVisible={resultVisible} running={running} />
		</>
	);
}

export function StaticThread({
	messages,
	lead = true,
	repositoryUrl,
}: {
	readonly messages: readonly ChatMessage[];
	readonly lead?: boolean;
	readonly repositoryUrl: string;
}) {
	return (
		<>
			{messages.map((message, index) => (
				<div
					{...stylex.props(
						demoStyles.reset,
						lead && index === 0 ? threadStyles.leadMessage : threadStyles.timelineMessage,
					)}
					data-timeline-message-id={message.id}
					key={message.id}
				>
					{message.role === "user" ? (
						<UserMessage message={message} />
					) : (
						<StaticAssistant message={message} repositoryUrl={repositoryUrl} />
					)}
				</div>
			))}
		</>
	);
}

function StaticAssistant({
	message,
	repositoryUrl,
}: {
	readonly message: ChatMessage;
	readonly repositoryUrl: string;
}) {
	return (
		<article {...stylex.props(demoStyles.reset, threadStyles.article797)}>
			<div
				data-chat-markdown
				{...stylex.props(demoStyles.reset, threadStyles.chatMarkdown, demoStyles.chatMarkdown)}
			>
				{message.text}
			</div>
			{message.id.startsWith("assistant-extra-") ? (
				<a
					href={repositoryUrl}
					target="_blank"
					rel="noreferrer"
					{...stylex.props(demoStyles.reset, threadStyles.a844)}
				>
					<span {...stylex.props(demoStyles.reset)}>Open Local Studio on GitHub</span>
					<span aria-hidden="true" {...stylex.props(demoStyles.reset, threadStyles.span847)}>
						↗
					</span>
				</a>
			) : null}
			<AssistantMessageActions copyText={message.text} />
		</article>
	);
}

function ScenarioOutput({
	output,
	resultVisible,
	running,
}: {
	readonly output: string;
	readonly resultVisible: boolean;
	readonly running: boolean;
}) {
	return output.length > 0 || resultVisible ? (
		<ScenarioAssistant output={output} resultVisible={resultVisible} />
	) : running ? (
		<div {...stylex.props(demoStyles.reset, threadStyles.div805)} role="status" aria-live="polite">
			<span
				{...stylex.props(demoStyles.reset, threadStyles.codexShimmerText, demoStyles.shimmerText)}
			>
				Thinking
			</span>
		</div>
	) : null;
}
function ScenarioAssistant({
	output,
	resultVisible,
}: {
	readonly output: string;
	readonly resultVisible: boolean;
}) {
	return (
		<div
			data-timeline-message-id="assistant-1"
			aria-live="polite"
			aria-atomic="false"
			{...stylex.props(demoStyles.reset, threadStyles.div796)}
		>
			<article {...stylex.props(demoStyles.reset, threadStyles.article797)}>
				<div
					data-chat-markdown
					{...stylex.props(demoStyles.reset, threadStyles.chatMarkdown, demoStyles.chatMarkdown)}
				>
					{output}
				</div>
				{resultVisible ? <AssistantMessageActions copyText={output} /> : null}
			</article>
		</div>
	);
}
