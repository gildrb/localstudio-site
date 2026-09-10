import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { CtaPair } from "../components/Links";
import { DocsLayout } from "../components/DocsLayout";
import { PageCta } from "../components/PageCta";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { docsPath, overviewPath, routes } from "../domain/route";
import { toc } from "./resources-data";
import { ResourcesSections } from "./ResourcesSections";

export function ResourcesPage() {
	return (
		<PageShell>
			<PageIntro
				layout="left"
				id="resources-title"
				title={routes[overviewPath].heading}
				description="Documentation, setup paths, downloads, and the surrounding ecosystem in one place."
				actions={<CtaPair secondary={{ href: docsPath, label: "Read the docs" }} />}
			/>
			<DocsLayout toc={toc} path={overviewPath} label="Overview sections">
				<p {...stylex.props(baseStyles.element, baseStyles.paragraph)}>
					One page, everything on the map: the site, the desktop app, the phone client, the shim,
					the machine surface, and where the source lives. If it exists around{" "}
					<span translate="no" {...stylex.props(baseStyles.element)}>
						Local Studio
					</span>
					, it is linked from here.
				</p>
				<ResourcesSections />
			</DocsLayout>
			<PageCta id="resources-cta-title" />
		</PageShell>
	);
}
