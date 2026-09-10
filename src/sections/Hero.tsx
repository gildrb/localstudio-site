import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { assets } from "../domain/asset";
import { HeroDemo } from "@local-studio/demo-ui/hero";
import { machinePath, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { LocalAiLogo } from "../logo/LocalAiLogo";
import { site } from "../domain/site";
import { styles } from "../styles/sections-styles";

const fastClock = {
	now: () => Date.now(),
	timeout: (callback: () => void, delay: number) => {
		void delay;
		return window.setTimeout(callback, 0);
	},
	clear: (id: ReturnType<typeof setTimeout>) => {
		window.clearTimeout(id);
	},
};

function useHeroClock() {
	return "window" in globalThis && new URLSearchParams(window.location.search).has("demoClock")
		? fastClock
		: undefined;
}

function HeroHeading() {
	return (
		<h1
			id="landing-title"
			tabIndex={-1}
			{...stylex.props(
				baseStyles.element,
				baseStyles.heading,
				baseStyles.focusable,
				styles.heroHeading,
			)}
		>
			Intelligence Should Be{" "}
			<span {...stylex.props(baseStyles.element, styles.heroTitleEnd)}>
				Owned
				<LocalLink sx={styles.heroMarkButton} href={machinePath} aria-label="Machine-readable page">
					<img
						{...stylex.props(baseStyles.element, baseStyles.image, styles.heroMark)}
						src={assets.mark}
						alt=""
						width="525"
						height="525"
						aria-hidden="true"
						draggable={false}
					/>
				</LocalLink>
			</span>
		</h1>
	);
}

function HeroCopy() {
	return (
		<div data-hero-copy {...stylex.props(baseStyles.element, styles.heroCopy)}>
			<div>
				<HeroHeading />
			</div>
			<div>
				<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.heroThesis)}>
					Private AI that works for you, not the cloud.
				</p>
			</div>
			<div {...stylex.props(baseStyles.element, styles.heroActions)}>
				<CtaPair secondary={{ href: setupPath, label: "Setup Prompt" }} />
			</div>
		</div>
	);
}

export function Hero() {
	const clock = useHeroClock();
	return (
		<section
			{...stylex.props(baseStyles.element, stylex.defaultMarker(), styles.hero)}
			id="top"
			aria-labelledby="landing-title"
		>
			<div aria-hidden="true" {...stylex.props(styles.heroBackdrop)}>
				<LocalAiLogo />
			</div>
			<div {...stylex.props(baseStyles.element, styles.heroInner)}>
				<HeroCopy />
			</div>
			<div
				id="product"
				{...stylex.props(
					baseStyles.element,
					baseStyles.sectionAnchor,
					styles.sectionWidth,
					styles.heroStage,
				)}
			>
				{clock ? (
					<HeroDemo clock={clock} repositoryUrl={site.products.localStudio.repository} />
				) : (
					<HeroDemo repositoryUrl={site.products.localStudio.repository} />
				)}
			</div>
		</section>
	);
}
