import { CtaPair } from "../components/Links";
export function FinalCallout() {
	return (
		<section
			id="downloads"
			className="final-callout page-cta section-width"
			aria-labelledby="download-title"
		>
			<div>
<h2 id="download-title">Run it on your terms.</h2>
				<div className="hero__actions">
					<CtaPair
						secondary={{ href: "/prompt", label: "Setup prompt" }}
					/>
				</div>
			</div>
		</section>
	);
}
