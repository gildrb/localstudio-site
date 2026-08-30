import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import setupPromptTemplate from "../content/setup-prompt.txt?raw";
import { PromptBlock } from "../components/PromptBlock";
import { overviewPath, routes, setupPath } from "../domain/route";
import { CtaPair } from "../components/Links";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { site } from "../domain/site";
import { styles } from "../styles/pages-styles";

const setupPrompt = setupPromptTemplate.replace(
	"{{LOCAL_STUDIO_REPOSITORY}}",
	site.products.localStudio.repository,
);

export function PromptPage() {
	return (
		<PageShell>
			<PageIntro
				layout="left"
				id="prompt-title"
				title={routes[setupPath].heading}
				description={`It will inspect the machine, choose the right runtime, install ${site.products.localStudio.name}, and prove a real inference request works.`}
				actions={
					<CtaPair secondary={{ href: overviewPath, label: "Go to overview" }} />
				}
			/>
			<section
				{...stylex.props(baseStyles.element, styles.sectionWidth, styles.pageBottom)}
				aria-label="Setup handoff"
			>
				<PromptBlock label="Portable setup prompt" text={setupPrompt} />
			</section>
		</PageShell>
	);
}
