import setupPrompt from "../content/setup-prompt.txt?raw";
import { CopyButton } from "../components/CopyButton";
import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";

const handoff = [
	[
		"01",
		"Copy",
		"Use the entire prompt without trimming the verification phases.",
	],
	[
		"02",
		"Paste",
		"Give it to a coding model that can operate a terminal on the target machine.",
	],
	[
		"03",
		"Verify",
		"Do not accept completion until health, model launch, and inference all pass.",
	],
];

export function PromptPage() {
	return (
		<PageShell
			footerLeft="Local Studio setup"
			footerRight="Portable agent prompt"
		>
			<section
				className="mx-auto w-[min(1040px,calc(100%_-_48px))] py-28 max-[620px]:w-[calc(100%_-_24px)] max-[620px]:py-20"
				aria-labelledby="prompt-title"
			>
				<header className="mx-auto max-w-3xl text-center">
					<p className="kicker">Universal setup prompt</p>
					<h1
						id="prompt-title"
						className="mt-6 text-[64px]/[64px] font-medium tracking-[-0.02em] max-[620px]:text-[40px]/[44px]"
					>
						Give this to any coding model.
					</h1>
					<p className="mt-8 text-[19px]/7 text-white/70">
						It will inspect the machine, choose the right runtime, install Local
						Studio, and prove a real inference request works.
					</p>
				</header>

				<section
					className="mt-20 overflow-hidden rounded-2xl border border-white/15"
					aria-label="Portable setup prompt"
				>
					<div className="flex items-center justify-between gap-6 border-b border-white/10 p-5 max-[620px]:items-start">
						<div>
							<strong className="font-mono text-sm/5">
								local-studio / setup
							</strong>
							<small className="mt-1 block text-sm/5 text-white/50">
								Portable agent prompt
							</small>
						</div>
						<CopyButton label="Copy prompt" text={setupPrompt} />
					</div>
					<pre className="max-h-[660px] overflow-auto whitespace-pre-wrap p-8 font-mono text-sm/6 text-white/80 max-[620px]:p-5">
						<code>{setupPrompt}</code>
					</pre>
				</section>

				<ol className="mt-20 grid grid-cols-3 border-y border-white/10 p-0 max-[900px]:grid-cols-1">
					{handoff.map(([number, title, text]) => (
						<li
							className="grid grid-cols-[auto_auto_1fr] gap-6 py-6 pr-8 text-sm/5 max-[900px]:grid-cols-[auto_1fr] max-[900px]:pr-0"
							key={number}
						>
							<span className="font-mono text-white/50">{number}</span>
							<strong>{title}</strong>
							<p className="m-0 text-white/70 max-[900px]:col-span-2">{text}</p>
						</li>
					))}
				</ol>

				<nav
					className="mt-20 flex justify-between gap-8 border-t border-white/10 pt-8 text-sm/5 text-white/60"
					aria-label="Setup prompt links"
				>
					<LocalLink href="/">← Back to Local Studio</LocalLink>
					<LocalLink
						href="https://github.com/sybil-solutions/local-studio"
						target="_blank"
						rel="noreferrer"
					>
						Repository ↗
					</LocalLink>
				</nav>
			</section>
		</PageShell>
	);
}
