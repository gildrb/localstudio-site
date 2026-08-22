import { CtaPair } from "../components/Links";
export function FinalCallout() {
	return (
		<section
			id="downloads"
			className="final-callout page-cta section-width"
			aria-labelledby="download-title"
		>
			<div>
				<h2 id="download-title">AI that stays yours</h2>
				<div className="hero__actions">
					<CtaPair
						secondary={{ href: "/setup", label: "Setup prompt" }}
					/>
				</div>
			</div>
		</section>
	);
}
