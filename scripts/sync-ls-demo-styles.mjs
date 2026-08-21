import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const sourceDirectory = path.join(projectRoot, "src/styles/ls");
const outputPath = path.join(projectRoot, "src/styles/ls-app.css");

function removeRule(css, marker) {
	const start = css.indexOf(marker);
	if (start < 0) throw new Error(`Missing CSS rule: ${marker}`);
	const open = css.indexOf("{", start);
	let depth = 0;
	for (let index = open; index < css.length; index += 1) {
		if (css[index] === "{") depth += 1;
		if (css[index] === "}") depth -= 1;
		if (depth === 0) {
			let end = index + 1;
			while (css[end] === "\n") end += 1;
			return css.slice(0, start) + css.slice(end);
		}
	}
	throw new Error(`Unclosed CSS rule: ${marker}`);
}

function findBrace(css, start, opening = true) {
	let comment = false;
	let quote = "";
	let depth = 0;
	for (let index = start; index < css.length; index += 1) {
		const character = css[index];
		const next = css[index + 1];
		if (comment) {
			if (character === "*" && next === "/") {
				comment = false;
				index += 1;
			}
			continue;
		}
		if (quote) {
			if (character === quote && css[index - 1] !== "\\") quote = "";
			continue;
		}
		if (character === "/" && next === "*") {
			comment = true;
			index += 1;
			continue;
		}
		if (character === '"' || character === "'") {
			quote = character;
			continue;
		}
		if (character === "{") {
			if (opening) return index;
			depth += 1;
		} else if (character === "}" && !opening) {
			depth -= 1;
			if (depth === 0) return index;
		}
	}
	return -1;
}

function splitPrelude(raw) {
	let index = 0;
	while (index < raw.length) {
		while (/\s/.test(raw[index] ?? "")) index += 1;
		if (!raw.startsWith("/*", index)) break;
		const end = raw.indexOf("*/", index + 2);
		if (end < 0) throw new Error("Unclosed CSS comment");
		index = end + 2;
	}
	return { prefix: raw.slice(0, index), header: raw.slice(index).trim() };
}

function scopeSelectors(header) {
	return header
		.split(",")
		.map((selector) => selector.trim())
		.map((selector) =>
			selector.startsWith(".demo") ? selector : `.demo ${selector}`,
		)
		.join(",\n");
}

function scopeCss(css) {
	let output = "";
	let cursor = 0;
	while (cursor < css.length) {
		const open = findBrace(css, cursor);
		if (open < 0) return output + css.slice(cursor);
		const close = findBrace(css, open, false);
		if (close < 0) throw new Error("Unclosed CSS block");
		const { prefix, header } = splitPrelude(css.slice(cursor, open));
		const body = css.slice(open + 1, close);
		const nestedRules = /^@(media|supports|container|layer)\b/.test(header);
		const nextHeader = header.startsWith("@") ? header : scopeSelectors(header);
		output += `${prefix}${nextHeader} {${nestedRules ? scopeCss(body) : body}}`;
		cursor = close + 1;
	}
	return output;
}

function projectTokens(css) {
	let projected = css
		.replaceAll(".theme-zai-light,\n", "")
		.replaceAll(".theme-zai-dark,\n", "")
		.replaceAll(":root", ".demo");
	projected = removeRule(projected, "@theme inline");
	return scopeCss(projected).trim();
}

function projectBase(css) {
	const reset = css.indexOf("*,\n*::before");
	if (reset < 0) throw new Error("Could not find the Local Studio base reset");
	let projected = css.slice(reset);
	projected = removeRule(projected, "html,\nbody");
	projected = removeRule(projected, "html {");
	projected = removeRule(projected, "body {");
	projected = projected
		.replaceAll(":root", ".demo")
		.replaceAll("var(--button-ink)", "var(--color-black)")
		.replaceAll("var(--foreground)", "var(--color-white)");
	return scopeCss(projected).trim();
}

function projectChat(css) {
	const projected = css
		.replaceAll(":root", ".demo")
		.replaceAll("var(--foreground)", "var(--color-white)");
	return scopeCss(projected).trim();
}

const [tokens, base, chat] = await Promise.all([
	readFile(path.join(sourceDirectory, "tokens.css"), "utf8"),
	readFile(path.join(sourceDirectory, "base.css"), "utf8"),
	readFile(path.join(sourceDirectory, "chat.css"), "utf8"),
]);

const output =
	[
		`/* Local Studio tokens.css (copied) */\n${projectTokens(tokens)}`,
		`/* Local Studio base.css (copied) */\n${projectBase(base)}`,
		`/* Local Studio chat.css (copied) */\n${projectChat(chat)}`,
	].join("\n\n") + "\n";

if (process.argv.includes("--check")) {
	const current = await readFile(outputPath, "utf8");
	if (current !== output) {
		process.stderr.write(
			"src/styles/ls-app.css is stale. Run: pnpm design:sync\n",
		);
		process.exitCode = 1;
	}
} else {
	await writeFile(outputPath, output);
	process.stdout.write(
		"Updated src/styles/ls-app.css from src/styles/ls/*.css\n",
	);
}
