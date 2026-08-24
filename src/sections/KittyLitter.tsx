import { assets } from "../domain/asset";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { animate } from "motion";
import { motion } from "../domain/motion";

type KittyFeature = {
	readonly title: string;
	readonly text: string;
	readonly image: string;
	readonly image2x: string;
	readonly alt: string;
};

const features = [
	{
		title: "Sessions everywhere",
		text: "Pick up exactly where you left off. Sessions, threads, and context follow you across phone and desktop.",
		image: assets.kittyIphone06,
		image2x: assets.kittyIphone06_2x,
		alt: "KittyLitter sessions continuing on an iPhone.",
	},
	{
		title: "Generative UI",
		text: "Interactive agent output stays native and usable on the phone instead of collapsing into a text transcript.",
		image: assets.kittyIphone07,
		image2x: assets.kittyIphone07_2x,
		alt: "KittyLitter generative interface running on an iPhone.",
	},
	{
		title: "Remote connections",
		text: "Connect to agents on another machine and keep the same coding workflow away from your desk.",
		image: assets.kittyIphone02,
		image2x: assets.kittyIphone02_2x,
		alt: "KittyLitter remote connection running on an iPhone.",
	},
	{
		title: "Debug anywhere",
		text: "Inspect long-running tasks, tool output, and failures without reopening the desktop workspace.",
		image: assets.kittyIphone03,
		image2x: assets.kittyIphone03_2x,
		alt: "KittyLitter debugging workflow on an iPhone.",
	},
	{
		title: "Plans",
		text: "Review and continue structured agent plans from the same mobile session.",
		image: assets.kittyIphone04,
		image2x: assets.kittyIphone04_2x,
		alt: "KittyLitter plan view on an iPhone.",
	},
	{
		title: "Voice input",
		text: "Real-time voice turns spoken context into agent prompts while you walk, drive, or think.",
		image: assets.kittyIphone05,
		image2x: assets.kittyIphone05_2x,
		alt: "KittyLitter voice input on an iPhone.",
	},
	{
		title: "Explore projects",
		text: "Browse project context and find the session or file you need from the phone.",
		image: assets.kittyIphone08,
		image2x: assets.kittyIphone08_2x,
		alt: "KittyLitter project explorer on an iPhone.",
	},
	{
		title: "Usage insights",
		text: "See session activity and usage without leaving the mobile workspace.",
		image: assets.kittyIphone09,
		image2x: assets.kittyIphone09_2x,
		alt: "KittyLitter usage statistics on an iPhone.",
	},
	{
		title: "More tools",
		text: "Keep the surrounding controls and utilities available wherever the session goes.",
		image: assets.kittyIphone10,
		image2x: assets.kittyIphone10_2x,
		alt: "Additional KittyLitter tools on an iPhone.",
	},
	{
		title: "Codex in your pocket",
		text: "Your servers and recent coding sessions stay within reach from one native mobile client.",
		image: assets.kittyIphone01,
		image2x: assets.kittyIphone01_2x,
		alt: "KittyLitter home screen on an iPhone.",
	},
] as const satisfies readonly KittyFeature[];

function FeatureCard({
	feature,
	index,
	active,
	revealed,
	reducedMotion,
	onActivate,
	onRequestVisible,
}: {
	feature: KittyFeature;
	index: number;
	active: boolean;
	revealed: boolean;
	reducedMotion: boolean;
	onActivate: (index: number | null) => void;
	onRequestVisible: (index: number) => void;
}) {
	const descriptionVisible = revealed || active;
	return (
		<article
			className="kitty__feature"
			data-active={active ? "true" : "false"}
			onMouseEnter={() => onActivate(index)}
			onMouseLeave={() => onActivate(null)}
		>
			<div
				className="kitty__feature-media"
				onClick={() => onRequestVisible(index)}
			>
				<img
					src={feature.image}
					srcSet={`${feature.image} 660w, ${feature.image2x} 1320w`}
					sizes="(max-width: 620px) calc(100vw - 48px), (max-width: 900px) 50vw, 33vw"
					alt={feature.alt}
					width="1320"
					loading="lazy"
					fetchPriority="low"
					decoding="async"
					draggable={false}
				/>
			</div>
			<div
				className="kitty__feature-body"
				onMouseEnter={() => onActivate(index)}
				onMouseLeave={() => onActivate(null)}
				onFocusCapture={() => onActivate(index)}
				onBlurCapture={(event) => {
					const next = event.relatedTarget;
					if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
						onActivate(null);
					}
				}}
				onClick={(event) => {
					const target = event.target;
					if (target instanceof Element && target.closest("a, button")) return;
					onActivate(active ? null : index);
				}}
			>
				<button
					type="button"
					className="kitty__feature-trigger"
					aria-expanded={descriptionVisible}
					onClick={(event) =>
						onActivate(event.detail === 0 && active ? null : index)
					}
				>
					{feature.title}
				</button>
				{descriptionVisible ? (
					<m.div
						className="kitty__feature-description"
						initial={
							reducedMotion
								? false
								: { opacity: 0, y: 6, filter: "blur(8px)" }
						}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={reducedMotion ? { duration: 0 } : motion.featureSwap}
					>
						<p>{feature.text}</p>
					</m.div>
				) : null}
			</div>
		</article>
	);
}

function measureCarousel(carousel: HTMLDivElement) {
	const card = carousel.querySelector<HTMLElement>(".kitty__feature");
	const grid = carousel.querySelector<HTMLElement>(".kitty__item-container");
	if (!card || !grid) return null;
	const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0;
	const stride = card.getBoundingClientRect().width + gap;
	const visible = Math.max(
		1,
		Math.floor((carousel.clientWidth + gap) / stride),
	);
	const cardCount = grid.querySelectorAll(".kitty__feature").length;
	const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
	const targets = Array.from({ length: cardCount }, (_, index) =>
		index === cardCount - 1
			? maxScroll
			: Math.min(index * stride, maxScroll),
	);
	return {
		stride,
		targets,
		visible,
	};
}

function nearestTargetIndex(targets: readonly number[], position: number) {
	let nearestIndex = 0;
	for (let index = 1; index < targets.length; index += 1) {
		if (
			Math.abs((targets[index] ?? 0) - position) <=
			Math.abs((targets[nearestIndex] ?? 0) - position)
		) {
			nearestIndex = index;
		}
	}
	return nearestIndex;
}

export function KittyLitter() {
	const [active, setActive] = useState<number | null>(null);
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [visibleFeatures, setVisibleFeatures] = useState(3);
	const carouselRef = useRef<HTMLDivElement>(null);
	const carouselAnimation = useRef<{ stop: () => void } | null>(null);
	const dragState = useRef({
		pointerId: -1,
		startX: 0,
		startScroll: 0,
		moved: false,
	});
	const reducedMotion = useReducedMotion();

	const animateToIndex = useCallback(
		(index: number) => {
			const carousel = carouselRef.current;
			if (!carousel) return;
			const metrics = measureCarousel(carousel);
			if (!metrics) return;
			const bounded = Math.min(Math.max(index, 0), metrics.targets.length - 1);
			const target = metrics.targets[bounded] ?? 0;
			carouselAnimation.current?.stop();
			if (reducedMotion || document.hidden) {
				carousel.scrollLeft = target;
				return;
			}
			carouselAnimation.current = animate(carousel.scrollLeft, target, {
				...motion.featureSwap,
				onUpdate: (value) => {
					carousel.scrollLeft = value;
				},
			});
		},
		[reducedMotion],
	);

	const syncFromScroll = useCallback((carousel: HTMLDivElement) => {
		const metrics = measureCarousel(carousel);
		if (!metrics) return;
		setVisibleFeatures(metrics.visible);
		setCarouselIndex(nearestTargetIndex(metrics.targets, carousel.scrollLeft));
	}, []);

	useLayoutEffect(() => {
		const carousel = carouselRef.current;
		if (!carousel) return;
		const syncCarousel = () => syncFromScroll(carousel);
		syncCarousel();
		const observer = new ResizeObserver(syncCarousel);
		observer.observe(carousel);
		const card = carousel.querySelector<HTMLElement>(".kitty__feature");
		if (card) observer.observe(card);
		return () => observer.disconnect();
	}, [syncFromScroll]);

	useEffect(
		() => () => {
			carouselAnimation.current?.stop();
		},
		[],
	);

	function highlightCard(index: number | null) {
		setActive(index);
	}

	function jumpToCarousel(index: number) {
		setCarouselIndex(index);
		animateToIndex(index);
	}

	return (
		<LazyMotion features={domAnimation} strict>
			<section
				id="mobile"
				className="kitty"
				aria-labelledby="kittylitter-title"
			>
				<div className="kitty__intro section-width">
					<h2 id="kittylitter-title">
						Keep the session when you leave your desk
					</h2>
				</div>
				<div
					ref={carouselRef}
					className="kitty__carousel"
					data-carousel-index={carouselIndex}
					onScroll={(event) => syncFromScroll(event.currentTarget)}
					onClickCapture={(event) => {
						if (!dragState.current.moved) return;
						event.preventDefault();
						event.stopPropagation();
						dragState.current.moved = false;
					}}
					onPointerDown={(event) => {
						if (!event.isPrimary) return;
						if (event.pointerType === "mouse" && event.button !== 0) return;
						dragState.current.moved = false;
						carouselAnimation.current?.stop();
						dragState.current = {
							pointerId: event.pointerId,
							startX: event.clientX,
							startScroll: event.currentTarget.scrollLeft,
							moved: false,
						};
						event.currentTarget.setPointerCapture(event.pointerId);
					}}
					onPointerMove={(event) => {
						if (dragState.current.pointerId !== event.pointerId) return;
						const delta = event.clientX - dragState.current.startX;
						if (Math.abs(delta) > 6) dragState.current.moved = true;
						event.currentTarget.scrollLeft =
							dragState.current.startScroll - delta;
					}}
					onPointerUp={(event) => {
						if (dragState.current.pointerId !== event.pointerId) return;
						const { moved, startX } = dragState.current;
						dragState.current.pointerId = -1;
						event.currentTarget.releasePointerCapture(event.pointerId);
						const metrics = measureCarousel(event.currentTarget);
						if (!metrics) return;
						let nextIndex = nearestTargetIndex(
							metrics.targets,
							event.currentTarget.scrollLeft,
						);
						const direction = Math.sign(startX - event.clientX);
						if (moved && direction > 0) {
							const forwardIndex = metrics.targets.findIndex(
								(target) => target >= event.currentTarget.scrollLeft,
							);
							nextIndex =
								forwardIndex === -1 ? metrics.targets.length - 1 : forwardIndex;
						} else if (moved && direction < 0) {
							for (let index = metrics.targets.length - 1; index >= 0; index -= 1) {
								if ((metrics.targets[index] ?? 0) <= event.currentTarget.scrollLeft) {
									nextIndex = index;
									break;
								}
							}
						}
						animateToIndex(nextIndex);
					}}
					onPointerCancel={(event) => {
						if (dragState.current.pointerId !== event.pointerId) return;
						dragState.current.pointerId = -1;
						dragState.current.moved = false;
						const metrics = measureCarousel(event.currentTarget);
						if (!metrics) return;
						animateToIndex(
							nearestTargetIndex(metrics.targets, event.currentTarget.scrollLeft),
						);
					}}
				>
					<div className="kitty__item-container">
						{features.map((feature, index) => (
							<FeatureCard
								feature={feature}
								index={index}
								active={active === index}
								revealed={index < carouselIndex + visibleFeatures}
								reducedMotion={reducedMotion ?? false}
								onActivate={highlightCard}
								onRequestVisible={(requested) => {
									let next = carouselIndex;
									if (requested < carouselIndex) next = requested;
									if (requested >= carouselIndex + visibleFeatures) {
										next = requested - visibleFeatures + 1;
									}
									if (next !== carouselIndex) jumpToCarousel(next);
								}}
								key={feature.title}
							/>
						))}
					</div>
				</div>
			</section>
		</LazyMotion>
	);
}
