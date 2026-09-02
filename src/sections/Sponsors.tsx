import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { prepareInlineSvg, sponsors } from "./sponsor-logos";
import { site } from "../domain/site";
import { styles } from "../styles/sections-styles";

export function Sponsors() {
	return (
		<section
			{...stylex.props(baseStyles.element, styles.sectionWidth, styles.sponsors)}
			aria-labelledby="sponsors-title"
		>
			<p id="sponsors-title" {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.sponsorsTitle)}>
				Supporters of {site.company.name}
			</p>
			<div {...stylex.props(baseStyles.element, styles.sponsorsViewport)}>
				<ul
					{...stylex.props(
						baseStyles.list,
						baseStyles.element,
						styles.sponsorsList,
					)}
				>
					{sponsors.map(({ name, svg, width, height }, index) => (
						<li key={name} {...stylex.props(baseStyles.element)}>
							<span
								role="img"
								aria-label={name}
								{...stylex.props(
									baseStyles.element,
									styles.sponsorLogo,
									styles.sponsorLogoSize(width, height),
								)}
								dangerouslySetInnerHTML={{ __html: prepareInlineSvg(svg, `sponsor-${index}`) }}
							/>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
