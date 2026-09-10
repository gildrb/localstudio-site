import type { IncomingMessage, ServerResponse } from "node:http";

/** The HTTP fields consumed by the public handlers; Vercel supplies the optional parsed body. */
export type ApiRequest = Pick<IncomingMessage, "method"> & { body?: unknown };

export type ApiResponse = {
	statusCode: ServerResponse["statusCode"];
	setHeader: (name: string, value: string) => void;
	end: (body?: string) => void;
};

export type ApiHandler = (request: ApiRequest, response: ApiResponse) => void;

export const status = {
	status: "ok",
	service: "Local Studio public product API",
	version: "1.0.0",
	documentation: "https://localstudio.ai/developers",
};

export const products = {
	products: [
		{
			id: "local-studio",
			name: "Local Studio",
			description: "Local-first macOS workstation for self-hosted language-model backends.",
			url: "https://localstudio.ai/",
			repository: "https://github.com/sybil-solutions/local-studio",
		},
		{
			id: "kittylitter",
			name: "KittyLitter",
			description: "Native iOS and Android client for coding agents and Local Studio sessions.",
			url: "https://kittylitter.app",
			repository: "https://github.com/dnakov/litter",
		},
		{
			id: "codex-shim",
			name: "Codex Shim",
			description:
				"Local Responses API shim that exposes bring-your-own-key models to Codex Desktop.",
			url: "https://github.com/sybil-solutions/codex-shim",
			repository: "https://github.com/sybil-solutions/codex-shim",
		},
	],
};

export function sendJson(
	response: ApiResponse,
	statusCode: number,
	body: unknown,
	headers: Record<string, string> = {},
): void {
	response.statusCode = statusCode;
	response.setHeader("Content-Type", "application/json; charset=utf-8");
	response.setHeader("Cache-Control", statusCode === 200 ? "public, max-age=60" : "no-store");
	for (const [name, value] of Object.entries(headers)) response.setHeader(name, value);
	response.end(JSON.stringify(body));
}

export function methodNotAllowed(response: ApiResponse, allowed = "GET"): void {
	response.setHeader("Allow", allowed);
	sendJson(response, 405, {
		error: {
			code: "method_not_allowed",
			message: "This endpoint does not support the requested HTTP method.",
			resolution: `Use ${allowed} as documented in /openapi.json.`,
			documentation: "https://localstudio.ai/developers",
		},
	});
}
