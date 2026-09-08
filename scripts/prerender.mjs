#!/usr/bin/env bun
// Prerenders the homepage into dist/index.html. Runs the same StyleX/WGSL
// pipeline as the bundle (scripts/bun-plugins.mjs) so the emitted markup uses
// exactly the class names of the shipped CSS. Replaces the vite createServer
// SSR path.
import { readFile, writeFile } from "node:fs/promises";
import React from "react";
import { renderToReadableStream } from "react-dom/server";
import { registerRuntimePipeline } from "./bun-plugins.mjs";

const dev = process.argv.includes("--dev");
await registerRuntimePipeline({ dev });

const outputPath = new URL(dev ? "../dist-dev/index.html" : "../dist/index.html", import.meta.url);
const inputPath = dev ? new URL("../dist-dev/index.pending.html", import.meta.url) : outputPath;
const stylex = await import("@stylexjs/stylex");
const { baseStyles } = await import("../src/styles/base-styles.ts");
const { constants } = await import("../src/styles/public-tokens.stylex.ts");
const { assets } = await import("../src/domain/asset.ts");
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
const source = await readFile(inputPath, "utf8");
const root = '<div id="root"></div>';
if (!source.includes(root)) throw new Error("missing root");
const routeGuard = '<script>if(location.pathname!=="/")document.getElementById("root").replaceChildren()</script>';
const rendered = source
	.replace('<html lang="en">', `<html lang="en" class="${stylex.props(baseStyles.element, baseStyles.html).className}">`)
	.replace("<body>", `<body class="${stylex.props(baseStyles.element, baseStyles.body).className}">`)
	.replace("</head>", `<style>@font-face{font-family:"${constants.fontSansName}";src:url("${assets.fontSans}") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}@font-face{font-family:"${constants.fontMonoName}";src:url("${assets.fontMono}") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}</style></head>`)
	.replace(root, `<div id="root" class="${stylex.props(baseStyles.element, baseStyles.root).className}">${markup}</div>${routeGuard}`);
await writeFile(outputPath, rendered);
console.log("prerendered homepage");
process.exit(0);
