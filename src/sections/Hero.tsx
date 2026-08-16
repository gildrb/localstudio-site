import { DownloadButton, TextLink } from "../components/Links";
import { heroSizes, responsiveSrcSet } from "../images";

export function Hero() {
	return (
		<section className="hero" id="top" aria-labelledby="landing-title">
			<div className="hero__gradient" aria-hidden="true" />
			<div className="hero__texture" aria-hidden="true" />
			<div className="hero__inner">
				<div className="hero__copy">
					<img
						className="hero__mark"
						src="/images/optimized.svg"
						alt=""
						width="525"
						height="525"
						aria-hidden="true"
					/>
					<h1 id="landing-title" tabIndex={-1}>
						Run your intelligence
						<br />
						at home.
					</h1>
					<div className="hero__actions">
						<div className="button-group">
							<DownloadButton iconSize={17} />
							<TextLink href="/prompt">Setup prompt</TextLink>
						</div>
					</div>
				</div>
			</div>
			<div className="hero__stage section-width" id="product">
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
			</div>
		</section>
	);
}
