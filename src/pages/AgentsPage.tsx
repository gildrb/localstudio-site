import instructions from "../content/agent-instructions.txt?raw";
import probes from "../content/agent-probes.txt?raw";
import { DownloadButton } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";

const scope = [
	"Controllers stay saved; switching is non-destructive.",
	"Provider keys live in controller config, not prompts.",
	"provider/model routes to that provider.",
	"Default model names hit the active backend.",
	"Pi sessions load selected skills and local tools.",
];

const capabilities = [
	["Controllers", "Lifecycle, logs, metrics, recipes, provider config, proxy."],
	["Providers", "OpenAI-compatible upstreams addressed as provider/model."],
	["Pi agents", "Skills, project context, browser, files, terminal."],
];

export function AgentsPage() {
	return (
		<PageShell footerLeft="Agent setup page" footerRight="Controllers, providers, runtimes, Pi">
			<section className="mx-auto w-[min(1240px,calc(100%_-_48px))] py-20 max-[620px]:w-[calc(100%_-_24px)]" aria-labelledby="agents-title">
				<header className="max-w-3xl"><p className="kicker">Agent field note</p><h1 id="agents-title" className="mt-5 text-[64px]/[64px] font-medium tracking-[-0.02em] max-[620px]:text-[40px]/[44px]">Set up the stack.</h1><p className="mt-6 text-[19px]/7 text-white/70">A compact DLTL for controllers, providers, runtimes, and Pi.</p><div className="mt-8 flex flex-wrap gap-4"><DownloadButton /><LocalLink className="inline-flex min-h-10 items-center rounded-md border border-white/10 px-4 text-sm" href="/">Back to overview</LocalLink></div></header>

				<div className="mt-16 grid grid-cols-[minmax(240px,.72fr)_minmax(0,1.28fr)] items-start gap-10 max-[900px]:grid-cols-1">
					<aside className="grid gap-8"><section><h2 className="text-[28px]/9 font-medium">Scope</h2><p className="mt-4 text-base/6 text-white/70">Multi-controller. Multi-provider. Runtime-aware. Local-tool aware.</p><ul className="mt-6 grid border border-white/10 p-0 text-sm/5 text-white/70">{scope.map(item => <li className="border-b border-white/10 p-4 last:border-b-0" key={item}>○ &nbsp; {item}</li>)}</ul></section><section><h3 className="text-[19px]/7 font-medium">Useful probes</h3><pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 p-5 font-mono text-sm/5 text-white/80">{probes}</pre></section></aside>
					<section className="min-w-0 overflow-hidden rounded-lg border border-white/10" aria-labelledby="instructions-title"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h2 id="instructions-title" className="kicker">Agent instructions</h2><span className="rounded-full border border-white/10 px-2 py-1 font-mono text-xs text-white/50">DLTL</span></div><pre className="max-h-[1320px] overflow-auto whitespace-pre-wrap p-6 font-mono text-sm/6 text-white/80">{instructions}</pre></section>
				</div>
			</section>

			<section className="mx-auto w-[min(1240px,calc(100%_-_48px))] border-t border-white/10 py-30 max-[620px]:w-[calc(100%_-_24px)]" aria-labelledby="agents-media-title">
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-8"><div><p className="kicker">Where to look</p><h2 id="agents-media-title" className="mt-4 text-[40px]/[48px] font-medium tracking-[-0.02em] max-[620px]:text-[32px]/10">Runtime. Agent. Models.</h2></div><p className="text-base/6 text-white/70">The setup path is visible in the app.</p></div>
				<div className="mt-16 grid grid-cols-[1.12fr_.72fr] gap-5 max-[900px]:grid-cols-1"><figure className="overflow-hidden rounded-xl border border-white/10"><figcaption className="flex justify-between px-4 py-3 text-sm"><strong>Workbench</strong><span className="text-white/50">live app capture</span></figcaption><img className="block h-auto w-full" src="/images/workbench-browser.png" alt="Local Studio workbench with a coding agent and integrated browser." width="5118" height="2800" loading="lazy" decoding="async" /></figure><div className="grid gap-5"><figure className="overflow-hidden rounded-xl border border-white/10"><figcaption className="flex justify-between px-4 py-3 text-sm"><strong>Tools</strong><span className="text-white/50">live app capture</span></figcaption><img className="block h-auto w-full" src="/images/workbench-terminal.png" alt="Local Studio workbench showing terminal and agent tool activity." width="5118" height="2800" loading="lazy" decoding="async" /></figure><figure className="overflow-hidden rounded-xl border border-white/10"><figcaption className="flex justify-between px-4 py-3 text-sm"><strong>Configure</strong><span className="text-white/50">live app capture</span></figcaption><img className="block h-auto w-full" src="/images/configure-models.png" alt="Local Studio model configuration screen." width="5118" height="2800" loading="lazy" decoding="async" /></figure></div></div>
				<div className="mt-20 grid grid-cols-3 border border-white/10 max-[900px]:grid-cols-1">{capabilities.map(([title, text]) => <article className="min-h-56 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0" key={title}><h3 className="text-[19px]/7 font-medium">{title}</h3><p className="mt-4 text-base/6 text-white/70">{text}</p></article>)}</div>
			</section>
		</PageShell>
	);
}
