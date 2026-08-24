import "../styles/workbench-demo.css";
import {
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
	type CSSProperties,
	type FormEvent,
} from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { useDemoTabBoundary } from "../hooks/demo-tab-boundary";
import { useElementActive } from "../hooks/use-element-activity";
import { ArrowUp, ChevronDown, Plus } from "..";
import { AgentChatPaneHeader } from "..";
import { AgentComposerStatusBar } from "..";
import { AgentComposerTextArea } from "..";
import { ComputerStatusPanel } from "..";
import { AssistantMessageActions } from "..";
import { ToolBlockView } from "..";
import { UserMessage } from "..";
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

type ComputerTab =
	| "status"
	| "tools"
	| "side-chat"
	| "browser"
	| "files"
	| "diff"
	| "terminal";
type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
type ToolBlock = {
	kind: "tool";
	id: string;
	name: string;
	status: "done" | "running";
	text: string;
	args: unknown;
	resultText?: string | undefined;
};
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
import { ComputerHeader, ComputerLauncherPanel } from "./computer-header";
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
const LOCAL_STUDIO_REPOSITORY =
	"https://github.com/sybil-solutions/local-studio";
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
			dispatch({ type: "finish" });
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
		const followLive = state.phase === "stream" || state.phase === "tool";
		scroller.scrollTo({
			top: scroller.scrollHeight,
			behavior:
				reduceMotion || followLive || state.resultVisible ? "auto" : "smooth",
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

	useLayoutEffect(() => {
		const node = inputRef.current;
		if (!active || !node) return;
		if (!composerValue) {
			node.style.height = "";
			return;
		}
		node.style.height = "auto";
		node.style.height = `${node.scrollHeight}px`;
	}, [active, composerValue]);
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

export function HeroDemo({ clock = browserDemoClock }: { clock?: DemoClock } = {}) {
	const model = useHeroDemoModel(clock);
	return <HeroDemoView {...model} />;
}

export default HeroDemo;

function HeroDemoView(model: ReturnType<typeof useHeroDemoModel>) {
	const {
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
	} = model;
	const sendDisabled = !composerValue.trim() || autoPrompt;
	const appStyle: CSSProperties = { width: DEMO_WIDTH, height: DEMO_HEIGHT };
	if (mobile) {
		appStyle.transform = `scale(${scale})`;
		appStyle.transformOrigin = "top left";
	}
	return (
		<section
			ref={hostRef}
			className="demo ls-app"
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
			<p className="sr-only" role="status">
				{demoStatus(state)}
			</p>
			<div
				className="demo__viewport"
				style={{ height: mobile ? DEMO_HEIGHT * scale : DEMO_HEIGHT }}
			>
				{renderContents ? (
					<div className="demo__app" style={appStyle}>
						<HeroDesktopSidebar
							activeTask={activeTask}
							onSelectTask={selectTask}
							titles={titles}
						/>
						<div
							data-no-topbar="true"
							className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-(--agent-bg)"
						>
							<div className="agent-workspace flex h-full min-h-0 w-full flex-col text-(--fg)">
								<div className="agent-workspace-panel-row relative flex min-h-0 flex-1">
									<section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-(--agent-bg) shadow-[inset_1px_0_rgba(255,255,255,0.015)]">
										<AgentChatPaneHeader
											title={title}
											rightPanelOpen={panelOpen}
											onRename={renameTask}
											onToggleRightPanel={() => setPanelOpen((open) => !open)}
										/>
										{submitted ? (
											<div className="agent-timeline-frame relative flex min-h-0 min-w-0 flex-1">
												<div
													ref={scrollerRef}
													data-timeline-scroller
													className="agent-chat-scroller min-h-0 min-w-0 flex-1 overflow-y-auto bg-(--agent-bg) px-4 pb-0 pt-2 [overflow-anchor:none] [overscroll-behavior:contain] [scrollbar-gutter:stable] sm:px-5"
												>
													<div
														data-timeline-list
														className="agent-thread-shell mx-auto flex flex-col"
													>
														{messages ? (
															<StaticThread messages={messages} />
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
																	/>
																) : null}
															</>
														)}
														<div aria-hidden="true" className="h-2" />
													</div>
												</div>
											</div>
										) : (
											<div className="flex min-h-0 flex-1 overflow-y-auto bg-(--agent-bg) px-6 pb-10 pt-2">
												<div className="agent-thread-shell mx-auto flex flex-1">
													<div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
														<p className="max-w-[24ch] text-[clamp(1.45rem,2.6vw,2.1rem)] font-semibold leading-[1.22] tracking-[-0.02em] text-(--fg)/90">
															A dream is something you build for yourself.
														</p>
														<p className="text-[length:var(--fs-xl)] text-(--dim)">
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
											className="relative z-[100] shrink-0 bg-transparent px-3 pb-2 pt-0 sm:px-5"
										>
											<div className="agent-composer-box relative z-10 mx-auto w-full max-w-[calc(var(--composer-w)*0.9)] overflow-visible rounded-[var(--composer-radius)] border border-(--border) bg-(--composer) shadow-[var(--composer-elevation)] [corner-shape:superellipse(1.5)] sm:w-[90%]">
												<label className="sr-only" htmlFor="hero-demo-composer">
													Message
												</label>
												<AgentComposerTextArea
													inputRef={inputRef}
													value={composerValue}
													onPaste={(event) => {
														const text = event.clipboardData.getData("text");
														if (!text) return;
														event.preventDefault();
														takeComposer(`${composerValue}${text}`);
													}}
													onChange={(event) => takeComposer(event.target.value)}
													onKeyDown={(event) => {
														if (event.key !== "Enter" || event.shiftKey) return;
														event.preventDefault();
														sendFollowUp();
													}}
													placeholder={
														submitted
															? "Ask for follow-up changes"
															: "Do anything"
													}
												/>
												<div className="agent-composer-actions-row flex min-h-9 items-center gap-0.5 bg-transparent px-2 pb-2 pt-0 text-xs">
													<button
														type="button"
														className="inline-flex !h-7 !min-h-7 !w-7 !min-w-7 shrink-0 items-center justify-center rounded-full text-(--hl2) hover:bg-(--hover) hover:text-(--fg)"
														aria-label="Attach files"
														title="Attach files (or paste/drop into composer)"
													>
														<Plus className="h-4 w-4" strokeWidth={1.75} />
													</button>
													<div className="ml-auto flex min-w-0 shrink items-center gap-0.5">
														<button
															type="button"
															onClick={selectModel}
															className="group/model inline-flex !h-[30px] !min-h-[30px] !min-w-0 max-w-full items-center justify-between gap-1 rounded-lg bg-transparent pl-2 pr-1.5 text-[length:var(--fs-base)] whitespace-nowrap text-(--fg)/85 transition-colors hover:bg-(--hover) hover:text-(--fg)"
															aria-label={`Model: ${state.modelSelected || !weekendTask ? DEMO_MODEL : "Select model"}`}
														>
															<span
																className="min-w-0 max-w-[180px] truncate text-left"
																translate="no"
															>
																{state.modelSelected || !weekendTask
																	? DEMO_MODEL
																	: "Select model"}
															</span>
															<ChevronDown className="pointer-events-none h-3.5 w-3.5 shrink-0 text-(--dim)" />
														</button>
														<button
															type="submit"
															disabled={sendDisabled}
															className="inline-flex !h-[30px] !min-h-[30px] !w-[30px] !min-w-[30px] shrink-0 items-center justify-center rounded-full bg-(--fg) text-(--bg) transition-opacity hover:opacity-85 disabled:bg-(--hl3) disabled:opacity-100"
															aria-label="Send"
															title={sendDisabled ? undefined : "Send (Enter)"}
														>
															<ArrowUp className="h-4 w-4 stroke-[2.25]" />
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
									{panelOpen ? (
										<aside
											className="agent-computer-panel relative flex min-h-0 shrink-0 flex-col border-l border-(--border) bg-(--color-panel)"
											style={{ width: HERO_COMPUTER_WIDTH }}
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
													activeModel={
														state.modelSelected || !weekendTask
															? demoModel
															: null
													}
													focusedSession={session}
													sessions={[session]}
													gitSummary={gitSummary}
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
											{tab === "diff" ? (
												<HeroReviewPanel ready={state.reviewReady} />
											) : null}
											{tab === "browser" ? (
												<div className="size-full overflow-y-auto bg-(--bg) px-5 py-8 text-(--fg)">
													<div className="mx-auto max-w-3xl">
														<div className="text-[length:var(--fs-lg)] font-medium text-(--dim)">
															Trip research
														</div>
														<div className="mt-1 text-[length:var(--fs-sm)] text-(--dim)">
															Saturday stays dry until 16:00. Rydal Water to
															Grasmere keeps the route under two hours.
														</div>
													</div>
												</div>
											) : null}
											{tab === "terminal" ? (
												<section className="flex min-h-0 flex-1 items-center justify-center bg-(--color-panel) text-xs text-(--dim)">
													Home shell
												</section>
											) : null}
											{tab === "side-chat" ? (
												<section className="flex min-h-0 flex-1 items-center justify-center bg-(--color-panel) text-xs text-(--dim)">
													Side chat
												</section>
											) : null}
										</aside>
									) : null}
								</div>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</section>
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
			<div data-timeline-message-id="user-1" className="pt-4 pb-0 sm:pt-6">
				<UserMessage message={userMessage()} />
			</div>
			{tools.map((tool) => (
				<div className="pt-2" key={tool.id}>
					<ToolBlockView block={tool} />
				</div>
			))}
			{output.length > 0 || resultVisible ? (
				<div data-timeline-message-id="assistant-1" className="pt-2 pb-4">
					<article className="min-w-0">
						<div className="chat-markdown whitespace-pre-wrap">{output}</div>
						{resultVisible ? (
							<AssistantMessageActions copyText={output} />
						) : null}
					</article>
				</div>
			) : running ? (
				<div className="pt-4 pb-4 sm:pt-6">
					<span className="codex-shimmer-text text-[length:var(--fs-base)] font-normal leading-5">
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
}: {
	messages: ChatMessage[];
	lead?: boolean;
}) {
	return (
		<>
			{messages.map((message, index) => (
				<div
					className={lead && index === 0 ? "pt-4 pb-0 sm:pt-6" : "pt-2 pb-4"}
					data-timeline-message-id={message.id}
					key={message.id}
				>
					{message.role === "user" ? (
						<UserMessage message={message} />
					) : (
						<article className="min-w-0">
							<div className="chat-markdown whitespace-pre-wrap">
								{message.text}
							</div>
							{message.id.startsWith("assistant-extra-") ? (
								<a
									href={LOCAL_STUDIO_REPOSITORY}
									target="_blank"
									rel="noreferrer"
									className="mt-3 flex w-full items-center justify-between rounded-lg border border-(--border) bg-(--color-panel) px-3 py-2.5 text-[length:var(--fs-sm)] font-medium text-(--fg) transition-colors hover:bg-(--hover)"
								>
									<span>Open Local Studio on GitHub</span>
									<span aria-hidden="true" className="text-(--dim)">
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
		kind: "tool",
		id: tool.id,
		name: tool.name,
		status: index < state.toolsDone ? "done" : "running",
		text: "",
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
