import { TextLink } from "../components/Links";

type KittyFeature = {
	readonly title: string;
	readonly text: string;
	readonly image: string;
	readonly alt: string;
}

const features = [
	{
		title: "Multi-agent",
		text: "Codex, Claude, OpenCode, Pi, and Droid, all in one app. Switch between them per session, or run several in parallel.",
		image: "/images/kittylitter-feature-multi-agent.png",
		alt: "KittyLitter conversation with a Codex model picker and an interactive widget.",
	},
	{
		title: "Auto-discovery",
		text: "Finds agents running on your local network automatically. No IP addresses, no manual configuration.",
		image: "/images/kittylitter-feature-discovery.png",
		alt: "KittyLitter home listing recent sessions and two connected servers.",
	},
	{
		title: "Alleycat",
		text: "Peer-to-peer pairing via QR code. Connect through NATs and corporate firewalls. No VPN, no public IP, no port forwarding.",
		image: "/images/kittylitter-feature-alleycat.png",
		alt: "KittyLitter remote session running over a cat wallpaper.",
	},
	{
		title: "SSH connections",
		text: "Connect to any remote machine over SSH. KittyLitter starts your agent on the server for you.",
		image: "/images/kittylitter-feature-ssh.png",
		alt: "KittyLitter remote session on a development machine, with a second phone showing the server list.",
	},
	{
		title: "Voice input",
		text: "Real-time voice with your agent. Transcription and conversation happen seamlessly while you walk, drive, or think.",
		image: "/images/kittylitter-feature-voice.png",
		alt: "KittyLitter realtime voice session with Codex speaking.",
	},
	{
		title: "70+ themes",
		text: "Dozens of editor themes: Catppuccin, Dracula, Nord, Gruvbox, Solarized, and more. Dark and light.",
		image: "/images/kittylitter-feature-themes.png",
		alt: "KittyLitter session info in a light theme, with wallpaper and conversation stats.",
	},
	{
		title: "Sessions everywhere",
		text: "Pick up exactly where you left off. Sessions, threads, and context follow you across phone and desktop.",
		image: "/images/kittylitter-feature-sessions.png",
		alt: "KittyLitter session history on a studio server, with a live session card.",
	},
	{
		title: "Open source",
		text: "The client is open source and always free. Inspect it, build it, or shape it yourself.",
		image: "/images/kittylitter-feature-open-source.png",
		alt: "KittyLitter feature list with Always free. No ads.",
	},
] as const satisfies readonly KittyFeature[];

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
						network, over SSH, or via <span translate="no">alleycat</span>,
						from anywhere.
					</p>
					<div className="kitty__actions">
						<TextLink href="/mobile">See how mobile works</TextLink>
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
								draggable={false}
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
