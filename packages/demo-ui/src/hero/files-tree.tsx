import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./files-tree.styles.ts";
import { ChevronDown, ChevronRight, File } from "../ui/icon-registry";
import { Folder } from "../ui/icons";
import { fileTone } from "../files/filesystem-tree-model";

type FsEntry = { name: string; path: string; rel: string; kind: string; size?: number };

const entries: FsEntry[] = [
	{
		name: "Family",
		path: "/Users/sero/Home/Family",
		rel: "Family",
		kind: "directory",
	},
	{
		name: "calendar.ics",
		path: "/Users/sero/Home/Family/calendar.ics",
		rel: "Family/calendar.ics",
		kind: "file",
		size: 1840,
	},
	{
		name: "dinner-confirmation.eml",
		path: "/Users/sero/Home/Family/dinner-confirmation.eml",
		rel: "Family/dinner-confirmation.eml",
		kind: "file",
		size: 3210,
	},
	{
		name: "saved-places.md",
		path: "/Users/sero/Home/Family/saved-places.md",
		rel: "Family/saved-places.md",
		kind: "file",
		size: 980,
	},
	{
		name: "Trips",
		path: "/Users/sero/Home/Trips",
		rel: "Trips",
		kind: "directory",
	},
	{
		name: "lake-district-weekend.md",
		path: "/Users/sero/Home/Trips/lake-district-weekend.md",
		rel: "Trips/lake-district-weekend.md",
		kind: "file",
		size: 2160,
	},
];
const fileToneStyles = {
  code: styles.fileCode,
  data: styles.fileData,
  document: styles.fileDocument,
  media: styles.fileMedia,
  neutral: styles.fileNeutral,
  script: styles.fileScript,
};


export function HeroFilesystemTree({
	openFile,
	onOpenFile,
}: {
	openFile: string | null;
	onOpenFile: (rel: string) => void;
}) {
	return (
		<section {...stylex.props(demoStyles.reset, styles.section58)}>
			<div {...stylex.props(demoStyles.reset, styles.div59)}>
				<span {...stylex.props(demoStyles.reset, styles.span60)}>
					Home
				</span>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div64)}>
				{entries.map((entry) => {
					const isDir = entry.kind === "directory";
					const isActive = openFile === entry.rel;
					return (
						<div
							key={entry.path}
							{...stylex.props(demoStyles.reset, styles.treeRow, isActive ? styles.treeRowActive : styles.treeRowIdle, styles.treeIndent(isDir))}
						>
							{isActive ? (
								<span {...stylex.props(demoStyles.reset, styles.span78)} />
							) : null}
							{isDir ? (
								<span {...stylex.props(demoStyles.reset, styles.span81)}>
									<ChevronDown {...stylex.props(demoStyles.reset, styles.chevrondown82, styles.lucideScale)} />
								</span>
							) : (
								<span {...stylex.props(demoStyles.reset, styles.span81)}>
									<ChevronRight {...stylex.props(demoStyles.reset, styles.chevronright86, styles.lucideScale)} />
								</span>
							)}
							<button
								type="button"
								{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button91)}
								onClick={() => {
									if (!isDir) onOpenFile(entry.rel);
								}}
							>
								{isDir ? (
									<Folder {...stylex.props(demoStyles.reset, styles.folder97)} />
								) : (
									<File
										{...stylex.props(demoStyles.reset, styles.fileIcon, fileToneStyles[fileTone(entry.name)])}
									/>
								)}
								<span {...stylex.props(demoStyles.reset, styles.span103)}>{entry.name}</span>
							</button>
						</div>
					);
				})}
			</div>
		</section>
	);
}
