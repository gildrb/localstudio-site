import {
type FocusEvent,
type KeyboardEvent,
useEffect,
useRef,
useState,
} from "react";
import { useReducedMotion } from "motion/react";

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
] as const;

export function ProductStory() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const reduceMotion = useReducedMotion();
	const sectionRef = useRef<HTMLElement>(null);
	const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
	const activeFeature = features[activeIndex];

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;
		const observer = new IntersectionObserver(
			([entry]) => setIsVisible(entry.isIntersecting),
			{ threshold: 0.3 },
		);
		observer.observe(section);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!isVisible || isPaused || reduceMotion) return;
		const interval = window.setInterval(
			() => setActiveIndex((index) => (index + 1) % features.length),
			6000,
		);
		return () => window.clearInterval(interval);
	}, [activeIndex, isPaused, isVisible, reduceMotion]);

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
		let nextIndex: number | undefined;
		if (event.key === "ArrowDown" || event.key === "ArrowRight") {
			nextIndex = (index + 1) % features.length;
		} else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
			nextIndex = (index - 1 + features.length) % features.length;
		} else if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = features.length - 1;
		}
		if (nextIndex === undefined) return;
		event.preventDefault();
		setActiveIndex(nextIndex);
		buttonsRef.current[nextIndex]?.focus();
	}

	function handleBlur(event: FocusEvent<HTMLDivElement>) {
		if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
	}

	return (
		<section
			ref={sectionRef}
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
			<div
				className="story__showcase"
				onPointerEnter={() => setIsPaused(true)}
				onPointerLeave={() => setIsPaused(false)}
				onFocus={() => setIsPaused(true)}
				onBlur={handleBlur}
			>
				<ul className="story__options" aria-label="Local Studio capabilities">
					{features.map((feature, index) => {
						const selected = activeIndex === index;
						const descriptionId = `feature-description-${index + 1}`;
						return (
							<li className={selected ? "is-active" : undefined} key={feature.title}>
								<button
									ref={(button) => {
										buttonsRef.current[index] = button;
									}}
									type="button"
									aria-expanded={selected}
									aria-controls={descriptionId}
									onClick={() => setActiveIndex(index)}
									onKeyDown={(event) => handleKeyDown(event, index)}
								>
									<span className="story__option-title">{feature.title}</span>
								</button>
								<div id={descriptionId} hidden={!selected}>
									<p className="story__description">{feature.description}</p>
								</div>
							</li>
						);
					})}
				</ul>
				<figure className="story__visual" data-active-feature={activeFeature.title}>
					<img
						key={activeFeature.image}
						src={activeFeature.image}
						alt={activeFeature.alt}
						width="5118"
						height="2800"
						loading="lazy"
						decoding="async"
					/>
				</figure>
			</div>
		</section>
	);
}
