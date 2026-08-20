import { ChevronDown, ChevronRight, File, Folder } from "@/ui/icon-registry";
import type { FsEntry } from "@/features/agent/filesystem-types";
import { fileTone } from "@/features/agent/ui/filesystem-tree-model";

const entries: FsEntry[] = [
	{
		name: "src",
		path: "/Users/sero/local-studio/src",
		rel: "src",
		kind: "directory",
	},
	{
		name: "health.ts",
		path: "/Users/sero/local-studio/src/proxy/health.ts",
		rel: "src/proxy/health.ts",
		kind: "file",
		size: 640,
	},
	{
		name: "standup.md",
		path: "/Users/sero/local-studio/notes/standup.md",
		rel: "notes/standup.md",
		kind: "file",
		size: 1280,
	},
	{
		name: "package.json",
		path: "/Users/sero/local-studio/package.json",
		rel: "package.json",
		kind: "file",
		size: 2140,
	},
	{
		name: "README.md",
		path: "/Users/sero/local-studio/README.md",
		rel: "README.md",
		kind: "file",
		size: 4096,
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
					local-studio
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
