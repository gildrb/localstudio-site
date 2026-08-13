import { TextLink } from "../components/Links";
const captures = [
	{
		mode: "Light",
		image: "/images/kittylitter-connect-light.png",
		alt: "Local Studio phone connection screen in light mode with a KittyLitter iPhone capture covering the private pairing code.",
	},
	{
		mode: "Dark",
		image: "/images/kittylitter-connect-dark.png",
		alt: "Local Studio phone connection screen in dark mode with a KittyLitter iPhone capture covering the private pairing code.",
	},
];

export function KittyLitter() {
	return (
		<section
			id="mobile"
			className="kitty section-width"
			aria-labelledby="kittylitter-title"
		>
			<div className="kitty__intro">
				<div>
					<p className="kicker">KittyLitter</p>
					<h2 id="kittylitter-title">Your agents, in your pocket.</h2>
				</div>
				<div className="kitty__copy">
					<p>
						Pair your phone from Local Studio, then keep working with Codex,
						Claude, OpenCode, Pi, and Droid from anywhere.
					</p>
					<TextLink href="/mobile" arrow="right">
						See how mobile works
					</TextLink>
					<TextLink
						href="https://kittylitter.app"
						target="_blank"
						rel="noreferrer"
					>
						Get KittyLitter
					</TextLink>
				</div>
			</div>
			<div className="kitty__gallery">
				{captures.map((capture) => (
					<div className="kitty-card" key={capture.mode}>
						<figure>
							<figcaption>{capture.mode}</figcaption>
							<img
								src={capture.image}
								alt={capture.alt}
								width="948"
								height="768"
								loading="lazy"
							/>
							<span className="phone-cover" aria-hidden="true">
								<img
									src="/images/kittylitter-iphone.jpeg"
									alt=""
									width="1447"
									height="768"
									loading="lazy"
								/>
							</span>
						</figure>
					</div>
				))}
			</div>
		</section>
	);
}
