import { infoPaths } from "../content/info-pages.ts";
import type { DocumentPath } from "../domain/route.ts";
import { machineText } from "./machine.ts";
import { infoPageMarkdown } from "./markdown-format.ts";
import { llmsTxt } from "./llms-reference.ts";
import { sitemapMarkdown } from "./discovery.ts";
import {
	indexMarkdown,
	mobileMarkdown,
	docsMarkdown,
	promptMarkdown,
	agentsMarkdown,
	resourcesMarkdown,
	downloadMarkdown,
} from "./product-markdown.ts";
import {
	servicesMarkdown,
	peopleMarkdown,
	showcaseMarkdown,
	faqMarkdown,
} from "./company-markdown.ts";

export { markdownPage, infoPageMarkdown } from "./markdown-format.ts";
export { llmsTxt } from "./llms-reference.ts";
export { sitemapMarkdown, apiCatalog, agentCard } from "./discovery.ts";
export {
	indexMarkdown,
	mobileMarkdown,
	docsMarkdown,
	promptMarkdown,
	agentsMarkdown,
	resourcesMarkdown,
	downloadMarkdown,
} from "./product-markdown.ts";
export {
	servicesMarkdown,
	peopleMarkdown,
	showcaseMarkdown,
	faqMarkdown,
} from "./company-markdown.ts";

const markdownDocuments = {
	"/mobile.md": mobileMarkdown,
	"/agents.md": agentsMarkdown,
	"/services.md": servicesMarkdown,
	"/people.md": peopleMarkdown,
	"/showcase.md": showcaseMarkdown,
	"/faq.md": faqMarkdown,
} as const satisfies Record<DocumentPath, () => string>;

export function markdownDocument(path: DocumentPath): string {
	const renderDocument = markdownDocuments[path];
	return renderDocument();
}

export function llmsFull(): string {
	return [
		llmsTxt().trim(),
		"",
		"---",
		"",
		machineText(),
		"",
		indexMarkdown(),
		mobileMarkdown(),
		docsMarkdown(),
		promptMarkdown(),
		agentsMarkdown(),
		resourcesMarkdown(),
		downloadMarkdown(),
		servicesMarkdown(),
		peopleMarkdown(),
		showcaseMarkdown(),
		faqMarkdown(),
		...infoPaths.map((path) => infoPageMarkdown(path)),
		sitemapMarkdown(),
	].join("\n");
}
