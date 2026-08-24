export {
	Activity,
	ArrowUp,
	Brain,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Cpu,
	Download,
	Eye,
	File,
	FolderTree,
	GitBranch,
	Globe2,
	MessageSquarePlus,
	Monitor,
	PanelLeftFilled,
	PanelRight,
	PanelRightFilled,
	Pause,
	Play,
	Plus,
	Search,
	Server,
	Settings,
	Smartphone,
	Sparkles,
	SquarePen,
	TerminalSquare,
	Zap,
	type LucideIcon,
} from "./ui/icon-registry";
export { CloseIcon, Folder, FolderOpen, GitBranchIcon } from "./ui/icons";
export { NavItemDesktop } from "./shell/left-sidebar-nav";
export { isRouteActive, tabs } from "./shell/left-sidebar-nav-model";
export { TokenActivityHeatmap } from "./usage/token-activity-heatmap";
export { AgentComposerTextArea } from "./workbench/agent-composer-textarea";
export { fileTone } from "./files/filesystem-tree-model";
export { AgentChatPaneHeader } from "./workbench/agent-chat-pane-header";
export { AgentComposerStatusBar } from "./workbench/agent-composer-status-bar";
export { UserMessage } from "./workbench/user-message";
export { AssistantMessageActions } from "./workbench/assistant-message-actions";
export { ToolBlockView } from "./workbench/tool-block";
export { ComputerStatusPanel } from "./workbench/computer-status-panel";


export {
	DEMO_PROMPT,
	DEMO_TOOLS,
	browserDemoClock,
	immediateDemoClock,
	demoReducer,
	finishedDemoState,
	initialDemoState,
	type DemoClock,
	type DemoAction,
	type DemoState,
} from "./scenario/sequence";
