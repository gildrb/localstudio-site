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

export function HeroFilesystemTree({
	openFile,
	onOpenFile,
}: {
	openFile: string | null;
	onOpenFile: (rel: string) => void;
}) {
	return (
		<section className="flex min-h-0 flex-1 flex-col">
			<div className="flex h-9 shrink-0 items-center gap-0.5 overflow-x-auto px-2 text-[length:var(--fs-sm)] text-(--dim)">
				<span className="shrink-0 rounded-md px-1.5 text-(--dim)">
					Home
				</span>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">
				{entries.map((entry) => {
					const isDir = entry.kind === "directory";
					const isActive = openFile === entry.rel;
					return (
						<div
							key={entry.path}
							className={`relative flex w-full items-center gap-1 rounded-sm py-0.5 text-left text-[length:var(--fs-sm)] hover:bg-(--hover) ${isActive ? "bg-(--color-selected) font-medium text-(--fg)" : "text-(--dim)"}`}
							style={{
								paddingLeft: isDir ? "8px" : "20px",
								paddingRight: "8px",
							}}
						>
							{isActive ? (
								<span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-(--link)" />
							) : null}
							{isDir ? (
								<span className="flex h-3 w-3 shrink-0 items-center justify-center">
									<ChevronDown className="h-3 w-3" />
								</span>
							) : (
								<span className="flex h-3 w-3 shrink-0 items-center justify-center">
									<ChevronRight className="h-3 w-3 opacity-0" />
								</span>
							)}
							<button
								type="button"
								className="flex min-w-0 flex-1 items-center gap-1 text-left"
								onClick={() => {
									if (!isDir) onOpenFile(entry.rel);
								}}
							>
								{isDir ? (
									<Folder className="h-3.5 w-3.5 shrink-0 text-(--dim)" />
								) : (
									<File
										className={`h-3.5 w-3.5 shrink-0 ${fileTone(entry.name)}`}
									/>
								)}
								<span className="flex-1 truncate">{entry.name}</span>
							</button>
						</div>
					);
				})}
			</div>
		</section>
	);
}
