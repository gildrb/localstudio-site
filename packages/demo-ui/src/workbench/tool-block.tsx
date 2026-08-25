import * as stylex from "@stylexjs/stylex";
import { styles } from "./tool-block.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import { useState } from "react";
import type { DemoToolArgs } from "../scenario/sequence";
import {
	ChevronRight,
	File,
	Globe2,
	Search,
	SquarePen,
	TerminalSquare,
	type LucideIcon,
} from "../ui/icon-registry";

type ToolStatus = "done" | "running";
type ToolKind = "edit" | "search" | "read" | "exec" | "browser" | "generic";
export type ToolBlock = {
	id: string;
	name: string;
	status: ToolStatus;
	args: DemoToolArgs;
	resultText?: string | undefined;
};

const writeTools = new Set([
	"write_file",
	"write",
	"create_file",
	"createfile",
	"edit_file",
	"editfile",
	"edit",
	"apply_patch",
	"replace_file",
]);

const toolIcons = {
	edit: SquarePen,
	search: Search,
	read: File,
	exec: TerminalSquare,
	browser: Globe2,
	generic: TerminalSquare,
} satisfies Record<ToolKind, LucideIcon>;

const toolColors = {
	edit: styles.fileTone,
	search: styles.fileTone,
	read: styles.fileTone,
	exec: styles.commandTone,
	browser: styles.sessionTone,
	generic: styles.skillTone,
};

function includesAny(value: string, needles: readonly string[]): boolean {
	return needles.some((needle) => value.includes(needle));
}
function classifyTool(name: string): ToolKind {
	const normalized = name.toLowerCase();
	if (
		writeTools.has(normalized) ||
		includesAny(normalized, ["edit", "write", "patch"])
	) {
		return "edit";
	}
	if (includesAny(normalized, ["search", "grep", "find"])) return "search";
	if (includesAny(normalized, ["read", "open", "list"])) return "read";
	if (includesAny(normalized, ["exec", "command", "shell", "run", "terminal"])) {
		return "exec";
	}
	if (includesAny(normalized, ["browser", "web", "navigate"])) return "browser";
	return "generic";
}

type ToolStringKey = "path" | "range" | "query" | "schedule" | "name";

function toolArg(block: ToolBlock, keys: readonly ToolStringKey[]): string | null {
	for (const key of keys) {
		const value = block.args;
		switch (key) {
			case "path":
				if (value.kind === "path") return value.path;
				break;
			case "range":
				if (value.kind === "path") return value.range ?? null;
				break;
			case "query":
				if (value.kind === "query") return value.query;
				break;
			case "schedule":
				if (value.kind === "schedule") return value.schedule;
				break;
			case "name":
				if (value.kind === "schedule") return value.name;
				break;
		}
	}
	return null;
}

function humanizeToolName(name: string): string {
	return name
		.replace(/^functions[._-]/, "")
		.replace(/^mcp__[a-z0-9_-]+__/i, "")
		.replace(/[_-]+/g, " ")
		.replace(/\b\w/g, (match) => match.toUpperCase());
}

function compact(value: string | null, limit = 88): string | null {
	if (!value) return null;
	const oneLine = value.replace(/\s+/g, " ").trim();
	if (oneLine.length <= limit) return oneLine;
	return `${oneLine.slice(0, limit - 1).trimEnd()}…`;
}

type ToolMeta = { verb: string; detail: string | null };

function toolMeta(block: ToolBlock): ToolMeta {
	const name = block.name.toLowerCase();
	const running = block.status === "running";
	const kind = classifyTool(name);
	const path = toolArg(block, ["path"]);
	const query = toolArg(block, ["query"]);
	switch (kind) {
		case "edit":
			return {
				verb: includesAny(name, ["create", "write"])
					? running
						? "Creating"
						: "Created"
					: running
						? "Editing"
						: "Edited",
				detail: path,
			};
		case "read":
			return { verb: running ? "Reading" : "Read", detail: path };
		case "search":
			return {
				verb: running ? "Searching" : "Searched",
				detail: compact(query) ? `for ${compact(query)}` : path,
			};
		case "exec":
			return { verb: running ? "Running" : "Ran", detail: null };
		case "browser":
			return { verb: running ? "Browsing" : "Browsed", detail: compact(query) };
		case "generic":
			return {
				verb: running ? "Calling" : "Called",
				detail: humanizeToolName(block.name),
			};
	}
}

export function ToolBlockView({ block }: { block: ToolBlock }) {
	const [userOpen, setUserOpen] = useState<boolean | null>(null);
	const open = userOpen ?? block.status === "running";
	const kind = classifyTool(block.name);
	const Icon = toolIcons[kind];
	const meta = toolMeta(block);
	return (
		<details {...stylex.props(demoStyles.reset, styles.details160)} data-tool-call={block.id} open={open}>
			<summary
				{...stylex.props(demoStyles.reset, styles.summary162)}
				onClick={(event) => {
					event.preventDefault();
					setUserOpen(!open);
				}}
			>
				<Icon {...stylex.props(demoStyles.reset, styles.icon168, styles.lucideScale)} strokeWidth={1.7} />
				<span
					{...stylex.props(demoStyles.reset, styles.toolLabel, block.status === "running" ? demoStyles.shimmerText : toolColors[kind])}
				>
					{meta.verb}
				</span>
				{meta.detail ? (
					<span {...stylex.props(demoStyles.reset, styles.span177)}>
						{meta.detail}
					</span>
				) : (
					<span {...stylex.props(demoStyles.reset, styles.span181)} />
				)}
				<ChevronRight
					{...stylex.props(demoStyles.reset, styles.chevronright184, open && styles.chevronOpen)}
					strokeWidth={1.7}
				/>
			</summary>
			{open && block.resultText ? (
				<pre {...stylex.props(demoStyles.reset, styles.pre189)}>
					{block.resultText}
				</pre>
			) : null}
		</details>
	);
}
