import { useState } from "react";
import {
	ChevronRight,
	File,
	Globe2,
	Search,
	SquarePen,
	TerminalSquare,
	type LucideIcon,
} from "..";

type ToolStatus = "done" | "running";
type ToolKind = "edit" | "search" | "read" | "exec" | "browser" | "generic";

type ToolBlock = {
	id: string;
	name: string;
	status: ToolStatus;
	args: Record<string, unknown>;
	resultText?: string | undefined;
};

const writeTools: Record<string, true> = {
	write_file: true,
	write: true,
	create_file: true,
	createfile: true,
	edit_file: true,
	editfile: true,
	edit: true,
	apply_patch: true,
	replace_file: true,
};

const toolIcons: Record<ToolKind, LucideIcon> = {
	edit: SquarePen,
	search: Search,
	read: File,
	exec: TerminalSquare,
	browser: Globe2,
	generic: TerminalSquare,
};

const toolColors: Record<ToolKind, string> = {
	edit: "text-(--color-file-node-foreground)",
	search: "text-(--color-file-node-foreground)",
	read: "text-(--color-file-node-foreground)",
	exec: "text-(--color-command-node-foreground)",
	browser: "text-(--color-session-node-foreground)",
	generic: "text-(--color-skill-node-foreground)",
};

function includesAny(value: string, needles: string[]): boolean {
	return needles.some((needle) => value.includes(needle));
}
function classifyTool(name: string): ToolKind {
	const normalized = name.toLowerCase();
	if (
		writeTools[normalized] ||
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

function toolArg(block: ToolBlock, keys: string[]): string | null {
	for (const key of keys) {
		const value = block.args[key];
		if (typeof value === "string") return value;
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

function toolMeta(block: ToolBlock): { verb: string; detail: string | null } {
	const name = block.name.toLowerCase();
	const running = block.status === "running";
	const kind = classifyTool(name);
	const path = toolArg(block, ["path", "file_path", "file", "filename"]);
	const query = toolArg(block, ["query", "q", "pattern", "search"]);
	const command = toolArg(block, ["cmd", "command", "script", "shell"]);
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
			return { verb: running ? "Running" : "Ran", detail: compact(command) };
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
		<details className="group min-w-0" data-tool-call={block.id} open={open}>
			<summary
				className="flex min-h-6 min-w-0 cursor-pointer list-none items-center gap-2 rounded-md px-1.5 py-0.5 transition-colors hover:bg-(--hover) [&::-webkit-details-marker]:hidden"
				onClick={(event) => {
					event.preventDefault();
					setUserOpen(!open);
				}}
			>
				<Icon className="h-3.5 w-3.5 shrink-0 text-(--dim)/65" strokeWidth={1.7} />
				<span
					className={`shrink-0 text-[length:var(--fs-base)] font-normal leading-5 ${
						block.status === "running" ? "codex-shimmer-text" : toolColors[kind]
					}`}
				>
					{meta.verb}
				</span>
				{meta.detail ? (
					<span className="min-w-0 flex-1 truncate font-mono text-[length:var(--codex-chat-code-font-size)] leading-5 text-(--hl2)">
						{meta.detail}
					</span>
				) : (
					<span className="min-w-0 flex-1" />
				)}
				<ChevronRight
					className="h-3.5 w-3.5 shrink-0 text-(--dim)/55 transition-transform group-open:rotate-90"
					strokeWidth={1.7}
				/>
			</summary>
			{open && block.resultText ? (
				<pre className="mb-1.5 ml-7 mt-1 max-h-[340px] max-w-full overflow-auto whitespace-pre-wrap break-words rounded-md border border-(--border) bg-(--color-input) px-3 py-2.5 font-mono text-[length:var(--fs-sm)] leading-[1.6] text-(--fg)/65">
					{block.resultText}
				</pre>
			) : null}
		</details>
	);
}
