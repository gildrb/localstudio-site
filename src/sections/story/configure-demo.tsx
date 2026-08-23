import { Cpu, Monitor, Plus, Server, SquarePen } from "@local-studio/demo-ui";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

const MACHINES = [
	{
		name: "Mac Studio",
		description: "Apple silicon · studio.local",
		accelerator: "M3 Ultra · 64 GB unified memory",
		system: "256 GB RAM · 32 cores",
		status: "this machine",
	},
	{
		name: "Inference node",
		description: "Linux · gpu-node.local",
		accelerator: "2× NVIDIA RTX 4090 · 48 GB VRAM",
		system: "128 GB RAM · 24 cores",
		status: "worker",
	},
] as const;

export function ConfigureDemo() {
	return (
		<DemoShell scene="configure" label="Configure machines" crop={STORY_CROP}>
			<div className="min-h-0 w-[820px] overflow-hidden px-6 py-6 max-md:w-[680px] max-md:px-5 max-md:py-5">
				<header>
					<h3 className="text-[length:var(--fs-2xl)] font-medium">Configure</h3>
					<nav
						className="mt-5 flex border-b border-(--ui-separator)"
						aria-label="Configure sections"
					>
						<button
							type="button"
							aria-current="page"
							className="flex h-9 items-center gap-2 border-b border-(--ui-fg) px-4 text-[length:var(--fs-sm)]"
						>
							<Monitor className="h-3.5 w-3.5" /> Machines
						</button>
						<button
							type="button"
							className="flex h-9 items-center gap-2 border-b border-transparent px-4 text-[length:var(--fs-sm)] text-(--ui-muted)"
						>
							<Server className="h-3.5 w-3.5" /> Server
						</button>
					</nav>
				</header>

				<section className="mt-6 overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-surface)">
					<header className="flex items-center justify-between gap-4 border-b border-(--ui-border) px-4 py-3">
						<div>
							<h4 className="text-[length:var(--fs-md)] font-medium">
								Your machines
							</h4>
							<p className="mt-0.5 text-[length:var(--fs-xs)] text-(--ui-muted)">
								Hardware available to this controller for local and distributed
								serves.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="rounded-full bg-(--ui-accent)/12 px-2.5 py-1 text-[length:var(--fs-xs)] text-(--ui-accent)">
								2 machines · 112 GB GPU
							</span>
							<button
								type="button"
								className="inline-flex h-7 items-center gap-1 rounded-md bg-(--ui-fg) px-2.5 text-[length:var(--fs-xs)] text-(--ui-bg)"
							>
								<Plus className="h-3 w-3" /> Add
							</button>
						</div>
					</header>

					<div className="divide-y divide-(--ui-separator)">
						{MACHINES.map((machine, index) => (
							<button
								key={machine.name}
								type="button"
								className="grid w-full grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left hover:bg-(--ui-hover)"
							>
								<span className="flex min-w-0 items-center gap-3">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--ui-border) bg-(--ui-active)">
										{index === 0 ? (
											<Monitor className="h-4 w-4" />
										) : (
											<Server className="h-4 w-4" />
										)}
									</span>
									<span className="min-w-0">
										<strong className="block truncate text-[length:var(--fs-sm)] font-medium">
											{machine.name}
										</strong>
										<span className="mt-0.5 block truncate text-[length:var(--fs-xs)] text-(--ui-muted)">
											{machine.description}
										</span>
									</span>
								</span>
								<span className="min-w-0">
									<strong className="block truncate font-mono text-[length:var(--fs-xs)] font-normal">
										{machine.accelerator}
									</strong>
									<span className="mt-0.5 block truncate font-mono text-[length:var(--fs-2xs)] text-(--ui-muted)">
										{machine.system}
									</span>
								</span>
								<span className="flex items-center gap-2">
									<span
										className={`rounded-full px-2 py-1 text-[length:var(--fs-2xs)] ${index === 0 ? "bg-(--ui-accent)/12 text-(--ui-accent)" : "bg-(--ui-active) text-(--ui-muted)"}`}
									>
										{machine.status}
									</span>
									<SquarePen className="h-3.5 w-3.5 text-(--ui-muted)" />
								</span>
							</button>
						))}
					</div>
				</section>

				<section className="mt-5 overflow-hidden rounded-lg border border-(--ui-border) bg-(--ui-surface)">
					<header className="flex items-center justify-between border-b border-(--ui-border) px-4 py-3">
						<div>
							<h4 className="text-[length:var(--fs-md)] font-medium">
								Distributed serve pool
							</h4>
							<p className="mt-0.5 text-[length:var(--fs-xs)] text-(--ui-muted)">
								Both machines can cooperate on models that exceed a single node.
							</p>
						</div>
						<span className="rounded-full bg-(--ui-accent)/12 px-2.5 py-1 text-[length:var(--fs-xs)] text-(--ui-accent)">
							Ready
						</span>
					</header>
					<div className="grid grid-cols-3 divide-x divide-(--ui-separator)">
						<div className="px-4 py-3">
							<span className="flex items-center gap-1.5 text-[length:var(--fs-xs)] text-(--ui-muted)">
								<Cpu className="h-3 w-3" /> Capacity
							</span>
							<strong className="mt-1 block text-[length:var(--fs-md)] font-medium">
								112 GB
							</strong>
						</div>
						<div className="px-4 py-3">
							<span className="text-[length:var(--fs-xs)] text-(--ui-muted)">
								Controller
							</span>
							<strong className="mt-1 block truncate font-mono text-[length:var(--fs-xs)] font-normal">
								studio.local:49300
							</strong>
						</div>
						<div className="px-4 py-3">
							<span className="text-[length:var(--fs-xs)] text-(--ui-muted)">
								Placement
							</span>
							<strong className="mt-1 block text-[length:var(--fs-sm)] font-medium">
								Automatic
							</strong>
						</div>
					</div>
				</section>
			</div>
		</DemoShell>
	);
}
