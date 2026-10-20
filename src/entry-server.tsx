import * as stylex from "@stylexjs/stylex";
import { Suspense } from "react";
import { renderToReadableStream } from "preact-render-to-string/stream";
import { HomePage } from "./pages/HomePage";
import { baseStyles } from "./styles/base-styles";

export async function render(template: string): Promise<string> {
	const root = '<div id="root"></div>';
	if (!template.includes(root)) throw new Error("The HTML template is missing its empty root.");
	const stream = renderToReadableStream(
		<Suspense fallback={null}>
			<HomePage />
		</Suspense>,
	);
	try {
		await stream.allReady;
	} catch (error) {
		throw new AggregateError([error], "Homepage prerender failed.", { cause: error });
	}
	const markup = await new Response(stream).text();
	const htmlClass = stylex.props(baseStyles.element, baseStyles.html).className ?? "";
	const bodyClass = stylex.props(baseStyles.element, baseStyles.body).className ?? "";
	const rootClass = stylex.props(baseStyles.element, baseStyles.root).className ?? "";
	// Production rewrites non-home app routes to this file. Never show home markup there.
	const routeGuard =
		'<script>if(location.pathname!=="/")document.getElementById("root").replaceChildren()</script>';
	return template
		.replace('<html lang="en">', `<html lang="en" class="${htmlClass}">`)
		.replace("<body>", `<body class="${bodyClass}">`)
		.replace(root, `<div id="root" class="${rootClass}">${markup}</div>${routeGuard}`);
}
