import { baseStyles } from "../styles/base-styles";
import * as stylex from "@stylexjs/stylex";
import { docsPath } from "../domain/route";
import { site } from "../domain/site";
import { styles } from "../styles/pages-styles";
import { machineRows } from "./resources-data";
import { overviewSections, sourceSection, type OverviewSectionContent } from "./resources-sections";
import { OverviewHeading, OverviewRows } from "./ResourcesRows";

function OverviewSection({ section }: { readonly section: OverviewSectionContent }) {
	return (
		<section id={section.id} {...stylex.props(baseStyles.element, styles.docsSection)}>
			<OverviewHeading title={section.title} />
			{section.lead === undefined ? null : (
				<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
					{section.lead}
				</p>
			)}
			<OverviewRows entries={section.entries} />
			{section.more === undefined ? null : (
				<>
					<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.marginTop32)}>
						{section.more.lead}
					</p>
					<OverviewRows entries={section.more.entries} />
				</>
			)}
		</section>
	);
}

function MachinesSection() {
	return (
		<section id="for-machines" {...stylex.props(baseStyles.element, styles.docsSection)}>
			<OverviewHeading title="For Machines" />
			<p {...stylex.props(baseStyles.element, baseStyles.paragraph, styles.docsSectionLead)}>
				Every HTML route above has a markdown twin: append{" "}
				<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
					.md
				</code>{" "}
				or send{" "}
				<code {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsInlineCode)}>
					Accept: text/markdown
				</code>
				. The homepage advertises the catalog, docs, and agent card through RFC 8288 Link headers.
			</p>
			<pre {...stylex.props(baseStyles.element, baseStyles.monospace, styles.docsCode)}>
				curl -H &quot;Accept: text/markdown&quot; {site.origin}
				{docsPath}
			</pre>
			<OverviewRows entries={machineRows} />
		</section>
	);
}

export function ResourcesSections() {
	return (
		<>
			{overviewSections.map((section) => (
				<OverviewSection key={section.id} section={section} />
			))}
			<MachinesSection />
			<OverviewSection section={sourceSection} />
		</>
	);
}
