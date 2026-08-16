import { DownloadButton, TextLink } from "../components/Links";
export function FinalCallout() {
	return (
		<section
			id="downloads"
			className="final-callout page-cta section-width"
			aria-labelledby="download-title"
		>
			<div>
				<h2 id="download-title">Your models. Your hardware. One surface.</h2>
				<div className="hero__actions">
					<div className="button-group">
						<DownloadButton />
						<TextLink href="/prompt">Setup prompt</TextLink>
					</div>
				</div>
			</div>
		</section>
	);
}
