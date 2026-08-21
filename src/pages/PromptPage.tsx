import setupPrompt from "../content/setup-prompt.txt?raw";
import { PromptBlock } from "../components/PromptBlock";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";

export function PromptPage() {
	return (
		<PageShell>
			<PageIntro
				id="prompt-title"
				layout="left"
				title="Give this to any coding model"
				description="It will inspect the machine, choose the right runtime, install Local Studio, and prove a real inference request works."
				actions={
					<CtaPair secondary={{ href: "/docs", label: "Read the docs" }} />
				}
			/>
			<section className="section-width pb-30" aria-label="Setup handoff">
				<PromptBlock label="Portable setup prompt" text={setupPrompt} />
			</section>
		</PageShell>
	);
}
