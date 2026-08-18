import { ArrowDown, Laptop, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import { StoreButtons } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

type CopyBlock = readonly [title: string, body: ReactNode];

const steps = [
	[
		"Open the connection",
		<>
			In <span translate="no">Local Studio</span>, open Settings, choose Profile
			&amp; phone, and find Connect your phone.
		</>,
	],
	[
		"Scan it in KittyLitter",
		<>
			Open <span translate="no">KittyLitter</span>’s server scanner, choose
			<span translate="no">Local Studio</span>, and scan the QR code. Copy
			connection JSON is the fallback when scanning is unavailable.
		</>,
	],
	[
		"Continue the same work",
		<>
			Open the <span translate="no">Local Studio</span> server in
			<span translate="no">KittyLitter</span>. Existing sessions appear there;
			new phone turns return to the same session on your Mac.
		</>,
	],
] as const satisfies readonly CopyBlock[];

const capabilities = [
	[
		"One session list",
		<>
			Start on desktop, continue on mobile, then return to
			<span translate="no">Local Studio</span> without creating a disconnected
			copy.
		</>,
	],
	[
		"The complete timeline",
		"Stream assistant content, reasoning, tool calls, and tool results in their original order.",
	],
	[
		"Work stays on the Mac",
		<>
			The agent runtime and filesystem operations run through
			<span translate="no">Local Studio</span> on your Mac. This website never
			receives your sessions or files.
		</>,
	],
] as const satisfies readonly CopyBlock[];

const security = [
	"The public screenshots use permanently redacted QR images.",
	"Local bridge requests are signed and replay-protected.",
	"This page has no form, tracker, or pairing upload endpoint.",
];

const container = "mx-auto w-[min(1399px,calc(100%_-_48px))]";
const section = `${container} page-section border-t border-white/10 py-30 max-[900px]:py-16`;
const sectionHeader =
	"grid grid-cols-[minmax(0,1fr)_minmax(280px,.55fr)] items-end gap-20 max-[900px]:grid-cols-1 max-[900px]:gap-4";
const prose = "text-base/6 text-white/70";

export function MobilePage() {
	return (
		<PageShell>
			<PageIntro
				id="mobile-title"
				layout="split"
				title="Your local agents, away from your desk."
				description={
					<>
						Pair <span translate="no">KittyLitter</span> once, then read and
						continue the same <span translate="no">Local Studio</span> sessions
						from your phone. The work still runs on your Mac.
					</>
				}
				actions={<StoreButtons />}
				aside={
					<div className="grid rounded-3xl border border-white/15 p-3">
						<div className="flex min-h-28 items-center gap-4 rounded-xl border border-white/10 p-6">
							<span className="grid size-11 place-items-center rounded-full border border-white/15">
								<Smartphone size={20} aria-hidden="true" />
							</span>
							<span className="grid gap-1">
								<strong>
									<span translate="no">KittyLitter</span>
								</strong>
								<small className="text-white/50">Your trusted phone</small>
							</span>
						</div>
						<div className="flex min-h-20 items-center justify-center gap-3 font-mono text-sm/5 text-white/50">
							<span>Authenticated connection</span>
							<ArrowDown size={18} aria-hidden="true" />
						</div>
						<div className="flex min-h-28 items-center gap-4 rounded-xl border border-white/10 p-6">
							<span className="grid size-11 place-items-center rounded-full border border-white/15">
								<Laptop size={20} aria-hidden="true" />
							</span>
							<span className="grid gap-1">
								<strong>
									<span translate="no">Local Studio</span>
								</strong>
								<small className="text-white/50">Your Mac and agents</small>
							</span>
						</div>
						<p className="m-4 text-center text-sm/5 text-white/50">
							Same sessions. Same runtime. No pairing data sent to this website.
						</p>
					</div>
				}
			>
				<ul className="page-intro__requirements">
					<li>
						<span translate="no">Local Studio</span> 2.9.0 or newer on macOS
					</li>
					<li>
						<span translate="no">KittyLitter</span> 1.6.0 or newer on iPhone,
						iPad, or Android
					</li>
					<li>
						<span translate="no">Local Studio</span> running and your Mac
						reachable
					</li>
				</ul>
			</PageIntro>
			<section
				className={`${container} page-section pb-30`}
				aria-labelledby="pair-title"
			>
				<div className={sectionHeader}>
					<h2 id="pair-title">3 steps, no server setup.</h2>
					<p className={prose}>
						<span translate="no">Local Studio</span> creates the connection.{" "}
						<span translate="no">KittyLitter</span> saves it securely so you do
						not need to scan again every time.
					</p>
				</div>
				<ol className="mt-16 grid grid-cols-3 border border-white/10 p-0 max-[900px]:grid-cols-1">
					{steps.map(([title, text]) => (
						<li
							className="min-h-64 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0"
							key={title}
						>
							<h3>{title}</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</li>
					))}
				</ol>
			</section>
			<section className={section} aria-labelledby="runtime-title">
				<div className={sectionHeader}>
					<h2 id="runtime-title">A window into the same runtime.</h2>
					<p className={prose}>
						<span translate="no">KittyLitter</span> is not a separate cloud copy
						of <span translate="no">Local Studio</span>. It connects to the
						controller and agent runtime you already use.
					</p>
				</div>
				<div className="mt-16 grid grid-cols-3 border border-white/10 max-[900px]:grid-cols-1">
					{capabilities.map(([title, text]) => (
						<article
							className="min-h-64 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0"
							key={title}
						>
							<h3>{title}</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</article>
					))}
				</div>
			</section>
			<section className={section} aria-labelledby="security-title">
				<div className={sectionHeader}>
					<h2 id="security-title">Treat the pairing code like a password.</h2>
					<p className={prose}>
						The QR code and copied connection JSON contain a private controller
						credential. Scan only with a device you trust.
					</p>
				</div>
				<ul className="mt-16 grid border border-white/10 p-0 text-base/6 text-white/70">
					{security.map((item, index) => (
						<li
							className="flex gap-4 border-b border-white/10 p-4 last:border-b-0"
							key={item}
						>
							<span className="font-mono text-sm/6 text-white/40">
								{String(index + 1).padStart(2, "0")}
							</span>
							{item}
						</li>
					))}
				</ul>
			</section>
			<section
				className={`${container} page-cta mobile-cta`}
				aria-labelledby="mobile-cta-title"
			>
				<div>
					<h2 id="mobile-cta-title">Take the session with you.</h2>
					<div className="hero__actions">
						<StoreButtons />
					</div>
				</div>
			</section>
		</PageShell>
	);
}
