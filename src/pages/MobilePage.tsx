import { ArrowDown, Laptop, Shield, Smartphone } from "lucide-react";
import { DownloadButton, TextLink } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

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
] as const;

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
] as const;

const container = "mx-auto w-[min(1240px,calc(100%_-_48px))]";
const sectionTitle = "max-w-3xl";
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
				actions={
					<div className="button-group">
						<DownloadButton iconSize={17} />
						<TextLink
							href="https://kittylitter.app"
							arrow="up"
							target="_blank"
							rel="noreferrer"
						>
							<span translate="no">Get KittyLitter</span>
						</TextLink>
					</div>
				}
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
				className={`${container} mobile-section pt-30 max-[900px]:pt-20`}
				aria-labelledby="pair-title"
			>
				<div className="max-w-3xl">
					<h2 id="pair-title" className={sectionTitle}>
						3 steps, no server setup.
					</h2>
					<p className={`mt-6 ${prose}`}>
						<span translate="no">Local Studio</span> creates the connection.
						<span translate="no">KittyLitter</span> saves it securely so you do
						not need to scan again every time.
					</p>
				</div>
				<ol className="mt-16 grid grid-cols-3 border border-white/10 p-0 max-[900px]:grid-cols-1 max-[620px]:mt-12 max-[620px]:rounded-xl">
					{steps.map(([title, text]) => (
						<li
							className="min-h-72 border-r border-white/10 p-8 last:border-r-0 max-[900px]:min-h-0 max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0 max-[620px]:p-6"
							key={title}
						>
							<h3>{title}</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</li>
					))}
				</ol>
			</section>
			<section
				className={`${container} mobile-section pt-30 max-[900px]:pt-20`}
				aria-labelledby="runtime-title"
			>
				<div className="max-w-3xl">
					<h2 id="runtime-title" className={sectionTitle}>
						A window into the same runtime.
					</h2>
					<p className={`mt-6 ${prose}`}>
						<span translate="no">KittyLitter</span> is not a separate cloud copy
						of
						<span translate="no">Local Studio</span>. It connects to the
						controller and agent runtime you already use.
					</p>
				</div>
				<div className="mt-16 grid grid-cols-3 gap-6 max-[900px]:grid-cols-1 max-[620px]:mt-12 max-[620px]:gap-0">
					{capabilities.map(([title, text]) => (
						<article
							className="min-h-64 border-t border-white/20 p-8 max-[620px]:min-h-0 max-[620px]:px-0 max-[620px]:py-8"
							key={title}
						>
							<h3>{title}</h3>
							<p className={`mt-4 ${prose}`}>{text}</p>
						</article>
					))}
				</div>
			</section>
			<section
				className={`${container} mobile-section pt-30 max-[900px]:pt-20`}
				aria-labelledby="security-title"
			>
				<div className="max-w-3xl">
					<h2 id="security-title" className={sectionTitle}>
						Treat the pairing code like a password.
					</h2>
					<p className={`mt-6 ${prose}`}>
						The QR code and copied connection JSON contain a private controller
						credential. They grant access to every agent enabled on that
						controller—not only <span translate="no">Local Studio</span>. Scan
						only with a device you trust. Never post, email, record, or paste
						the code into support chat.
					</p>
				</div>
				<div className="mt-16 grid grid-cols-[minmax(0,1fr)_200px] items-center gap-24 max-[900px]:grid-cols-1 max-[900px]:gap-12 max-[620px]:mt-12">
					<ul className="grid max-w-3xl gap-4 p-0 text-base/6 text-white/70">
						<li>The public screenshots use permanently redacted QR images.</li>
						<li>Local bridge requests are signed and replay-protected.</li>
						<li>This page has no form, tracker, or pairing upload endpoint.</li>
					</ul>
					<div
						className="grid size-32 justify-self-end place-items-center rounded-full border border-white/20 ring-20 ring-white/3 max-[900px]:justify-self-start max-[620px]:size-24 max-[620px]:ring-12"
						aria-hidden="true"
					>
						<Shield size={32} strokeWidth={1.5} />
					</div>
				</div>
			</section>
			<section
				className={`${container} page-cta mobile-cta`}
				aria-labelledby="mobile-cta-title"
			>
				<div>
					<h2 id="mobile-cta-title">Take the session with you.</h2>
					<div className="hero__actions">
						<div className="button-group">
							<DownloadButton iconSize={17} />
							<TextLink
								href="https://kittylitter.app"
								arrow="up"
								target="_blank"
								rel="noreferrer"
							>
								Open kittylitter.app
							</TextLink>
						</div>
					</div>
				</div>
			</section>
		</PageShell>
	);
}
