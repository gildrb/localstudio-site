import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./serve-demo.styles.ts";
import {
	Brain,
	ChevronRight,
	Download,
	Eye,
	Search,
	Server,
	Sparkles,
	Zap,
} from "../ui/icon-registry";
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
			<div {...stylex.props(demoStyles.reset, styles.div74)}>
				<header {...stylex.props(demoStyles.reset)}>
					<h3 {...stylex.props(demoStyles.reset, styles.h376)}>Models</h3>
					<p {...stylex.props(demoStyles.reset, styles.p77)}>
						Hand-picked models grouped by the hardware they need, each checked
						against this machine&apos;s memory.
					</p>
				</header>

				<nav
					{...stylex.props(demoStyles.reset, styles.nav84)}
					aria-label="Model sections"
				>
					{MODEL_TABS.map(({ label, icon: Icon }, index) => (
						<button
							key={label}
							type="button"
							aria-current={index === 0 ? "page" : undefined}
							{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.tab, index === 0 ? styles.tabActive : styles.tabIdle)}
						>
							<Icon {...stylex.props(demoStyles.reset, styles.icon94, styles.lucideScale)} />
							<span {...stylex.props(demoStyles.reset)}>{label}</span>
						</button>
					))}
				</nav>

				<div {...stylex.props(demoStyles.reset, styles.div100)}>
					<div {...stylex.props(demoStyles.reset)}>
						<span {...stylex.props(demoStyles.reset, styles.span102)}>
							64 GB unified memory
						</span>
						<span {...stylex.props(demoStyles.reset, styles.span105)}>
							Recommended for this Mac Studio
						</span>
					</div>
					<span {...stylex.props(demoStyles.reset, styles.span109)}>
						Hardware matched
					</span>
				</div>

				<section {...stylex.props(demoStyles.reset, styles.section114)}>
					<div {...stylex.props(demoStyles.reset, styles.div115)}>
						<div {...stylex.props(demoStyles.reset)}>
							<h4 {...stylex.props(demoStyles.reset, styles.h4117)}>
								Fits This Machine
							</h4>
							<p {...stylex.props(demoStyles.reset, styles.p120)}>
								Ready-to-run weights selected from the bundled model index.
							</p>
						</div>
						<button
							type="button"
							{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button126)}
						>
							<Search {...stylex.props(demoStyles.reset, styles.search128, styles.lucideScale)} /> Browse All
						</button>
					</div>

					<div {...stylex.props(demoStyles.reset, styles.div132)}>
						{FEATURED_MODELS.map((model) => {
							const owner = model.owner;
							const formats = model.formats;
							return (
								<button
									key={model.id}
									type="button"
									aria-label={`Open ${model.name} details`}
									{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.element141)}
								>
									<span {...stylex.props(demoStyles.reset, styles.span143)} />
									<span {...stylex.props(demoStyles.reset, styles.span144)}>
										<span {...stylex.props(demoStyles.reset, styles.span145)}>
											<span {...stylex.props(demoStyles.reset, styles.span146)}>
												{owner.slice(0, 1).toUpperCase()}
											</span>
											<span {...stylex.props(demoStyles.reset, styles.span149)}>
												<span {...stylex.props(demoStyles.reset, styles.span150)}>
													{owner}
												</span>
												<strong {...stylex.props(demoStyles.reset, styles.strong153)}>
													{model.name}
												</strong>
											</span>
										</span>
										<ChevronRight {...stylex.props(demoStyles.reset, styles.chevronright158, styles.lucideScale)} />
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span160)}>
										{model.description}
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span163)}>
										<span {...stylex.props(demoStyles.reset)}>{model.params}</span>
										<span {...stylex.props(demoStyles.reset)}>{Math.round(model.contextTokens / 1024)}K ctx</span>
										<span {...stylex.props(demoStyles.reset)}>{formats} formats</span>
										{model.role ? (
											<span {...stylex.props(demoStyles.reset, styles.span168)}>
												{model.role === "fast" ? (
													<Zap {...stylex.props(demoStyles.reset, styles.search128, styles.lucideScale)} />
												) : (
													<Brain {...stylex.props(demoStyles.reset, styles.search128, styles.lucideScale)} />
												)}
												{model.role}
											</span>
										) : model.multimodal ? (
											<span {...stylex.props(demoStyles.reset, styles.span168)}>
												<Eye {...stylex.props(demoStyles.reset, styles.search128, styles.lucideScale)} /> vision
											</span>
										) : null}
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span182)}>
										<Download {...stylex.props(demoStyles.reset, styles.search128, styles.lucideScale)} /> Choose weights
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
