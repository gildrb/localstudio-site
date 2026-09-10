import {
	methodNotAllowed,
	products,
	sendJson,
	status,
	type ApiRequest,
	type ApiResponse,
} from "./_shared.ts";

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

function result(id: unknown, value: unknown) {
	return { jsonrpc: "2.0", id, result: value };
}

function error(id: unknown, code: number, message: string) {
	return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

export default function handler(request: ApiRequest, response: ApiResponse): void {
	if (request.method !== "POST") return methodNotAllowed(response, "POST");
	const body = request.body;
	const id = typeof body === "object" && body !== null && "id" in body ? body.id : undefined;
	if (
		typeof body !== "object" ||
		body === null ||
		!("jsonrpc" in body) ||
		body.jsonrpc !== "2.0" ||
		!("method" in body) ||
		!body.method
	) {
		return sendJson(response, 400, error(id, -32600, "Invalid JSON-RPC 2.0 request."));
	}
	if (body.method === "notifications/initialized") {
		response.statusCode = 202;
		return response.end();
	}
	if (body.method === "initialize") {
		return sendJson(
			response,
			200,
			result(id, {
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
	if (body.method === "tools/list") return sendJson(response, 200, result(id, { tools }));
	if (body.method === "tools/call") {
		const params = "params" in body ? body.params : undefined;
		const name =
			typeof params === "object" && params !== null && "name" in params ? params.name : undefined;
		const data =
			name === "list_products" ? products : name === "get_service_status" ? status : null;
		if (!data) return sendJson(response, 200, error(id, -32602, `Unknown tool: ${String(name)}`));
		return sendJson(
			response,
			200,
			result(id, {
				content: [{ type: "text", text: JSON.stringify(data) }],
				structuredContent: data,
				isError: false,
			}),
		);
	}
	return sendJson(response, 200, error(id, -32601, `Method not found: ${String(body.method)}`));
}
