import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { LazyMotion, domAnimation } from "motion/react";
import { styles } from "../styles/sections-styles";
import { KittyCarousel } from "./KittyCarousel";

export function KittyLitter() {
	return (
		<LazyMotion features={domAnimation} strict>
			<section
				id="mobile"
				{...stylex.props(baseStyles.element, baseStyles.sectionAnchor, styles.kitty)}
				aria-labelledby="kittylitter-title"
			>
				<div
					data-kitty-intro
					{...stylex.props(baseStyles.element, styles.sectionWidth, styles.kittyIntro)}
				>
					<h2
						id="kittylitter-title"
						{...stylex.props(
							baseStyles.element,
							baseStyles.heading,
							baseStyles.headingTwo,
							styles.kittyHeading,
						)}
					>
						Your Session, Anywhere
					</h2>
				</div>
				<KittyCarousel />
			</section>
		</LazyMotion>
	);
}
