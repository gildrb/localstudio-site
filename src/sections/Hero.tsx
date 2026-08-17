import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { DownloadButton, TextLink } from "../components/Links";
import { heroSizes, responsiveSrcSet } from "../images";
import { useMachine } from "../machine";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
	const reduceMotion = useReducedMotion();
	const { toggleMachine } = useMachine();
	const settle = { opacity: 1, y: 0, filter: "blur(0px)" };

	return (
		<LazyMotion features={domAnimation} strict>
			<section className="hero" id="top" aria-labelledby="landing-title">
				<m.div
					className="hero__gradient"
					aria-hidden="true"
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1.2, ease, delay: 0.6 }}
				/>
				<div className="hero__texture" aria-hidden="true" />
				<div className="hero__inner">
					<div className="hero__copy">
					<m.button
						className="hero__mark-button"
						type="button"
						onClick={() => toggleMachine(true)}
						aria-label="Machine-readable page"
						initial={
							reduceMotion
								? false
								: { opacity: 0, y: 12, filter: "blur(6px)" }
						}
						animate={settle}
						transition={{ duration: 0.9, ease, delay: 0.05 }}
					>
						<img
							className="hero__mark"
							src="/images/optimized.svg"
							alt=""
							width="525"
							height="525"
							aria-hidden="true"
						/>
					</m.button>
						<m.h1
							id="landing-title"
							tabIndex={-1}
							initial={
								reduceMotion
									? false
									: { opacity: 0, y: 12, filter: "blur(6px)" }
							}
							animate={settle}
							transition={{ duration: 0.9, ease, delay: 0.12 }}
						>
							Local
							<br />
							intelligence.
						</m.h1>
						<m.div
							className="hero__actions"
							initial={
								reduceMotion
									? false
									: { opacity: 0, y: 12, filter: "blur(6px)" }
							}
							animate={settle}
							transition={{ duration: 0.9, ease, delay: 0.24 }}
						>
							<div className="button-group">
								<DownloadButton />
								<TextLink href="/prompt">Setup prompt</TextLink>
							</div>
						</m.div>
					</div>
				</div>
				<m.div
					className="hero__stage section-width"
					id="product"
					initial={
						reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" }
					}
					animate={settle}
					transition={{ duration: 0.9, ease, delay: 0.75 }}
				>
					<img
						className="hero__screenshot"
						src="/images/workbench-browser-1300.png"
						srcSet={responsiveSrcSet("/images/workbench-browser.png")}
						sizes={heroSizes}
						alt="Local Studio workbench showing a coding agent and a local document in the integrated browser."
						width="5118"
						height="2800"
						fetchPriority="high"
					/>
				</m.div>
			</section>
		</LazyMotion>
	);
}
