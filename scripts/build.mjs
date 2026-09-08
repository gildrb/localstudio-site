#!/usr/bin/env bun
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, watch as watchFiles, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { agentDocuments } from "../src/agent/documents.ts";
import { createBuildPipeline } from "./bun-plugins.mjs";

const root = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const devMode = process.argv.includes("--dev");
const outdir = path.join(root, devMode ? "dist-dev" : "dist");

async function runBuild() {
	const started = performance.now();
	if (!devMode) rmSync(outdir, { recursive: true, force: true });
	const { plugins, stylex } = createBuildPipeline({ dev: devMode });
	const result = await Bun.build({
		entrypoints: [path.join(root, "src/main.tsx")],
		outdir,
		target: "browser",
		format: "esm",
		minify: !devMode,
		splitting: true,
		sourcemap: devMode ? "inline" : "none",
		define: {
			"import.meta.env.PROD": String(!devMode),
			"process.env.NODE_ENV": JSON.stringify(devMode ? "development" : "production"),
		},
		naming: { entry: "assets/[name]-[hash].[ext]", chunk: "assets/[name]-[hash].[ext]", asset: "assets/[name]-[hash].[ext]" },
		plugins,
	});
	if (!result.success) {
		for (const log of result.logs) console.error(log);
		process.exitCode = 1;
		return;
	}
	const entry = result.outputs.find((output) => output.kind === "entry-point");
	if (!entry) throw new Error("build produced no entry point");
	const css = stylex.collectCss() ?? "";
	const cssName = `stylex-${createHash("sha256").update(css).digest("hex").slice(0, 8)}.css`;
	mkdirSync(path.join(outdir, "assets"), { recursive: true });
	writeFileSync(path.join(outdir, "assets", cssName), css);
	for (const document of agentDocuments()) {
		const file = path.join(outdir, document.path.slice(1));
		mkdirSync(path.dirname(file), { recursive: true });
		writeFileSync(file, document.body);
	}
	cpSync(path.join(root, "public"), outdir, { recursive: true });
	const html = readFileSync(path.join(root, "index.html"), "utf8")
		.replace("</head>", `    <link rel="stylesheet" href="/assets/${cssName}" />\n  </head>`)
		.replace(
			'<script type="module" src="/src/main.tsx"></script>',
			`<script type="module" src="/assets/${path.basename(entry.path)}"></script>`,
		);
	if (devMode) {
		writeFileSync(path.join(outdir, "index.pending.html"), html);
		const prerender = Bun.spawn([process.execPath, "scripts/prerender.mjs", "--dev"], {
			cwd: root,
			stdout: "inherit",
			stderr: "inherit",
			env: process.env,
		});
		if ((await prerender.exited) !== 0) throw new Error("Development prerender failed");
		rmSync(path.join(outdir, "index.pending.html"));
	} else {
		writeFileSync(path.join(outdir, "index.html"), html);
	}
	console.log(
		`built ${path.basename(entry.path)} + ${cssName} (${result.outputs.length} outputs) in ${Math.round(performance.now() - started)}ms`,
	);
}

const watchTargets = [
	"src", "packages", "public", "scripts", "index.html",
	"package.json", "bun.lock", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json",
];

export function sourceStamp(targets = watchTargets) {
	const pending = targets.map((target) => path.isAbsolute(target) ? target : path.join(root, target));
	const entries = [];
	while (pending.length > 0) {
		const file = pending.pop();
		const stats = statSync(file, { throwIfNoEntry: false });
		if (!stats) continue;
		if (stats.isDirectory()) {
			for (const entry of readdirSync(file)) pending.push(path.join(file, entry));
		} else {
			entries.push(`${path.relative(root, file)}:${stats.mtimeMs}:${stats.size}`);
		}
	}
	return entries.toSorted().join("|");
}

if (import.meta.main) {
	if (process.argv.includes("--watch")) {
		const args = process.argv.slice(2).filter((arg) => arg !== "--watch" && arg !== "--skip-initial");
		let child;
		process.on("exit", () => child?.kill());
		process.once("SIGINT", () => process.exit(130));
		process.once("SIGTERM", () => process.exit(143));
		const rebuild = async () => {
			// Reload build code and plugin caches as well as application sources.
			child = Bun.spawn([process.execPath, import.meta.filename, ...args], {
				cwd: root,
				stdout: "inherit",
				stderr: "inherit",
				env: process.env,
			});
			if ((await child.exited) !== 0) throw new Error("Development rebuild failed");
		};
		if (!process.argv.includes("--skip-initial")) await rebuild();
		let timer;
		let stamp = sourceStamp();
		let builds = Promise.resolve();
		const rebuildIfChanged = () => {
			const nextStamp = sourceStamp();
			if (nextStamp === stamp) return;
			stamp = nextStamp;
			builds = builds.then(rebuild).catch((error) => console.error("rebuild failed:", error));
		};
		for (const dir of watchTargets) {
			watchFiles(path.join(root, dir), { recursive: true }, () => {
				clearTimeout(timer);
				timer = setTimeout(rebuildIfChanged, 100);
			});
		}
		// OS notifications can be lost during watch startup or atomic saves.
		setInterval(rebuildIfChanged, 1_000);
		console.log("watching for changes...");
	} else {
		await runBuild();
	}
}
