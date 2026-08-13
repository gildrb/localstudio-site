const features = [
	{
		title: "Control",
		description:
			"Local and remote controllers, live status, launch state, logs, and metrics.",
		image: "/images/usage-proxy.png",
		alt: "Local Studio usage screen showing proxied tokens, requests, sessions, active days, and token activity.",
	},
	{
		title: "Serve",
		description:
			"vLLM, SGLang, MLX, and llama.cpp behind one OpenAI-compatible surface.",
		image: "/images/configure-models.png",
		alt: "Local Studio model configuration screen showing searchable Hugging Face models, hardware fit, and downloads.",
	},
	{
		title: "Work",
		description:
			"Models, providers, browser, files, terminal, and agents in the same session.",
		image: "/images/workbench-terminal.png",
		alt: "Local Studio workbench with agent reasoning, terminal output, repository changes, and tool activity.",
	},
];

export function ProductStory() {
	return (
		<section
			id="media"
			className="story section-width"
			aria-labelledby="system-title"
		>
			<div className="story__intro">
				<h2 id="system-title">Local AI is hard, this will make it easier.</h2>
				<p>
					Local Studio keeps the model, the runtime, and the hardware together.
					Nothing important disappears behind a provider abstraction.
				</p>
			</div>
			<div className="feature-list">
				{features.map((feature) => (
					<article className="feature" key={feature.title}>
						<div className="feature__copy">
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</div>
						<div className="feature__visual">
							<img
								src={feature.image}
								alt={feature.alt}
								width="5118"
								height="2800"
								loading="lazy"
							/>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
