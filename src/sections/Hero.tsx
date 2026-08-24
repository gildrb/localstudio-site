import { assets } from "../domain/asset";
import { lazy, Suspense } from "react";
import { machinePath, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { LocalLink } from "../components/LocalLink";
import { LocalAiLogo } from "../logo/LocalAiLogo";
import { site } from "../domain/site";

const HeroDemo = lazy(() =>
	import("@local-studio/demo-ui/hero").then(({ HeroDemo }) => ({ default: HeroDemo })),
);

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
	return new URLSearchParams(window.location.search).has("demoClock")
		? fastClock
		: undefined;
}

export function Hero() {
	const clock = useHeroClock();
	return (
		<section className="hero" id="top" aria-labelledby="landing-title">
				<LocalAiLogo />
				<div className="hero__inner">
					<div className="hero__copy">
						<h1 id="landing-title" tabIndex={-1}>
							Intelligence should be{" "}
							<span className="hero__title-end">
								owned
								<LocalLink
									className="hero__mark-button"
									href={machinePath}
									aria-label="Machine-readable page"
								>
									<img
										className="hero__mark"
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
						<p className="hero__thesis">
							Private AI that works for you, not the cloud.
						</p>
						<div className="hero__actions">
							<CtaPair secondary={{ href: setupPath, label: "Setup prompt" }} />
						</div>
					</div>
				</div>
			<div className="hero__stage section-width" id="product">
					<Suspense
						fallback={
							<div className="hero__demo-placeholder" aria-hidden="true" />
						}
					>
						{clock ? (
							<HeroDemo
								clock={clock}
								repositoryUrl={site.products.localStudio.repository}
							/>
						) : (
							<HeroDemo repositoryUrl={site.products.localStudio.repository} />
						)}
					</Suspense>
			</div>
		</section>
	);
}
