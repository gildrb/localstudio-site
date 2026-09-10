import * as stylex from "@stylexjs/stylex";
import type { RefObject } from "react";
import { productFeatures } from "../content/product";
import { site } from "../domain/site";
import { baseStyles } from "../styles/base-styles";
import { styles } from "../styles/sections-styles";
import { storySceneStates } from "./product-story-motion";
import { StoryOption } from "./StoryOption";

export function StoryOptions({
	activeIndex,
	mobile,
	reducedMotion,
	optionsRef,
}: {
	readonly activeIndex: number;
	readonly mobile: boolean | null;
	readonly reducedMotion: boolean;
	readonly optionsRef: RefObject<HTMLOListElement | null>;
}) {
	const optionsOffset = `${(1 - activeIndex) * 20}%`;
	return (
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
				{storySceneStates(activeIndex, productFeatures.length).map(({ index, selected }) => (
					<StoryOption
						activeIndex={activeIndex}
						mobile={mobile}
						reducedMotion={reducedMotion}
						index={index}
						selected={selected}
						key={productFeatures[index]?.storyTitle}
					/>
				))}
			</ol>
		</div>
	);
}
