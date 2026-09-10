import { infoPages, type InfoInline, type InfoPath } from "../content/info-pages.ts";
import { site } from "../domain/site.ts";

export function markdownPage(title: string, body: string): string {
	return `# ${title}\n\nCompany: ${site.company.name} (${site.company.url}).\n\n${body.trim()}\n`;
}

function infoInlineMarkdown(content: readonly InfoInline[]): string {
	return content
		.map((part) => {
			if (part.kind === "text") return part.text;
			if (part.kind === "code") return `\`${part.code}\``;
			return `[${part.label}](${part.href})`;
		})
		.join("");
}

export function infoPageMarkdown(path: InfoPath): string {
	const model = infoPages[path];
	const body = model.blocks
		.map((block) => {
			if (block.kind === "heading") return `## ${block.text}`;
			if (block.kind === "code") return `\`\`\`sh\n${block.text}\n\`\`\``;
			return infoInlineMarkdown(block.content);
		})
		.join("\n\n");
	return markdownPage(model.title, body);
}
