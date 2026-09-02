import * as stylex from "@stylexjs/stylex";
import { lazy, Suspense } from "react";
import { productFeatures } from "../content/product";
import { site } from "../domain/site";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { renderInlineReact } from "../ui/prose";
import { useBufferedStoryScenes } from "./use-buffered-story-scenes";
import { useProductStoryMotion } from "./use-product-story-motion";

const FeatureDemo = lazy(() => import("@local-studio/demo-ui/story"));

const DEMO_PLACEHOLDER = (
	<div {...stylex.props(baseStyles.element, styles.storyDemoPlaceholder)} aria-hidden="true" />
);

export function ProductStory() {
	const {
		activeIndex,
		getLayerRef,
		getOptionRef,
		inRange,
		optionsRef,
		reducedMotion,
		showcaseRef,
	} = useProductStoryMotion(productFeatures.length);
	const activeFeature = productFeatures[activeIndex] ?? productFeatures[0];
	const optionsOffset = `${(1 - activeIndex) * 20}%`;
	const mountedSceneIndexes = useBufferedStoryScenes(
		activeIndex,
		productFeatures.length,
		inRange,
		reducedMotion,
	);

	return (
		<section
			id="media"
			{...stylex.props(
				baseStyles.element,
				baseStyles.sectionAnchor,
				styles.sectionWidth,
				styles.story,
			)}
			aria-label={`${site.products.localStudio.name} product story`}
		>
			<div {...stylex.props(baseStyles.element, styles.storyShowcase)} ref={showcaseRef}>
				<div {...stylex.props(baseStyles.element, styles.storySticky)} data-story-sticky="">
					<div {...stylex.props(baseStyles.element, styles.storyOptionsWindow)}>
						<ol
							{...stylex.props(
								baseStyles.list,
								baseStyles.element,
								styles.storyOptions,
								styles.storyOptionsOffset(optionsOffset),
							)}
							ref={optionsRef}
							aria-label={`${site.products.localStudio.name} capabilities`}
							data-active-index={activeIndex}
						>
							{productFeatures.map((feature, index) => {
								const selected = activeIndex === index;
								return (
									<li
										{...stylex.props(
											baseStyles.element,
											styles.storyOption,
											styles.storyOptionPosition(index < activeIndex ? "-10px" : "10px"),
											index === 0 && styles.storyFirstOption,
											selected && styles.storySelectedOption,
										)}
										ref={getOptionRef(index)}
										key={feature.storyTitle}
										aria-current={selected ? "step" : undefined}
									>
										<div {...stylex.props(baseStyles.element, styles.storyOptionControl)}>
											<span
												{...stylex.props(
													baseStyles.element,
													styles.storyOptionTitle,
													selected && styles.storySelectedOptionTitle,
												)}
											>
												{feature.storyTitle}
											</span>
										</div>
										<div
											{...stylex.props(
												baseStyles.element,
												styles.storyDescriptionMotion,
												selected && styles.storySelectedDescription,
											)}
											data-story-description=""
										>
											<p
												{...stylex.props(
													baseStyles.element,
													baseStyles.paragraph,
													styles.storyDescription,
												)}
											>
												{renderInlineReact(feature.storyDescription)}
											</p>
										</div>
									</li>
								);
							})}
						</ol>
					</div>
					<div {...stylex.props(baseStyles.element, styles.storyVisualHome)}>
						<figure
							{...stylex.props(baseStyles.element, styles.storyVisual)}
							data-active-feature={activeFeature.storyTitle}
						>
							{inRange ? (
								<Suspense fallback={DEMO_PLACEHOLDER}>
									{mountedSceneIndexes.map((index) => {
										const feature = productFeatures[index];
										if (!feature) return null;
										const selected = activeIndex === index;
										return (
											<div
												{...stylex.props(
													baseStyles.element,
													styles.storyDemoTransition,
													styles.storyLayerOffset(index < activeIndex ? "-12px" : "12px"),
													selected && styles.storySelectedDemo,
												)}
												ref={getLayerRef(index)}
												key={feature.slug}
												data-story-scene={feature.slug}
												data-story-scene-index={index}
												aria-hidden={!selected}
												inert={!selected}
											>
												<FeatureDemo scene={feature.demoScene} />
											</div>
										);
									})}
								</Suspense>
							) : (
								DEMO_PLACEHOLDER
							)}
						</figure>
					</div>
				</div>
				<div
					{...stylex.props(
						baseStyles.element,
						styles.storyScrollTrack(
							`calc(${productFeatures.length + 1} * clamp(300px, 42svh, 420px))`,
						),
					)}
					aria-hidden="true"
				/>
			</div>
		</section>
	);
}
