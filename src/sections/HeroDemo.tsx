import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUp, ChevronDown, Plus } from "@/ui/icon-registry";
import { AgentChatPaneHeader } from "@/features/agent/ui/agent-chat-pane-header";
import { AgentComposerStatusBar } from "@/features/agent/ui/agent-composer-status-bar";
import { AgentComposerTextArea } from "@/features/agent/ui/agent-composer-textarea";
import { ComputerStatusPanel } from "@/features/agent/ui/computer-status-panel";
import { AssistantMessageActions } from "@/features/agent/ui/timeline/assistant-message-actions";
import { ToolBlockView } from "@/features/agent/ui/timeline/tool-block-view";
import { UserMessage } from "@/features/agent/ui/timeline/user-message-block";
import type { ComputerTab } from "@/features/agent/tools/types";
import type { ChatMessage, ToolBlock } from "@/features/agent/messages";
import type { AgentModel } from "@/features/agent/models";
import type { Project } from "@/features/agent/projects/types";
import type { Session } from "@/features/agent/runtime/types";
import {
	DEMO_MODEL,
	DEMO_PROMPT,
	DEMO_RESULT,
	DEMO_TOOL,
	DEMO_TOOL_PATH,
	demoDelay,
	demoOutput,
	demoReducer,
	demoStatus,
	finishedDemoState,
	initialDemoState,
	type DemoState,
} from "../demo/sequence";
import { ComputerHeader, ComputerLauncherPanel } from "./hero/computer-header";
import { HeroDesktopSidebar } from "./hero/desktop-sidebar";
import { HeroFilesystemTree } from "./hero/files-tree";

const contextWindow = 202144;
const HERO_COMPUTER_WIDTH = 320;

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
	id: "local-studio",
	name: "local-studio",
	path: "/Users/sero/local-studio",
	addedAt: "2026-08-01",
	exists: true,
	hasGit: true,
	branch: "main",
};

const gitSummary = {
	isRepo: true,
	branch: "main",
	additions: 4,
	deletions: 1,
	statusCount: 3,
} as const;

const emptyTerminals = { owners: [], activeOwnerKey: null };

function ignore(): void {}

export function HeroDemo() {
	const reduceMotion = useReducedMotion() === true;
	const [state, dispatch] = useReducer(
		demoReducer,
		reduceMotion ? finishedDemoState : initialDemoState,
	);
	const [tab, setTab] = useState<ComputerTab>("status");
	const [openTabs, setOpenTabs] = useState<ComputerTab[]>(["status"]);
	const [panelOpen, setPanelOpen] = useState(true);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const prompt = DEMO_PROMPT.slice(0, state.promptChars);
	const submitted = state.phase !== "prompt";
	const output = demoOutput(state);
	const running = submitted && !state.resultVisible && state.phase !== "done";
	const tool = toolBlockFor(state);
	const session = demoSession(state, submitted);

	useEffect(() => {
		if (reduceMotion) {
			dispatch({ type: "finish" });
			return;
		}
		if (!state.playing || state.phase === "done") return;
		const id = window.setTimeout(() => {
			dispatch({ type: "advance" });
		}, demoDelay(state));
		return () => {
			window.clearTimeout(id);
		};
	}, [reduceMotion, state]);

	function selectTab(next: ComputerTab): void {
		setPanelOpen(true);
		setTab(next);
		setOpenTabs((current) =>
			current.includes(next) ? current : [...current, next],
		);
	}

	function closeTab(closing: ComputerTab): void {
		if (closing === "status") return;
		setOpenTabs((current) => current.filter((item) => item !== closing));
		if (tab === closing) setTab("status");
	}

	return (
		<section
			className="demo ls-app"
			data-theme="zai-dark"
			data-phase={state.phase}
			aria-label="Local Studio workbench"
		>
			<p className="sr-only" role="status">
				{demoStatus(state)}
			</p>
			<div className="flex h-[620px] min-h-0 w-full overflow-hidden max-md:h-[460px]">
				<HeroDesktopSidebar />
				<main
					data-no-topbar="true"
					className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-(--agent-bg)"
				>
					<div className="agent-workspace flex h-full min-h-0 w-full flex-col text-(--fg)">
						<div className="agent-workspace-panel-row relative flex min-h-0 flex-1">
							<section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-(--agent-bg) shadow-[inset_1px_0_rgba(255,255,255,0.015)]">
								<AgentChatPaneHeader
									title="Standup notes"
									pinned={false}
									rightPanelOpen={panelOpen}
									canFork={false}
									canClose={false}
									onTogglePinned={ignore}
									onRename={ignore}
									onToggleRightPanel={() => setPanelOpen((open) => !open)}
								/>
								{submitted ? (
									<div className="agent-timeline-frame relative flex min-h-0 min-w-0 flex-1">
										<div
											data-timeline-scroller
											className="agent-chat-scroller min-h-0 min-w-0 flex-1 overflow-y-auto bg-(--agent-bg) px-4 pb-0 pt-2 [overflow-anchor:auto] [overscroll-behavior:contain] [scrollbar-gutter:stable] sm:px-5"
										>
											<div
												data-timeline-list
												className="agent-thread-shell mx-auto flex flex-col"
											>
												<div
													data-timeline-message-id="user-1"
													className="pt-4 pb-0 sm:pt-6"
												>
													<UserMessage message={userMessage()} />
												</div>
												{tool ? (
													<div className="pt-2">
														<ToolBlockView block={tool} />
													</div>
												) : null}
												{state.streamChars > 0 || state.resultVisible ? (
													<div
														data-timeline-message-id="assistant-1"
														className="pt-2 pb-4"
													>
														<article className="min-w-0">
															<div className="chat-markdown whitespace-pre-wrap">
																{output}
															</div>
															{state.resultVisible ? (
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
									onSubmit={(event: FormEvent) => event.preventDefault()}
									className="relative z-[100] shrink-0 bg-transparent px-3 pb-2 pt-0 sm:px-5"
								>
									<div className="agent-composer-box relative z-10 mx-auto w-full max-w-[calc(var(--composer-w)*0.9)] overflow-visible rounded-[var(--composer-radius)] border border-(--border) bg-(--composer) shadow-[var(--composer-elevation)] backdrop-blur-lg [corner-shape:superellipse(1.5)] sm:w-[90%]">
										<AgentComposerTextArea
											inputRef={inputRef}
											value={submitted ? "" : prompt}
											onPaste={(event) => event.preventDefault()}
											onChange={ignore}
											onKeyDown={(event) => event.preventDefault()}
											placeholder={
												submitted ? "Ask for follow-up changes" : "Do anything"
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
													className="group/model inline-flex !h-[30px] !min-h-[30px] !min-w-0 max-w-full items-center justify-between gap-1 rounded-lg bg-transparent pl-2 pr-1.5 text-[length:var(--fs-base)] whitespace-nowrap text-(--fg)/85 transition-colors hover:bg-(--hover) hover:text-(--fg)"
													aria-label={`Model: ${state.modelSelected ? DEMO_MODEL : "Select model"}`}
												>
													<span
														className="min-w-0 max-w-[180px] truncate text-left"
														translate="no"
													>
														{state.modelSelected ? DEMO_MODEL : "Select model"}
													</span>
													<ChevronDown className="pointer-events-none h-3.5 w-3.5 shrink-0 text-(--dim)" />
												</button>
												<button
													type="submit"
													disabled={!submitted && prompt.length === 0}
													className="inline-flex !h-[30px] !min-h-[30px] !w-[30px] !min-w-[30px] shrink-0 items-center justify-center rounded-full bg-(--fg) text-(--bg) transition-opacity hover:opacity-85 disabled:bg-(--hl3) disabled:opacity-100"
													aria-label="Send"
													title="Send (Enter)"
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
										currentContextTokens={state.resultVisible ? 2400 : 0}
										contextWindow={contextWindow}
										onOpenStatus={() => selectTab("status")}
										onOpenDiff={ignore}
									/>
								</form>
							</section>
							{panelOpen ? (
								<aside
									className="agent-computer-panel relative hidden min-h-0 shrink-0 flex-col border-l border-(--border) bg-(--color-panel) md:flex"
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
											activeModel={state.modelSelected ? demoModel : null}
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
											openFile={state.toolStarted ? DEMO_TOOL_PATH : null}
										/>
									) : null}
									{tab === "browser" ? (
										<div className="size-full overflow-y-auto bg-(--bg) px-5 py-8 text-(--fg)">
											<div className="mx-auto max-w-3xl">
												<div className="text-[length:var(--fs-lg)] font-medium text-(--dim)">
													Local
												</div>
												<div className="mt-1 text-[length:var(--fs-sm)] text-(--dim)">
													Pick a running localhost app, or type a URL/search
													above.
												</div>
											</div>
										</div>
									) : null}
									{tab === "terminal" ? (
										<section className="flex min-h-0 flex-1 items-center justify-center bg-(--color-panel) text-xs text-(--dim)">
											Project shell
										</section>
									) : null}
									{tab === "side-chat" || tab === "diff" ? (
										<section className="flex min-h-0 flex-1 items-center justify-center bg-(--color-panel) text-xs text-(--dim)">
											{tab === "diff"
												? "Diff, commit, push, and PR"
												: "Side chat"}
										</section>
									) : null}
								</aside>
							) : null}
						</div>
					</div>
				</main>
			</div>
		</section>
	);
}

function userMessage(): ChatMessage {
	return { id: "user-1", role: "user", text: DEMO_PROMPT };
}

function toolBlockFor(state: DemoState): ToolBlock | null {
	if (!state.toolStarted) return null;
	return {
		kind: "tool",
		id: "tool-1",
		name: DEMO_TOOL,
		status: state.toolDone ? "done" : "running",
		text: "",
		args: { path: DEMO_TOOL_PATH },
		resultText: state.toolDone ? DEMO_RESULT : undefined,
	};
}

function demoSession(state: DemoState, submitted: boolean): Session {
	return {
		id: "session-1",
		piSessionId: "pi-demo",
		projectId: demoProject.id,
		cwd: demoProject.path,
		modelId: demoModel.id,
		title: "Standup notes",
		messages: submitted ? [userMessage()] : [],
		status:
			state.phase === "load"
				? "starting"
				: state.toolDone
					? "idle"
					: submitted
						? "running"
						: "idle",
		error: "",
		input: "",
		tokenStats: { read: 1800, write: 600, current: submitted ? 2400 : 0 },
		contextUsage: { tokens: submitted ? 2400 : 0, percent: 1 },
	};
}
