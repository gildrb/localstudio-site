import setupPrompt from "../content/setup-prompt.txt?raw";
import { CopyButton } from "../components/CopyButton";
import { DownloadButton, TextLink } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

const handoff = [
	["Copy", "Use the entire prompt without trimming the verification phases."],
	[
		"Paste",
		"Give it to a coding model that can operate a terminal on the target machine.",
	],
	[
		"Verify",
		"Do not accept completion until health, model launch, and inference all pass.",
	],
];

export function PromptPage() {
	return (
		<PageShell>
			<PageIntro
				id="prompt-title"
				layout="left"
				title="Give this to any coding model."
				description="It will inspect the machine, choose the right runtime, install Local Studio, and prove a real inference request works."
				actions={
					<div className="button-group">
						<DownloadButton />
						<TextLink href="/docs">Read the docs</TextLink>
					</div>
				}
			/>
			<section className="section-width pb-30" aria-label="Setup handoff">
				<section
					className="overflow-hidden rounded-2xl border border-white/15"
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
					<pre className="max-h-[660px] overflow-auto whitespace-pre-wrap p-8 font-mono text-sm/5 text-white/80 max-[620px]:p-5">
						<code>{setupPrompt}</code>
					</pre>
				</section>

				<ol className="mt-20 grid grid-cols-3 border-y border-white/10 p-0 max-[900px]:grid-cols-1">
					{handoff.map(([title, text]) => (
						<li
							className="grid gap-4 py-6 pr-8 text-base/6 max-[900px]:pr-0"
							key={title}
						>
							<strong>{title}</strong>
							<p className="m-0 text-white/70 max-[900px]:col-span-2">{text}</p>
						</li>
					))}
				</ol>

				<nav
					className="mt-20 flex justify-between gap-8 border-t border-white/10 pt-8 text-base/6 text-white/60"
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
