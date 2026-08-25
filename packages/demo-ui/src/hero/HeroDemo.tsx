import * as stylex from "@stylexjs/stylex";
import { styles } from "./HeroDemo.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import {
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
	type FormEvent,
} from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { useDemoTabBoundary } from "../hooks/demo-tab-boundary";
import { useElementActive } from "../hooks/use-element-activity";
import { ArrowUp, ChevronDown, Plus } from "../ui/icon-registry";
import { AgentChatPaneHeader } from "../workbench/agent-chat-pane-header";
import { AgentComposerStatusBar } from "../workbench/agent-composer-status-bar";
import { AgentComposerTextArea } from "../workbench/agent-composer-textarea";
import { ComputerStatusPanel } from "../workbench/computer-status-panel";
import { AssistantMessageActions } from "../workbench/assistant-message-actions";
import { ToolBlockView, type ToolBlock } from "../workbench/tool-block";
import { UserMessage } from "../workbench/user-message";
import {
	DEMO_MODEL,
	DEMO_PROMPT,
	DEMO_TOOLS,
	demoActivePath,
	demoDelay,
	demoOutput,
	demoReducer,
	demoStatus,
	finishedDemoState,
	initialDemoState,
	browserDemoClock,
	type DemoClock,
	type DemoState,
} from "../scenario/sequence";

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
type AgentModel = {
	id: string;
	name: string;
	provider: string;
	contextWindow: number;
	maxTokens: number;
	reasoning: boolean;
	vision: boolean;
	active: boolean;
};
type Project = {
	id: string;
	name: string;
	path: string;
	addedAt: string;
	exists: boolean;
	hasGit: boolean;
	branch: string;
};
type Session = {
	id: string;
	piSessionId: string;
	projectId: string;
	cwd: string;
	modelId: string;
	title: string;
	messages: ChatMessage[];
	status: "idle" | "starting" | "running";
	error: string;
	input: string;
	tokenStats: { read: number; write: number; current: number };
	contextUsage: { tokens: number; percent: number };
};
import {
	ComputerHeader,
	ComputerLauncherPanel,
	type ComputerTab,
} from "./computer-header";
import { HeroDesktopSidebar } from "./desktop-sidebar";
import { HeroFilesystemTree } from "./files-tree";
import type { HeroTaskId } from "./projects-nav";
import { HeroReviewPanel } from "./review-panel";

const contextWindow = 202144;
const HERO_COMPUTER_WIDTH = 320;
const DEMO_WIDTH = 1392;
const DEMO_HEIGHT = 787;
const DEMO_FIT = 950;
const DEMO_MOBILE = 900;
const FOLLOW_UP_REPLY =
	"This is an interactive preview. Run Local Studio with your own files, tools, and local models.";

function useDemoFrame() {
	const hostRef = useRef<HTMLElement>(null);
	const active = useElementActive(hostRef);
	const [frame, setFrame] = useState({
		mobile: false,
		scale: 1,
		clipRight: false,
		clipBottom: false,
	});
	const [renderContents, setRenderContents] = useState(true);

	useLayoutEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const update = () => {
			const mobile = window.matchMedia(`(max-width: ${DEMO_MOBILE}px)`).matches;
			const scale = mobile ? host.clientWidth / DEMO_FIT : 1;
			const tokens = getComputedStyle(document.documentElement);
			const pageWidth = Number.parseFloat(
				tokens.getPropertyValue("--page-width"),
			);
			const gutter = Number.parseFloat(
				tokens.getPropertyValue("--page-gutter"),
			);
			const centered = Math.min(pageWidth, window.innerWidth - gutter);
			setFrame({
				mobile,
				scale,
				clipRight: centered < DEMO_WIDTH * scale - 1,
				clipBottom: host.clientHeight < DEMO_HEIGHT * scale - 1,
			});
		};
		update();
		const query = window.matchMedia(`(max-width: ${DEMO_MOBILE}px)`);
		query.addEventListener("change", update);
		const observer = new ResizeObserver(update);
		observer.observe(host);
		return () => {
			query.removeEventListener("change", update);
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const observer = new IntersectionObserver(
			([entry]) => setRenderContents(entry?.isIntersecting ?? false),
			{ rootMargin: "300px 0px" },
		);
		observer.observe(host);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) return;
		const block = (event: Event) => event.preventDefault();
		host.addEventListener("wheel", block, { passive: false });
		host.addEventListener("touchmove", block, { passive: false });
		return () => {
			host.removeEventListener("wheel", block);
			host.removeEventListener("touchmove", block);
		};
	}, []);
	return { hostRef, active, renderContents, ...frame };
}

const demoModel: AgentModel = {
	id: "qwen38-27b",
	name: DEMO_MODEL,
	provider: "local-studio",
	contextWindow,
	maxTokens: contextWindow,
	reasoning: true,
	vision: false,
	active: true,
};

const demoProject: Project = {
	id: "home",
	name: "Home",
	path: "/Users/sero/Home",
	addedAt: "2026-08-01",
	exists: true,
	hasGit: true,
	branch: "main",
};

const emptyTerminals = { owners: [], activeOwnerKey: null };

const inboxMessages: ChatMessage[] = [
	{
		id: "inbox-user",
		role: "user",
		text: "Turn the unread school emails into one checklist for Monday. Don't reply to anyone.",
	},
	{
		id: "inbox-assistant",
		role: "assistant",
		text: "Monday is clear: return the library book, sign the museum form, and pack trainers for PE. I saved the checklist locally and sent nothing.",
	},
];

function ignore(): void {}

function useHeroDemoModel(clock: DemoClock) {
	const {
		hostRef,
		active,
		renderContents,
		mobile,
		scale,
		clipRight,
		clipBottom,
	} = useDemoFrame();
	useDemoTabBoundary(hostRef);
	const reduceMotion = useReducedMotion() === true;
	const [state, dispatch] = useReducer(
		demoReducer,
		reduceMotion ? finishedDemoState : initialDemoState,
	);
	const [pickedTab, setPickedTab] = useState<ComputerTab | null>(null);
	const [extraTabs, setExtraTabs] = useState<ComputerTab[]>([]);
	const [panelOpen, setPanelOpen] = useState(true);
	const [activeTask, setActiveTask] = useState<HeroTaskId>("weekend");
	const [userFile, setUserFile] = useState<string | null>(null);
	const [titles, setTitles] = useState<Record<HeroTaskId, string>>({
		weekend: "Maya's birthday weekend",
		inbox: "Monday family reset",
	});
	const [drafts, setDrafts] = useState<Record<HeroTaskId, string>>({
		weekend: "",
		inbox: "",
	});
	const [followUps, setFollowUps] = useState<Record<HeroTaskId, ChatMessage[]>>(
		{
			weekend: [],
			inbox: [],
		},
	);
	const [userEditing, setUserEditing] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const scrollerRef = useRef<HTMLDivElement>(null);
	const extraId = useRef(0);
	const weekendTask = activeTask === "weekend";
	const prompt = DEMO_PROMPT.slice(0, state.promptChars);
	const submitted =
		!weekendTask || (state.phase !== "select" && state.phase !== "prompt");
	const output = demoOutput(state);
	const running =
		weekendTask && submitted && !state.resultVisible && state.phase !== "done";
	const tools = toolBlocksFor(state);
	const title = titles[activeTask];
	const extras = followUps[activeTask];
	const messages = weekendTask ? null : [...inboxMessages, ...extras];
	const session = demoSession(state, submitted, activeTask, title, extras);

	useEffect(() => {
		if (reduceMotion) {
			if (state.phase !== "done") dispatch({ type: "finish" });
			return;
		}
		if (!active || !weekendTask || !state.playing || state.phase === "done")
			return;
		const id = clock.timeout(() => {
			dispatch({ type: "advance" });
		}, demoDelay(state));
		return () => {
			clock.clear(id);
		};
	}, [active, clock, weekendTask, reduceMotion, state]);

	useLayoutEffect(() => {
		const scroller = scrollerRef.current;
		if (!active || !scroller || !submitted) return;
		if (state.resultVisible && extras.length === 0) {
			const toolCalls =
				scroller.querySelectorAll<HTMLElement>("[data-tool-call]");
			const anchor = toolCalls.item(Math.max(0, toolCalls.length - 2));
			if (anchor) {
				scroller.scrollTo({ top: Math.max(0, anchor.offsetTop - 12) });
				return;
			}
		}
		const followLive = state.phase === "stream" || state.phase === "tool";
		scroller.scrollTo({
			top: scroller.scrollHeight,
			behavior: reduceMotion || followLive ? "auto" : "smooth",
		});
	}, [
		active,
		activeTask,
		output,
		reduceMotion,
		running,
		state.phase,
		state.resultVisible,
		state.toolsDone,
		submitted,
		tools.length,
		extras.length,
	]);
	const autoPrompt = weekendTask && !submitted && !userEditing;
	const composerValue = autoPrompt ? prompt : drafts[activeTask];

	const openFile = userFile ?? demoActivePath(state);
	const tab =
		pickedTab ??
		(state.reviewReady && weekendTask
			? "diff"
			: state.toolsStarted > 0 && weekendTask
				? "files"
				: "status");
	const openTabs = COMPUTER_TAB_ORDER.filter(
		(item) =>
			item === "status" ||
			(item === "files" &&
				(state.toolsStarted > 0 || extraTabs.includes("files"))) ||
			(item === "diff" && (state.reviewReady || extraTabs.includes("diff"))) ||
			extraTabs.includes(item),
	);

	function selectTab(next: ComputerTab): void {
		setPanelOpen(true);
		setPickedTab(next);
		setExtraTabs((current) =>
			current.includes(next) ? current : [...current, next],
		);
	}

	function closeTab(closing: ComputerTab): void {
		if (closing === "status") return;
		setExtraTabs((current) => current.filter((item) => item !== closing));
		setPickedTab((current) => (current === closing ? "status" : current));
	}

	function selectModel(): void {
		if (state.phase === "select") dispatch({ type: "advance" });
	}

	function selectTask(task: HeroTaskId): void {
		setActiveTask(task);
		setPickedTab(task === "inbox" ? "status" : null);
		setPanelOpen(true);
		if (task === "inbox") {
			dispatch({ type: "pause" });
			return;
		}
		if (state.phase !== "done") dispatch({ type: "play" });
	}

	function renameTask(next: string): void {
		const trimmed = next.trim();
		if (!trimmed) return;
		setTitles((current) => ({ ...current, [activeTask]: trimmed }));
	}

	function takeComposer(next: string): void {
		if (activeTask === "weekend" && !userEditing) {
			setUserEditing(true);
			dispatch({ type: "pause" });
		}
		setDrafts((current) => ({ ...current, [activeTask]: next }));
	}

	function sendFollowUp(): void {
		const text = composerValue.trim();
		if (!text || autoPrompt) return;
		extraId.current += 1;
		const id = extraId.current;
		const reply = FOLLOW_UP_REPLY;
		setFollowUps((current) => ({
			...current,
			[activeTask]: [
				...current[activeTask],
				{ id: `user-extra-${id}`, role: "user", text },
				{ id: `assistant-extra-${id}`, role: "assistant", text: reply },
			],
		}));
		setDrafts((current) => ({ ...current, [activeTask]: "" }));
	}

	const gitSummary = {
		isRepo: true,
		branch: "main",
		additions: state.reviewReady ? 12 : 0,
		deletions: 0,
		statusCount: state.reviewReady ? 1 : 0,
	};

	return {
		hostRef,
		active,
		renderContents,
		mobile,
		scale,
		clipRight,
		clipBottom,
		state,
		setPickedTab,
		panelOpen,
		setPanelOpen,
		activeTask,
		setUserFile,
		titles,
		inputRef,
		scrollerRef,
		weekendTask,
		submitted,
		output,
		running,
		tools,
		title,
		extras,
		messages,
		session,
		autoPrompt,
		composerValue,
		openFile,
		tab,
		openTabs,
		selectTab,
		closeTab,
		selectModel,
		selectTask,
		renameTask,
		takeComposer,
		sendFollowUp,
		gitSummary,
	};
}

export type HeroDemoProps = {
	clock?: DemoClock;
	repositoryUrl: string;
};

export function HeroDemo({
	clock = browserDemoClock,
	repositoryUrl,
}: HeroDemoProps) {
	const model = useHeroDemoModel(clock);
	return <HeroDemoView {...model} repositoryUrl={repositoryUrl} />;
}

export default HeroDemo;

type HeroDemoViewModel = ReturnType<typeof useHeroDemoModel> & {
	repositoryUrl: string;
};

function HeroDemoView(model: HeroDemoViewModel) {
	const {
		hostRef,
		active,
		renderContents,
		mobile,
		scale,
		clipRight,
		clipBottom,
		state,
		panelOpen,
		setPanelOpen,
		activeTask,
		titles,
		inputRef,
		scrollerRef,
		weekendTask,
		submitted,
		output,
		running,
		tools,
		title,
		extras,
		messages,
		autoPrompt,
		composerValue,
		selectTab,
		selectModel,
		selectTask,
		renameTask,
		takeComposer,
		sendFollowUp,
		gitSummary,
	} = model;
	const sendDisabled = !composerValue.trim() || autoPrompt;
	return (
		<section
			ref={hostRef}
			{...stylex.props(
				demoStyles.reset,
				demoStyles.root,
				mobile && demoStyles.mobile,
				clipRight && demoStyles.clipRight,
				clipBottom && demoStyles.clipBottom,
			)}
			data-theme="zai-dark"
			data-phase={state.phase}
			data-active={active ? "true" : "false"}
			data-task={activeTask}
			data-mobile={mobile ? "true" : undefined}
			data-clip-right={clipRight ? "true" : undefined}
			data-clip-bottom={clipBottom ? "true" : undefined}
			aria-label="Local Studio workbench"
			inert={mobile}
		>
			<p {...stylex.props(demoStyles.reset, styles.p504)} role="status">
				{demoStatus(state)}
			</p>
			<div
				data-demo-viewport
				{...stylex.props(
					demoStyles.reset,
					styles.demoViewport,
					demoStyles.viewport,
					demoStyles.mobileViewport,
					demoStyles.viewportHeight(mobile ? DEMO_HEIGHT * scale : DEMO_HEIGHT),
				)}
			>
				{renderContents ? (
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
						<div
							data-no-topbar="true"
							{...stylex.props(demoStyles.reset, styles.div520)}
						>
							<div {...stylex.props(demoStyles.reset, styles.div522)}>
								<div {...stylex.props(demoStyles.reset, styles.div523)}>
									<section
										{...stylex.props(demoStyles.reset, styles.section524)}
									>
										<AgentChatPaneHeader
											title={title}
											rightPanelOpen={panelOpen}
											onRename={renameTask}
											onToggleRightPanel={() => setPanelOpen((open) => !open)}
										/>
										{submitted ? (
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
														{...stylex.props(
															demoStyles.reset,
															styles.agentThreadShell,
															demoStyles.threadShell,
														)}
													>
														{messages ? (
															<StaticThread
																messages={messages}
																repositoryUrl={model.repositoryUrl}
															/>
														) : (
															<>
																<ScenarioThread
																	output={output}
																	resultVisible={state.resultVisible}
																	running={running}
																	tools={tools}
																/>
																{extras.length > 0 ? (
																	<StaticThread
																		lead={false}
																		messages={extras}
																		repositoryUrl={model.repositoryUrl}
																	/>
																) : null}
															</>
														)}
														<div
															aria-hidden="true"
															{...stylex.props(demoStyles.reset, styles.div561)}
														/>
													</div>
												</div>
											</div>
										) : (
											<div {...stylex.props(demoStyles.reset, styles.div566)}>
												<div
													{...stylex.props(
														demoStyles.reset,
														styles.agentThreadShell2,
													)}
												>
													<div
														{...stylex.props(demoStyles.reset, styles.div568)}
													>
														<p {...stylex.props(demoStyles.reset, styles.p569)}>
															A dream is something you build for yourself.
														</p>
														<p {...stylex.props(demoStyles.reset, styles.p572)}>
															Just talk to it.
														</p>
													</div>
												</div>
											</div>
										)}
										<form
											onSubmit={(event: FormEvent) => {
												event.preventDefault();
												sendFollowUp();
											}}
											{...stylex.props(demoStyles.reset, styles.element584)}
										>
											<div
												{...stylex.props(
													demoStyles.reset,
													styles.agentComposerBox,
													demoStyles.composer,
												)}
											>
												<label
													{...stylex.props(demoStyles.reset, styles.p504)}
													htmlFor="hero-demo-composer"
												>
													Message
												</label>
												<AgentComposerTextArea
													inputRef={inputRef}
													value={composerValue}
													onChange={(event) => takeComposer(event.target.value)}
													onKeyDown={(event) => {
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
												<div {...stylex.props(demoStyles.reset, styles.div611)}>
													<button
														type="button"
														{...stylex.props(
															demoStyles.reset,
															demoStyles.controlReset,
															styles.button614,
														)}
														aria-label="Attach files"
														title="Attach files (or paste/drop into composer)"
													>
														<Plus
															{...stylex.props(
																demoStyles.reset,
																styles.plus618,
																styles.lucideScale,
															)}
															strokeWidth={1.75}
														/>
													</button>
													<div
														{...stylex.props(demoStyles.reset, styles.div620)}
													>
														<button
															type="button"
															onClick={selectModel}
															{...stylex.props(
																demoStyles.reset,
																demoStyles.controlReset,
																styles.button624,
															)}
															aria-label={`Model: ${state.modelSelected || !weekendTask ? DEMO_MODEL : "Select model"}`}
														>
															<span
																{...stylex.props(
																	demoStyles.reset,
																	styles.span628,
																)}
																translate="no"
															>
																{state.modelSelected || !weekendTask
																	? DEMO_MODEL
																	: "Select model"}
															</span>
															<ChevronDown
																{...stylex.props(
																	demoStyles.reset,
																	styles.chevrondown635,
																	styles.lucideScale,
																)}
															/>
														</button>
														<button
															type="submit"
															disabled={sendDisabled}
															{...stylex.props(
																demoStyles.reset,
																demoStyles.controlReset,
																styles.button640,
															)}
															aria-label="Send"
															title={sendDisabled ? undefined : "Send (Enter)"}
														>
															<ArrowUp
																{...stylex.props(
																	demoStyles.reset,
																	styles.arrowup644,
																	styles.lucideScale,
																)}
															/>
														</button>
													</div>
												</div>
											</div>
											<AgentComposerStatusBar
												cwd={demoProject.path}
												gitBranch="main"
												gitSummary={gitSummary}
												currentContextTokens={
													state.resultVisible || !weekendTask ? 2400 : 0
												}
												contextWindow={contextWindow}
												onOpenStatus={() => selectTab("status")}
												onOpenDiff={() => selectTab("diff")}
											/>
										</form>
									</section>
									<HeroComputerPanel model={model} />
								</div>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
}

function HeroComputerPanel({ model }: { model: HeroDemoViewModel }) {
	const {
		closeTab,
		openFile,
		openTabs,
		panelOpen,
		selectTab,
		session,
		setPanelOpen,
		setPickedTab,
		setUserFile,
		state,
		tab,
		weekendTask,
	} = model;
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
				onOpenCurrentTerminal={() => selectTab("terminal")}
				onSelectTerminalOwner={ignore}
				onCloseTerminalOwner={ignore}
				onCloseTab={closeTab}
				onShowLauncher={() => selectTab("tools")}
				onClosePanel={() => setPanelOpen(false)}
			/>
			{tab === "status" ? (
				<ComputerStatusPanel
					activeProject={demoProject}
					activeModel={state.modelSelected || !weekendTask ? demoModel : null}
					focusedSession={session}
				/>
			) : null}
			{tab === "tools" ? (
				<ComputerLauncherPanel
					activeTab={tab}
					onOpenSideChat={() => selectTab("side-chat")}
					onOpenTerminal={() => selectTab("terminal")}
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
			{tab === "browser" ? (
				<div {...stylex.props(demoStyles.reset, styles.div738)}>
					<div {...stylex.props(demoStyles.reset, styles.div739)}>
						<div {...stylex.props(demoStyles.reset, styles.div740)}>
							Trip research
						</div>
						<div {...stylex.props(demoStyles.reset, styles.div743)}>
							Saturday stays dry until 16:00. Rydal Water to Grasmere keeps the
							route under two hours.
						</div>
					</div>
				</div>
			) : null}
			{tab === "terminal" ? (
				<section {...stylex.props(demoStyles.reset, styles.section751)}>
					Home shell
				</section>
			) : null}
			{tab === "side-chat" ? (
				<section {...stylex.props(demoStyles.reset, styles.section751)}>
					Side chat
				</section>
			) : null}
		</aside>
	);
}

const COMPUTER_TAB_ORDER: ComputerTab[] = [
	"status",
	"files",
	"diff",
	"tools",
	"browser",
	"terminal",
	"side-chat",
];

function ScenarioThread({
	output,
	resultVisible,
	running,
	tools,
}: {
	output: string;
	resultVisible: boolean;
	running: boolean;
	tools: ToolBlock[];
}) {
	return (
		<>
			<div
				data-timeline-message-id="user-1"
				{...stylex.props(demoStyles.reset, styles.div787)}
			>
				<UserMessage message={userMessage()} />
			</div>
			{tools.map((tool) => (
				<div {...stylex.props(demoStyles.reset, styles.div791)} key={tool.id}>
					<ToolBlockView block={tool} />
				</div>
			))}
			{output.length > 0 || resultVisible ? (
				<div
					data-timeline-message-id="assistant-1"
					aria-live="polite"
					aria-atomic="false"
					{...stylex.props(demoStyles.reset, styles.div796)}
				>
					<article {...stylex.props(demoStyles.reset, styles.article797)}>
						<div
							data-chat-markdown
							{...stylex.props(
								demoStyles.reset,
								styles.chatMarkdown,
								demoStyles.chatMarkdown,
							)}
						>
							{output}
						</div>
						{resultVisible ? (
							<AssistantMessageActions copyText={output} />
						) : null}
					</article>
				</div>
			) : running ? (
				<div
					{...stylex.props(demoStyles.reset, styles.div805)}
					role="status"
					aria-live="polite"
				>
					<span
						{...stylex.props(
							demoStyles.reset,
							styles.codexShimmerText,
							demoStyles.shimmerText,
						)}
					>
						Thinking
					</span>
				</div>
			) : null}
		</>
	);
}

function StaticThread({
	messages,
	lead = true,
	repositoryUrl,
}: {
	messages: ChatMessage[];
	lead?: boolean;
	repositoryUrl: string;
}) {
	return (
		<>
			{messages.map((message, index) => (
				<div
					{...stylex.props(
						demoStyles.reset,
						lead && index === 0 ? styles.leadMessage : styles.timelineMessage,
					)}
					data-timeline-message-id={message.id}
					key={message.id}
				>
					{message.role === "user" ? (
						<UserMessage message={message} />
					) : (
						<article {...stylex.props(demoStyles.reset, styles.article797)}>
							<div
								data-chat-markdown
								{...stylex.props(
									demoStyles.reset,
									styles.chatMarkdown,
									demoStyles.chatMarkdown,
								)}
							>
								{message.text}
							</div>
							{message.id.startsWith("assistant-extra-") ? (
								<a
									href={repositoryUrl}
									target="_blank"
									rel="noreferrer"
									{...stylex.props(demoStyles.reset, styles.a844)}
								>
									<span {...stylex.props(demoStyles.reset)}>
										Open Local Studio on GitHub
									</span>
									<span
										aria-hidden="true"
										{...stylex.props(demoStyles.reset, styles.span847)}
									>
										↗
									</span>
								</a>
							) : null}
							<AssistantMessageActions copyText={message.text} />
						</article>
					)}
				</div>
			))}
		</>
	);
}

function userMessage(): ChatMessage {
	return { id: "user-1", role: "user", text: DEMO_PROMPT };
}

function toolBlocksFor(state: DemoState): ToolBlock[] {
	return DEMO_TOOLS.slice(0, state.toolsStarted).map((tool, index) => ({
		id: tool.id,
		name: tool.name,
		status: index < state.toolsDone ? "done" : "running",
		args: tool.args,
		resultText: index < state.toolsDone ? tool.resultText : undefined,
	}));
}

function demoSession(
	state: DemoState,
	submitted: boolean,
	task: HeroTaskId,
	title: string,
	extras: ChatMessage[],
): Session {
	const inbox = task === "inbox";
	const base = inbox ? inboxMessages : submitted ? [userMessage()] : [];
	return {
		id: inbox ? "session-inbox" : "session-weekend",
		piSessionId: inbox ? "pi-inbox" : "pi-weekend",
		projectId: demoProject.id,
		cwd: demoProject.path,
		modelId: demoModel.id,
		title,
		messages: [...base, ...extras],
		status:
			inbox || state.phase === "done"
				? "idle"
				: state.phase === "load"
					? "starting"
					: submitted
						? "running"
						: "idle",
		error: "",
		input: "",
		tokenStats: {
			read: inbox ? 900 : 1800 + state.toolsDone * 400,
			write: inbox ? 280 : 600 + state.toolsDone * 180,
			current: inbox || state.resultVisible ? 2400 : submitted ? 900 : 0,
		},
		contextUsage: {
			tokens: inbox || state.resultVisible ? 2400 : submitted ? 900 : 0,
			percent: inbox || state.resultVisible ? 2 : 1,
		},
	};
}
