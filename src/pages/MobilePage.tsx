import { DownloadButton, TextLink } from "../components/Links";
import { PageShell } from "../components/PageShell";

const steps = [
	[
		"01",
		"Open the connection",
		"In Local Studio, open Settings, choose Profile & phone, and find Connect your phone.",
	],
	[
		"02",
		"Scan it in KittyLitter",
		"Open KittyLitter's server scanner, choose Local Studio, and scan the QR code. Copy connection JSON is the fallback when scanning is unavailable.",
	],
	[
		"03",
		"Continue the same work",
		"Open the Local Studio server in KittyLitter. Existing sessions appear there; new phone turns return to the same session on your Mac.",
	],
];

const capabilities = [
	[
		"One session list",
		"Start on desktop, continue on mobile, then return to Local Studio without creating a disconnected copy.",
	],
	[
		"The complete timeline",
		"Stream assistant content, reasoning, tool calls, and tool results in their original order.",
	],
	[
		"Work stays on the Mac",
		"The agent runtime and filesystem operations run through Local Studio on your Mac. This website never receives your sessions or files.",
	],
];

const container =
	"mx-auto w-[min(1240px,calc(100%_-_48px))] max-[620px]:w-[calc(100%_-_24px)]";
const sectionTitle =
	"mt-4 max-w-3xl text-[40px]/[48px] font-medium tracking-[-0.02em] max-[620px]:text-[32px]/[40px]";
const prose = "text-base/6 text-white/70";

export function MobilePage() {
	return (
		<PageShell
			footerLeft="Local Studio × KittyLitter"
			footerRight="Private controller access from a trusted device."
		>
			<section
				className={`${container} grid min-h-[calc(100svh_-_72px)] grid-cols-[minmax(0,1.08fr)_minmax(360px,.72fr)] items-center gap-20 py-28 max-[900px]:grid-cols-1 max-[900px]:gap-16 max-[620px]:py-20`}
				aria-labelledby="mobile-title"
			>
				<div>
					<p className="kicker">Local Studio × KittyLitter</p>
					<h1
						id="mobile-title"
						className="mt-6 max-w-3xl text-[64px]/[64px] font-medium tracking-[-0.02em] max-[620px]:text-[40px]/[44px]"
					>
						Your local agents, away from your desk.
					</h1>
					<p className={`mt-8 max-w-2xl ${prose}`}>
						Pair KittyLitter once, then read and continue the same Local Studio
						sessions from your phone. The work still runs on your Mac.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-6">
						<DownloadButton />
						<TextLink
							href="https://kittylitter.app"
							target="_blank"
							rel="noreferrer"
						>
							Get KittyLitter
						</TextLink>
					</div>
					<ul className="mt-8 flex flex-wrap gap-2 p-0 text-xs/5 text-white/70">
						<li className="rounded-full border border-white/10 px-3 py-2">
							Local Studio 2.9.0 or newer on macOS
						</li>
						<li className="rounded-full border border-white/10 px-3 py-2">
							KittyLitter 1.6.0 or newer on iPhone, iPad, or Android
						</li>
						<li className="rounded-full border border-white/10 px-3 py-2">
							Local Studio running and your Mac reachable
						</li>
					</ul>
				</div>
				<div className="grid rounded-2xl border border-white/15 p-3">
					<div className="flex min-h-28 items-center gap-4 rounded-xl border border-white/10 p-6">
						<span className="grid size-11 place-items-center rounded-full border border-white/15">
							▯
						</span>
						<span className="grid gap-1">
							<strong>KittyLitter</strong>
							<small className="text-white/50">Your trusted phone</small>
						</span>
					</div>
					<div className="flex min-h-20 items-center justify-center gap-3 font-mono text-xs uppercase tracking-widest text-white/50">
						<span>Authenticated connection</span>
						<span aria-hidden="true">↓</span>
					</div>
					<div className="flex min-h-28 items-center gap-4 rounded-xl border border-white/10 p-6">
						<span className="grid size-11 place-items-center rounded-full border border-white/15">
							⌑
						</span>
						<span className="grid gap-1">
							<strong>Local Studio</strong>
							<small className="text-white/50">Your Mac and agents</small>
						</span>
					</div>
					<p className="m-4 text-center text-sm/5 text-white/50">
						Same sessions. Same runtime. No pairing data sent to this website.
					</p>
				</div>
			</section>

			<section
				className={`${container} border-t border-white/10 py-30`}
				aria-labelledby="pair-title"
			>
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-8">
					<div>
						<p className="kicker">Pair once</p>
						<h2 id="pair-title" className={sectionTitle}>
							Three steps, no server setup.
						</h2>
					</div>
					<p className={prose}>
						Local Studio creates the connection. KittyLitter saves it securely
						so you do not need to scan again every time.
					</p>
				</div>
				<ol className="mt-16 grid grid-cols-3 border border-white/10 p-0 max-[900px]:grid-cols-1">
					{steps.map(([number, title, text]) => (
						<li
							className="min-h-72 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0"
							key={number}
						>
							<span className="font-mono text-xs text-white/50">{number}</span>
							<h3 className="mt-16 text-[19px]/7 font-medium max-[900px]:mt-8">
								{title}
							</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</li>
					))}
				</ol>
			</section>

			<section
				className={`${container} border-t border-white/10 py-30`}
				aria-labelledby="runtime-title"
			>
				<div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-8">
					<div>
						<p className="kicker">What carries across</p>
						<h2 id="runtime-title" className={sectionTitle}>
							A window into the same runtime.
						</h2>
					</div>
					<p className={prose}>
						KittyLitter is not a separate cloud copy of Local Studio. It
						connects to the controller and agent runtime you already use.
					</p>
				</div>
				<div className="mt-16 grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
					{capabilities.map(([title, text]) => (
						<article
							className="min-h-64 border-t border-white/20 p-8"
							key={title}
						>
							<h3 className="text-[19px]/7 font-medium">{title}</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</article>
					))}
				</div>
			</section>

			<section
				className={`${container} grid grid-cols-[200px_minmax(0,1fr)] gap-24 border-t border-white/10 py-30 max-[900px]:grid-cols-1 max-[900px]:gap-12`}
				aria-labelledby="security-title"
			>
				<div
					className="grid size-32 place-items-center rounded-full border border-white/20 text-3xl ring-20 ring-white/3"
					aria-hidden="true"
				>
					◇
				</div>
				<div>
					<p className="kicker">Security boundary</p>
					<h2 id="security-title" className={sectionTitle}>
						Treat the pairing code like a password.
					</h2>
					<p className={`mt-8 max-w-3xl ${prose}`}>
						The QR code and copied connection JSON contain a private controller
						credential. They grant access to every agent enabled on that
						controller—not only Local Studio. Scan only with a device you trust.
						Never post, email, record, or paste the code into support chat.
					</p>
					<ul className="mt-8 grid max-w-3xl gap-4 p-0 text-sm/5 text-white/70">
						<li>The public screenshots use permanently redacted QR images.</li>
						<li>Local bridge requests are signed and replay-protected.</li>
						<li>This page has no form, tracker, or pairing upload endpoint.</li>
					</ul>
				</div>
			</section>

			<section
				className={`${container} min-h-[620px] border-t border-white/10 py-30 text-center`}
				aria-labelledby="mobile-cta-title"
			>
				<p className="kicker">Ready when both apps are current</p>
				<h2 id="mobile-cta-title" className={`${sectionTitle} mx-auto`}>
					Take the session with you.
				</h2>
				<div className="mt-10 flex flex-wrap justify-center gap-6">
					<DownloadButton />
					<TextLink
						href="https://kittylitter.app"
						target="_blank"
						rel="noreferrer"
					>
						Open kittylitter.app
					</TextLink>
				</div>
			</section>
		</PageShell>
	);
}
