import { methodNotAllowed, products, sendJson, status } from "./_shared.js";

const tools = [
	{
		name: "list_products",
		description: "List Local Studio, KittyLitter, and Codex Shim with canonical URLs and source repositories.",
		inputSchema: { type: "object", properties: {}, additionalProperties: false },
	},
	{
		name: "get_service_status",
		description: "Check the Local Studio public product metadata API status and version.",
		inputSchema: { type: "object", properties: {}, additionalProperties: false },
	},
];

function result(id, value) {
	return { jsonrpc: "2.0", id, result: value };
}

function error(id, code, message) {
	return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

export default function handler(request, response) {
	if (request.method === "GET") return methodNotAllowed(response, "POST");
	if (request.method !== "POST") return methodNotAllowed(response, "POST");
	const body = request.body;
	if (!body || body.jsonrpc !== "2.0" || !body.method) {
		return sendJson(response, 400, error(body?.id, -32600, "Invalid JSON-RPC 2.0 request."));
	}
	if (body.method === "notifications/initialized") {
		response.statusCode = 202;
		return response.end();
	}
	if (body.method === "initialize") {
		return sendJson(response, 200, result(body.id, {
			protocolVersion: "2025-06-18",
			capabilities: { tools: { listChanged: false } },
			serverInfo: { name: "local-studio-public", title: "Local Studio Public MCP", version: "1.0.0" },
			instructions: "Use these read-only tools to discover Local Studio products. No API key is required.",
		}));
	}
	if (body.method === "tools/list") return sendJson(response, 200, result(body.id, { tools }));
	if (body.method === "tools/call") {
		const name = body.params?.name;
		const data = name === "list_products" ? products : name === "get_service_status" ? status : null;
		if (!data) return sendJson(response, 200, error(body.id, -32602, `Unknown tool: ${String(name)}`));
		return sendJson(response, 200, result(body.id, {
			content: [{ type: "text", text: JSON.stringify(data) }],
			structuredContent: data,
			isError: false,
		}));
	}
	return sendJson(response, 200, error(body.id, -32601, `Method not found: ${body.method}`));
}
