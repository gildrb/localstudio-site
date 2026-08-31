#!/usr/bin/env bun
// Prerenders the homepage into dist/index.html. Runs the same StyleX/WGSL
// pipeline as the bundle (scripts/bun-plugins.mjs) so the emitted markup uses
// exactly the class names of the shipped CSS. Replaces the vite createServer
// SSR path.
import { readFile, writeFile } from "node:fs/promises";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { registerRuntimePipeline } from "./bun-plugins.mjs";

await registerRuntimePipeline({ dev: false });

const outputPath = new URL("../dist/index.html", import.meta.url);
const { HomePage } = await import("../src/pages/HomePage.tsx");

const markup = await (async () => {
	const stream = await renderToReadableStream(
		React.createElement(
			React.Suspense,
			{ fallback: null },
			React.createElement(HomePage),
		),
		{ onError: (error) => Promise.reject(error) },
	);
	await stream.allReady;
	return new Response(stream).text();
})();
const source = await readFile(outputPath, "utf8");
const root = '<div id="root"></div>';
if (!source.includes(root)) throw new Error("missing root");
const routeGuard = '<script>if(location.pathname!=="/")document.getElementById("root").replaceChildren()</script>';
const rendered = source.replace(
	root,
	`<div id="root">${markup}</div>${routeGuard}`,
);
await writeFile(outputPath, rendered);
console.log("prerendered homepage");
process.exit(0);
