import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { productFeatures } from "../content/product";
import { renderInlineReact } from "../ui/prose";
import { site } from "../domain/site";
const FeatureDemo = lazy(() => import("@local-studio/demo-ui/story"));

const DEMO_PLACEHOLDER = <div className="story__demo-placeholder" aria-hidden="true" />;

function useStoryProgress() {
	const [activeIndex, setActiveIndex] = useState(0);
	const showcaseRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const showcase = showcaseRef.current;
		const sticky = showcase?.querySelector<HTMLElement>(".story__sticky");
		if (!showcase || !sticky) return;
		let updateFrame = 0;
		let measureFrame = 0;
		let showcaseTop = 0;
		let navHeight = 72;
		let scrollRange = 1;
		let scrollActive = false;
		let disposed = false;

		const update = () => {
			updateFrame = 0;
			const traveled = Math.min(
				Math.max(window.scrollY + navHeight - showcaseTop, 0),
				scrollRange,
			);
			const scenePosition = (traveled / scrollRange) * productFeatures.length;
			const nextIndex = Math.min(productFeatures.length - 1, Math.floor(scenePosition));
			setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
		};

		const measure = () => {
			measureFrame = 0;
			navHeight =
				Number.parseFloat(
					getComputedStyle(document.documentElement).getPropertyValue("--nav-height"),
				) || 72;
			const stageHeight = Math.max(1, sticky.offsetHeight);
			scrollRange = Math.max(1, showcase.offsetHeight - stageHeight);
			showcaseTop = window.scrollY + showcase.getBoundingClientRect().top;
			if (updateFrame !== 0) window.cancelAnimationFrame(updateFrame);
			update();
		};

		const scheduleUpdate = () => {
			if (updateFrame === 0) updateFrame = window.requestAnimationFrame(update);
		};
		const scheduleMeasure = () => {
			if (measureFrame === 0) measureFrame = window.requestAnimationFrame(measure);
		};

		const setScrollActive = (active: boolean) => {
			if (scrollActive === active) return;
			scrollActive = active;
			if (active) {
				window.addEventListener("scroll", scheduleUpdate, { passive: true });
				scheduleUpdate();
			} else {
				window.removeEventListener("scroll", scheduleUpdate);
			}
		};
		const sizeObserver = new ResizeObserver(scheduleMeasure);
		const visibilityObserver = new IntersectionObserver(
			(entries) => setScrollActive(entries.at(-1)?.isIntersecting ?? false),
			{ rootMargin: "100px 0px" },
		);
		sizeObserver.observe(showcase);
		sizeObserver.observe(sticky);
		visibilityObserver.observe(showcase);
		scheduleMeasure();
		window.addEventListener("resize", scheduleMeasure);
		void document.fonts.ready.then(() => {
			if (!disposed) scheduleMeasure();
		});
		return () => {
			disposed = true;
			sizeObserver.disconnect();
			visibilityObserver.disconnect();
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleMeasure);
			if (updateFrame !== 0) window.cancelAnimationFrame(updateFrame);
			if (measureFrame !== 0) window.cancelAnimationFrame(measureFrame);
		};
	}, []);

	return { activeIndex, showcaseRef };
}

export function ProductStory() {
	const { activeIndex, showcaseRef } = useStoryProgress();
	const [demoInRange, setDemoInRange] = useState(false);
	const visualRef = useRef<HTMLElement>(null);
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];
	const optionsOffset = `${(1 - activeIndex) * 20}%`;

	useEffect(() => {
		const visual = visualRef.current;
		if (!visual) return;
		const observer = new IntersectionObserver(
			(entries) => setDemoInRange(entries.at(-1)?.isIntersecting ?? false),
			{ rootMargin: "500px 0px" },
		);
		observer.observe(visual);
		return () => observer.disconnect();
	}, []);

	return (
		<section id="media" className="story section-width" aria-label={`${site.products.localStudio.name} product story`}>
				<div className="story__showcase" ref={showcaseRef}>
					<div className="story__sticky">
						<div className="story__options-window">
							<ol
								className="story__options"
								aria-label={`${site.products.localStudio.name} capabilities`}
								data-active-index={activeIndex}
								style={{ transform: `translateY(${optionsOffset})` }}
							>
								{productFeatures.map((feature, index) => {
									const selected = activeIndex === index;
									return (
										<li
											className={`story__option ${selected ? "is-active" : ""}`}
											key={feature.storyTitle}
											aria-current={selected ? "step" : undefined}
										>
											<div className="story__option-control">
												<span
													className="story__option-title"
												>
													{feature.storyTitle}
												</span>
											</div>
											<p
												className="story__description"
												aria-hidden={!selected}
											>
												{renderInlineReact(feature.storyDescription)}
											</p>
										</li>
									);
								})}
							</ol>
						</div>
						<div className="story__visual-home">
							<figure
								className="story__visual"
								ref={visualRef}
								data-active-feature={activeFeature.storyTitle}
							>
									{demoInRange ? (
										<Suspense fallback={DEMO_PLACEHOLDER}>
											<div
												className="story__demo-transition"
												key={activeFeature.slug}
											>
												<FeatureDemo scene={activeFeature.demoScene} />
											</div>
										</Suspense>
								) : (
									DEMO_PLACEHOLDER
								)}
								<p className="sr-only" role="status">
									{activeFeature.storyTitle}. {renderInlineReact(activeFeature.storyDescription)}
								</p>
							</figure>
						</div>
					</div>
					<div
						className="story__scroll-track"
						style={{
							height: `calc(${productFeatures.length + 1} * clamp(300px, 42svh, 420px))`,
						}}
						aria-hidden="true"
					/>
				</div>
		</section>
	);
}
