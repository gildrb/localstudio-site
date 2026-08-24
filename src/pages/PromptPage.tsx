import setupPrompt from "../content/setup-prompt.txt?raw";
import { PromptBlock } from "../components/PromptBlock";
import { overviewPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { site } from "../domain/site";

export function PromptPage() {
	return (
		<PageShell>
			<PageIntro
				id="prompt-title"
				layout="left"
				title="Give this to any coding model"
				description={`It will inspect the machine, choose the right runtime, install ${site.products.localStudio.name}, and prove a real inference request works.`}
				actions={
					<CtaPair secondary={{ href: overviewPath, label: "Go to overview" }} />
				}
			/>
			<section className="section-width pb-30" aria-label="Setup handoff">
				<PromptBlock label="Portable setup prompt" text={setupPrompt} />
			</section>
		</PageShell>
	);
}
