import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./diff-preview.styles.ts";
export type DiffPreviewLineKind =
	| "addition"
	| "context"
	| "deletion"
	| "hunk"
	| "meta";

type DiffPreviewLine = {
	content: string;
	id: string;
	kind: DiffPreviewLineKind;
	marker: string;
};

const rowStyles = {
	addition: styles.rowAddition,
	context: styles.rowContext,
	deletion: styles.rowDeletion,
	hunk: styles.rowHunk,
	meta: styles.rowMeta,
};

const markerStyles = {
	addition: styles.markerAddition,
	context: styles.markerContext,
	deletion: styles.markerDeletion,
	hunk: styles.markerHunk,
	meta: styles.markerMeta,
};

function parseLine(line: string): Omit<DiffPreviewLine, "id"> {
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
	const sources = body.replace(/\r\n?/g, "\n").split("\n");
	const lines = sources.map((source, position) => ({
		...parseLine(source),
		id: `${source}:${sources.slice(0, position).filter((candidate) => candidate === source).length}`,
	}));
	const additions = lines.filter((line) => line.kind === "addition").length;
	const deletions = lines.filter((line) => line.kind === "deletion").length;
	return (
		<div {...stylex.props(demoStyles.reset, styles.div62)}>
			<div {...stylex.props(demoStyles.reset, styles.div63)}>
				<span {...stylex.props(demoStyles.reset, styles.span64)}>Changes</span>
				<span {...stylex.props(demoStyles.reset, styles.span65)}>
					<span {...stylex.props(demoStyles.reset, styles.span66)}>+{additions}</span>
					<span {...stylex.props(demoStyles.reset, styles.span67)}>−{deletions}</span>
				</span>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div70)}>
				{lines.map((line) => (
					<div
						key={line.id}
						{...stylex.props(demoStyles.reset, styles.row, rowStyles[line.kind], line.content ? styles.lineTall : styles.lineShort)}
					>
						<span
							{...stylex.props(demoStyles.reset, styles.marker, markerStyles[line.kind])}
						>
							{line.marker}
						</span>
						<span {...stylex.props(demoStyles.reset, styles.span81)}>
							{line.content || "\u00a0"}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
