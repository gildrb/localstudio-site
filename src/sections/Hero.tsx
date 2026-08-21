import { lazy, Suspense } from "react";
import { CtaPair } from "../components/Links";
import { useMachine } from "../machine";

const HeroDemo = lazy(() => import("./HeroDemo").then(({ HeroDemo }) => ({ default: HeroDemo })));

export function Hero() {
	const { toggleMachine } = useMachine();
	return (
		<>
			<section className="hero" id="top" aria-labelledby="landing-title">
				<div className="hero__inner">
					<div className="hero__copy">
						<h1
							id="landing-title"
							tabIndex={-1}
							className="hero__enter hero__enter--title"
						>
							Intelligence should not be{" "}
							<span className="hero__title-end">
								rented
								<button
									className="hero__mark-button"
									type="button"
									onClick={() => toggleMachine(true)}
									aria-label="Machine-readable page"
								>
									<img
										className="hero__mark"
										src="/images/optimized.svg"
										alt=""
										width="525"
										height="525"
										aria-hidden="true"
										draggable={false}
									/>
								</button>
							</span>
						</h1>
						<p className="hero__lede hero__enter hero__enter--lede">
							Run AI at home, on hardware you own. Keep your models, prompts, files, and agent
							workflows private, secure, and entirely under your control.
						</p>
						<div className="hero__actions hero__enter hero__enter--actions">
							<CtaPair secondary={{ href: "/setup", label: "Setup prompt" }} />
						</div>
					</div>
				</div>
				<div
					className="hero__stage section-width"
					id="product"
				>
					<Suspense fallback={<div className="hero__demo-placeholder" aria-hidden="true" />}>
						<HeroDemo />
					</Suspense>
				</div>
			</section>
		</>
	);
}
