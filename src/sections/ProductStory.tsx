import * as stylex from "@stylexjs/stylex";
import { LazyMotion, domAnimation } from "motion/react";
import { productFeatures } from "../content/product";
import { site } from "../domain/site";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { useProductStoryMotion } from "./use-product-story-motion";
import { StoryOptions } from "./StoryOptions";
import { StoryVisual } from "./StoryVisual";

export function ProductStory() {
	const { activeIndex, mobile, optionsRef, reducedMotion, showcaseRef } = useProductStoryMotion(
		productFeatures.length,
	);
	return (
		<LazyMotion features={domAnimation} strict>
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
						<StoryOptions
							activeIndex={activeIndex}
							mobile={mobile}
							optionsRef={optionsRef}
							reducedMotion={reducedMotion}
						/>
						<StoryVisual activeIndex={activeIndex} reducedMotion={reducedMotion} />
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
		</LazyMotion>
	);
}
