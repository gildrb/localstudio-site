import { TextLink } from "../components/Links";

const features = [
	{
		title: "Multi-agent",
		text: "Codex, Claude, OpenCode, Pi, and Droid — all in one app. Switch between them per session, or run several in parallel.",
		image: "/images/kittylitter-feature-multi-agent.png",
		alt: "KittyLitter session switcher listing Codex, Claude, OpenCode, Pi, and Droid agents.",
	},
	{
		title: "Auto-discovery",
		text: "Finds agents running on your local network automatically. No IP addresses, no manual configuration.",
		image: "/images/kittylitter-feature-discovery.png",
		alt: "KittyLitter server list showing agents discovered on the local network.",
	},
	{
		title: "Alleycat",
		text: "Peer-to-peer pairing via QR code. Connect through NATs and corporate firewalls — no VPN, no public IP, no port forwarding.",
		image: "/images/kittylitter-feature-alleycat.png",
		alt: "KittyLitter QR pairing screen for peer-to-peer alleycat connections.",
	},
	{
		title: "SSH connections",
		text: "Connect to any remote machine over SSH. KittyLitter starts your agent on the server for you.",
		image: "/images/kittylitter-feature-ssh.png",
		alt: "KittyLitter new connection screen with an SSH address field.",
	},
	{
		title: "Voice input",
		text: "Real-time voice with your agent — transcription and conversation happen seamlessly while you walk, drive, or think.",
		image: "/images/kittylitter-feature-voice.png",
		alt: "KittyLitter voice input screen transcribing speech into an agent prompt.",
	},
	{
		title: "70+ themes",
		text: "Dozens of editor themes — Catppuccin, Dracula, Nord, Gruvbox, Solarized, and more. Dark and light.",
		image: "/images/kittylitter-feature-themes.png",
		alt: "KittyLitter theme picker showing Catppuccin, Dracula, Nord, and Gruvbox options.",
	},
	{
		title: "Sessions everywhere",
		text: "Pick up exactly where you left off. Sessions, threads, and context follow you across phone and desktop.",
		image: "/images/kittylitter-feature-sessions.png",
		alt: "KittyLitter session list continuing a desktop conversation on a phone.",
	},
	{
		title: "Open source",
		text: "The client is open source and always free. Inspect it, build it, or shape it yourself.",
		image: "/images/kittylitter-feature-open-source.png",
		alt: "KittyLitter repository page on GitHub.",
	},
] as const;

export function KittyLitter() {
	return (
		<section
			id="mobile"
			className="kitty section-width"
			aria-labelledby="kittylitter-title"
		>
			<div className="kitty__intro">
				<h2 id="kittylitter-title">Your agents, in your pocket.</h2>
				<div className="kitty__copy">
					<p>
						<span translate="no">KittyLitter</span> is a native iOS + Android
						client for <span translate="no">Codex</span>,{" "}
						<span translate="no">Claude</span>,{" "}
						<span translate="no">OpenCode</span>, <span translate="no">Pi</span>
						, and <span translate="no">Droid</span>. Connect from your local
						network, over SSH, or via <span translate="no">alleycat</span> —
						from anywhere.
					</p>
					<div className="kitty__actions">
						<TextLink href="/mobile">
							See how mobile works
						</TextLink>
						<TextLink
							href="https://kittylitter.app"
							rel="noreferrer"
						>
							<span translate="no">Get KittyLitter</span>
						</TextLink>
					</div>
				</div>
			</div>
			<div className="kitty__grid">
				{features.map((feature) => (
					<article className="kitty__feature" key={feature.title}>
						<div className="kitty__feature-media">
							<img
								src={feature.image}
								alt={feature.alt}
								width="1320"
								height="1320"
								loading="lazy"
							/>
						</div>
						<h3>{feature.title}</h3>
						<p>{feature.text}</p>
					</article>
				))}
			</div>
		</section>
	);
}
