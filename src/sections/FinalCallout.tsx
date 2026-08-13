import { DownloadButton, TextLink } from "../components/Links";
export function FinalCallout() {
	return (
		<section
			id="downloads"
			className="final-callout section-width"
			aria-labelledby="download-title"
		>
			<div>
				<h2 id="download-title">Your models. Your hardware. One surface.</h2>
				<div className="final-callout__actions">
					<DownloadButton />
					<TextLink
						href="https://github.com/sybil-solutions/local-studio"
						target="_blank"
						rel="noreferrer"
					>
						View on GitHub
					</TextLink>
					<TextLink href="/prompt">Setup</TextLink>
				</div>
			</div>
		</section>
	);
}
