export type DiffPreviewLineKind =
	| "addition"
	| "context"
	| "deletion"
	| "hunk"
	| "meta";

type DiffPreviewLine = {
	content: string;
	kind: DiffPreviewLineKind;
	marker: string;
};

const rowStyles: Record<DiffPreviewLineKind, string> = {
	addition: "bg-(--ok)/[0.07]",
	context: "bg-transparent",
	deletion: "bg-(--err)/[0.065]",
	hunk: "border-y border-(--separator)/70 bg-(--fg)/[0.035] text-(--dim)",
	meta: "bg-(--fg)/[0.025] text-(--dim)/80",
};

const markerStyles: Record<DiffPreviewLineKind, string> = {
	addition: "bg-(--ok)/[0.055] text-(--ok)",
	context: "text-(--dim)/35",
	deletion: "bg-(--err)/[0.05] text-(--err)",
	hunk: "text-(--dim)/45",
	meta: "text-(--dim)/45",
};

function parseLine(line: string): DiffPreviewLine {
	if (line.startsWith("diff --git") || line.startsWith("index ")) {
		return { content: line, kind: "meta", marker: "" };
	}
	if (line.startsWith("--- ") || line.startsWith("+++ ")) {
		return { content: line.slice(4), kind: "meta", marker: line.slice(0, 3) };
	}
	if (line.startsWith("@@")) {
		return { content: line, kind: "hunk", marker: "" };
	}
	if (line.startsWith("+")) {
		return { content: line.slice(1), kind: "addition", marker: "+" };
	}
	if (line.startsWith("-")) {
		return { content: line.slice(1), kind: "deletion", marker: "−" };
	}
	if (line.startsWith(" ")) {
		return { content: line.slice(1), kind: "context", marker: "" };
	}
	return { content: line, kind: "context", marker: "" };
}

export function DiffPreview({ body }: { body: string }) {
	const lines = body.replace(/\r\n?/g, "\n").split("\n").map(parseLine);
	const additions = lines.filter((line) => line.kind === "addition").length;
	const deletions = lines.filter((line) => line.kind === "deletion").length;
	return (
		<div className="overflow-hidden rounded-md border border-(--border) bg-(--color-input)">
			<div className="flex h-7 items-center justify-between border-b border-(--separator) px-3 text-[length:var(--fs-xs)]">
				<span className="text-(--dim)">Changes</span>
				<span className="flex items-center gap-2 font-mono">
					<span className="text-(--ok)">+{additions}</span>
					<span className="text-(--err)">−{deletions}</span>
				</span>
			</div>
			<div className="max-h-[360px] overflow-y-auto overscroll-contain">
				{lines.map((line, index) => (
					<div
						key={`${index}:${line.kind}:${line.content}`}
						className={`grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] font-mono text-[length:var(--fs-sm)] leading-5 ${rowStyles[line.kind]} ${line.content ? "min-h-5" : "h-3"}`}
					>
						<span
							className={`flex select-none items-start justify-center border-r border-(--separator)/45 ${markerStyles[line.kind]}`}
						>
							{line.marker}
						</span>
						<span className="min-w-0 whitespace-pre-wrap break-words px-3 text-(--fg)/82">
							{line.content || "\u00a0"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
