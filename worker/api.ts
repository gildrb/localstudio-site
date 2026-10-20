const MCP_ALIAS = "/.well-known/mcp";
const MCP_PATH = "/api/mcp";
const DOCUMENTATION = "https://localstudio.ai/developers";

export const status = {
	status: "ok",
	service: "Local Studio public product API",
	version: "1.0.0",
	documentation: DOCUMENTATION,
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

const tools = [
	{
		name: "list_products",
		description:
			"List Local Studio, KittyLitter, and Codex Shim with canonical URLs and source repositories.",
		inputSchema: { type: "object", properties: {}, additionalProperties: false },
	},
	{
		name: "get_service_status",
		description: "Check the Local Studio public product metadata API status and version.",
		inputSchema: { type: "object", properties: {}, additionalProperties: false },
	},
];

function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): Response {
	return new Response(JSON.stringify(body), {
		status: statusCode,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": statusCode === 200 ? "public, max-age=60" : "no-store",
			...headers,
		},
	});
}

function rpcResult(id: unknown, value: unknown) {
	return { jsonrpc: "2.0", id, result: value };
}

function rpcError(id: unknown, code: number, message: string) {
	return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

/** Parses a JSON request body; other or malformed bodies stay non-object JSON-RPC requests. */
async function requestBody(request: Request): Promise<unknown> {
	const source = await request.text();
	if (!(request.headers.get("content-type") ?? "").includes("application/json")) return source;
	try {
		const body: unknown = JSON.parse(source);
		return body;
	} catch (error) {
		if (error instanceof SyntaxError) return undefined;
		throw error;
	}
}

async function mcp(request: Request): Promise<Response> {
	const body = await requestBody(request);
	const id = typeof body === "object" && body !== null && "id" in body ? body.id : undefined;
	if (
		typeof body !== "object" ||
		body === null ||
		!("jsonrpc" in body) ||
		body.jsonrpc !== "2.0" ||
		!("method" in body) ||
		!body.method
	) {
		return json(400, rpcError(id, -32600, "Invalid JSON-RPC 2.0 request."));
	}
	if (body.method === "notifications/initialized") return new Response(null, { status: 202 });
	if (body.method === "initialize") {
		return json(
			200,
			rpcResult(id, {
				protocolVersion: "2025-06-18",
				capabilities: { tools: { listChanged: false } },
				serverInfo: {
					name: "local-studio-public",
					title: "Local Studio Public MCP",
					version: "1.0.0",
				},
				instructions:
					"Use these read-only tools to discover Local Studio products. No API key is required.",
			}),
		);
	}
	if (body.method === "tools/list") return json(200, rpcResult(id, { tools }));
	if (body.method === "tools/call") {
		const params = "params" in body ? body.params : undefined;
		const name =
			typeof params === "object" && params !== null && "name" in params ? params.name : undefined;
		const data =
			name === "list_products" ? products : name === "get_service_status" ? status : null;
		if (!data) return json(200, rpcError(id, -32602, `Unknown tool: ${String(name)}`));
		return json(
			200,
			rpcResult(id, {
				content: [{ type: "text", text: JSON.stringify(data) }],
				structuredContent: data,
				isError: false,
			}),
		);
	}
	return json(200, rpcError(id, -32601, `Method not found: ${String(body.method)}`));
}

/** Whether a normalized path belongs to the public API, including the MCP discovery alias. */
export function isApiPath(pathname: string): boolean {
	return pathname === MCP_ALIAS || pathname.startsWith("/api/");
}

/** Serves a normalized API path; unknown API paths return a JSON 404. */
export async function handleApi(request: Request, pathname: string): Promise<Response> {
	const apiPath = pathname === MCP_ALIAS ? MCP_PATH : pathname;
	const resource =
		apiPath === "/api/v1/status" ? status : apiPath === "/api/v1/products" ? products : null;
	if (resource === null && apiPath !== MCP_PATH) {
		return json(404, {
			error: {
				code: "not_found",
				message: "The requested API endpoint does not exist.",
				resolution: "Read /openapi.json or /developers for supported endpoints.",
				documentation: DOCUMENTATION,
			},
		});
	}
	const allowed = resource === null ? "POST" : "GET";
	if (request.method !== allowed) {
		return json(
			405,
			{
				error: {
					code: "method_not_allowed",
					message: "This endpoint does not support the requested HTTP method.",
					resolution: `Use ${allowed} as documented in /openapi.json.`,
					documentation: DOCUMENTATION,
				},
			},
			{ Allow: allowed },
		);
	}
	return resource === null ? mcp(request) : json(200, resource);
}
