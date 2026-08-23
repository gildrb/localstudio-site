import {
	Brain,
	ChevronRight,
	Download,
	Eye,
	Search,
	Server,
	Sparkles,
	Zap,
} from "@local-studio/demo-ui";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

const MODEL_TABS = [
	{ label: "Recommended", icon: Sparkles },
	{ label: "Search Hugging Face", icon: Search },
	{ label: "Your servers", icon: Server },
	{ label: "Downloads", icon: Download },
] as const;

type FeaturedModel = {
	id: string;
	name: string;
	owner: string;
	role: string | null;
	description: string;
	params: string;
	contextTokens: number;
	multimodal: boolean;
	formats: number;
};
const FEATURED_MODELS: FeaturedModel[] = [
	{
		id: "qwen3.5-9b",
		name: "Qwen3.5-9B",
		owner: "Qwen",
		role: null,
		description:
			"Dense 9B with vision encoder, hybrid Gated DeltaNet/attention, 262K context",
		params: "9B dense",
		contextTokens: 262144,
		multimodal: true,
		formats: 4,
	},
	{
		id: "gemma-4-e2b",
		name: "Gemma 4 E2B",
		owner: "Google",
		role: null,
		description:
			"2.3B effective multimodal (text+image+audio in) with 128K context",
		params: "5.1B total / 2.3B effective",
		contextTokens: 131072,
		multimodal: true,
		formats: 4,
	},
	{
		id: "gemma-4-26b-a4b",
		name: "Gemma 4 26B A4B",
		owner: "Google",
		role: "fast",
		description:
			"Multimodal MoE with only 3.8B active params — 3–5× faster decode than dense picks",
		params: "25.2B total MoE",
		contextTokens: 262144,
		multimodal: true,
		formats: 4,
	},
];

export function ServeDemo() {
	return (
		<DemoShell scene="serve" label="Models" crop={STORY_CROP}>
			<div className="min-h-0 w-[820px] overflow-hidden px-6 py-6 max-md:w-[680px] max-md:px-5 max-md:py-5">
				<header>
					<h3 className="text-[length:var(--fs-2xl)] font-medium">Models</h3>
					<p className="mt-1 text-[length:var(--fs-sm)] text-(--ui-muted)">
						Hand-picked models grouped by the hardware they need, each checked
						against this machine&apos;s memory.
					</p>
				</header>

				<nav
					className="mt-5 flex border-b border-(--ui-separator)"
					aria-label="Model sections"
				>
					{MODEL_TABS.map(({ label, icon: Icon }, index) => (
						<button
							key={label}
							type="button"
							aria-current={index === 0 ? "page" : undefined}
							className={`flex h-9 items-center gap-2 border-b px-4 text-[length:var(--fs-xs)] ${index === 0 ? "border-(--ui-fg) text-(--ui-fg)" : "border-transparent text-(--ui-muted)"}`}
						>
							<Icon className="h-3.5 w-3.5" />
							<span>{label}</span>
						</button>
					))}
				</nav>

				<div className="mt-5 flex items-center justify-between border-b border-(--ui-separator) pb-3">
					<div>
						<span className="text-[length:var(--fs-md)] font-medium">
							64 GB unified memory
						</span>
						<span className="ml-2 text-[length:var(--fs-sm)] text-(--ui-muted)">
							Recommended for this Mac Studio
						</span>
					</div>
					<span className="rounded-full bg-(--ui-accent)/12 px-2.5 py-1 text-[length:var(--fs-xs)] text-(--ui-accent)">
						Hardware matched
					</span>
				</div>

				<section className="mt-5">
					<div className="flex items-end justify-between gap-4">
						<div>
							<h4 className="text-[length:var(--fs-lg)] font-medium">
								Fits this machine
							</h4>
							<p className="mt-0.5 text-[length:var(--fs-xs)] text-(--ui-muted)">
								Ready-to-run weights selected from the bundled model index.
							</p>
						</div>
						<button
							type="button"
							className="inline-flex h-7 items-center gap-1.5 rounded-md border border-(--ui-border) px-2.5 text-[length:var(--fs-xs)]"
						>
							<Search className="h-3 w-3" /> Browse all
						</button>
					</div>

					<div className="mt-3 grid grid-cols-3 gap-3">
						{FEATURED_MODELS.map((model) => {
							const owner = model.owner;
							const formats = model.formats;
							return (
								<button
									key={model.id}
									type="button"
									aria-label={`Open ${model.name} details`}
									className="group relative min-h-44 overflow-hidden rounded-xl border border-(--ui-border) bg-(--ui-surface) p-4 text-left transition-colors hover:bg-(--ui-hover)"
								>
									<span className="absolute inset-y-0 left-0 w-0.5 bg-(--ui-accent) opacity-80" />
									<span className="flex items-start justify-between gap-2">
										<span className="flex min-w-0 items-center gap-2.5">
											<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--ui-border) bg-(--ui-active) text-[length:var(--fs-xs)] font-semibold">
												{owner.slice(0, 1).toUpperCase()}
											</span>
											<span className="min-w-0">
												<span className="block text-[length:var(--fs-2xs)] font-medium uppercase tracking-[0.12em] text-(--ui-muted)">
													{owner}
												</span>
												<strong className="mt-0.5 block truncate text-[length:var(--fs-base)] font-medium">
													{model.name}
												</strong>
											</span>
										</span>
										<ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-(--ui-muted)" />
									</span>
									<span className="mt-3 line-clamp-2 block text-[length:var(--fs-xs)] leading-4 text-(--ui-muted)">
										{model.description}
									</span>
									<span className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[length:var(--fs-2xs)] text-(--ui-muted)">
										<span>{model.params}</span>
										<span>{Math.round(model.contextTokens / 1024)}K ctx</span>
										<span>{formats} formats</span>
										{model.role ? (
											<span className="ml-auto inline-flex items-center gap-1 font-sans font-medium">
												{model.role === "fast" ? (
													<Zap className="h-3 w-3" />
												) : (
													<Brain className="h-3 w-3" />
												)}
												{model.role}
											</span>
										) : model.multimodal ? (
											<span className="ml-auto inline-flex items-center gap-1 font-sans font-medium">
												<Eye className="h-3 w-3" /> vision
											</span>
										) : null}
									</span>
									<span className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-md bg-(--ui-fg) px-2.5 text-[length:var(--fs-xs)] text-(--ui-bg)">
										<Download className="h-3 w-3" /> Choose weights
									</span>
								</button>
							);
						})}
					</div>
				</section>
			</div>
		</DemoShell>
	);
}
