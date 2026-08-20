import {
	FilePenLine,
	FileText,
	Globe2,
	Search,
	TerminalSquare,
	Wrench,
	type LucideIcon,
} from "../../../../ui/icon-registry";
import type { ToolKind } from "./tool-metadata";

export const TOOL_ICONS: Record<ToolKind, LucideIcon> = {
	edit: FilePenLine,
	search: Search,
	read: FileText,
	exec: TerminalSquare,
	browser: Globe2,
	generic: Wrench,
};
