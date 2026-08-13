import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { DownloadButton, TextLink } from "../components/Links";

const evidenceTransition = {
	duration: 0.82,
	delay: 1.14,
	ease: [0.16, 1, 0.3, 1] as const,
};

export function Hero() {
	const reduceMotion = useReducedMotion();
	return (
		<section className="hero" id="top" aria-labelledby="landing-title">
			<m.div
				className="hero__gradient"
				aria-hidden="true"
				initial={reduceMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={evidenceTransition}
			/>
			<div className="hero__texture" aria-hidden="true" />
			<div className="hero__inner">
				<m.div
					className="hero__copy"
					initial={reduceMotion ? false : "hidden"}
					animate="visible"
					variants={{
						hidden: {},
						visible: {
							transition: { staggerChildren: 0.09, delayChildren: 0.05 },
						},
					}}
				>
					<m.img
						className="hero__mark"
						src="/images/optimized.svg"
						alt=""
						width="525"
						height="525"
						aria-hidden="true"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					/>
					<m.h1
						id="landing-title"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					>
						Run your intelligence
						<br />
						at home.
					</m.h1>
					<m.p
						className="hero__lead"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					>
						AI workspace built to help you go local.
					</m.p>
					<m.div
						className="hero__actions"
						variants={{
							hidden: { opacity: 0, y: 18 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
							},
						}}
					>
						<DownloadButton iconSize={17} />
						<TextLink href="/prompt">Setup</TextLink>
					</m.div>
				</m.div>
			</div>
			<m.div
				className="hero__stage section-width"
				id="product"
				initial={reduceMotion ? false : { opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				transition={evidenceTransition}
			>
				<img
					className="hero__screenshot"
					src="/images/workbench-browser.png"
					alt="Local Studio workbench showing a coding agent and a local document in the integrated browser."
					width="5118"
					height="2800"
					fetchPriority="high"
				/>
			</m.div>
		</section>
	);
}
