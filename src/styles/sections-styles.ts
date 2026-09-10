import { heroStyles } from "./hero-styles";
import { sponsorStyles } from "./sponsor-styles";
import { storyStyles } from "./story-styles";
import { kittyStyles } from "./kitty-styles";
import * as stylex from "@stylexjs/stylex";
import { lengths } from "./public-tokens.stylex";

const pageWidth = `min(${lengths.pageWidth}, calc(100% - ${lengths.pageGutter}))`;

const sharedStyles = stylex.create({
	sectionWidth: {
		width: pageWidth,
		marginInline: "auto",
	},
});

export const styles = {
	...sharedStyles,
	...heroStyles,
	...sponsorStyles,
	...storyStyles,
	...kittyStyles,
};
