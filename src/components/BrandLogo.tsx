import { baseStyles, type PublicStyle } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { assets } from "../domain/asset";

const styles = stylex.create({
	logo: {
		display: "block",
		width: "140px",
		height: "auto",
		filter: "invert(1)",
	},
});

export function BrandLogo({ sx }: { sx?: PublicStyle }) {
	return (
		<img
			{...stylex.props(baseStyles.element, baseStyles.image, styles.logo, sx)}
			src={assets.wordmark}
			alt=""
			width="3000"
			height="566"
			draggable={false}
		/>
	);
}
