import * as v from "valibot";
import {
	jsonValueSchema,
	methodNotAllowed,
	products,
	sendJson,
	status,
	type ApiRequest,
	type ApiResponse,
	type JsonValue,
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
] as const;

// Keep the endpoint's existing permissive JSON-RPC behavior while decoding JSON at the boundary.
const requestBody = v.object({
	jsonrpc: v.literal("2.0"),
	id: v.optional(jsonValueSchema),
	method: v.pipe(jsonValueSchema, v.check<JsonValue>(Boolean)),
	params: v.optional(jsonValueSchema),
});
const requestIdentity = v.object({ id: v.optional(jsonValueSchema) });
const toolParameters = v.object({ name: v.optional(jsonValueSchema) });
const jsonText = v.pipe(v.unknown(), v.transform(String), v.string());

function result(id: JsonValue | undefined, value: JsonValue) {
	return { jsonrpc: "2.0", id, result: value };
}

function error(id: JsonValue | undefined, code: number, message: string) {
	return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function callTool(id: JsonValue | undefined, parameters: JsonValue | undefined) {
	const name = v.is(toolParameters, parameters) ? parameters.name : undefined;
	const data = name === "list_products" ? products : name === "get_service_status" ? status : null;
	if (data === null) {
		return error(id, -32602, `Unknown tool: ${v.parse(jsonText, name)}`);
	}
	return result(id, {
		content: [{ type: "text", text: JSON.stringify(data) }],
		structuredContent: data,
		isError: false,
	});
}

function rpcResult(body: Readonly<v.InferOutput<typeof requestBody>>) {
	if (body.method === "initialize") {
		return result(body.id, {
			protocolVersion: "2025-06-18",
			capabilities: { tools: { listChanged: false } },
			serverInfo: {
				name: "local-studio-public",
				title: "Local Studio Public MCP",
				version: "1.0.0",
			},
			instructions:
				"Use these read-only tools to discover Local Studio products. No API key is required.",
		});
	}
	if (body.method === "tools/list") {
		return result(body.id, { tools });
	}
	if (body.method === "tools/call") {
		return callTool(body.id, body.params);
	}
	return error(body.id, -32601, `Method not found: ${v.parse(jsonText, body.method)}`);
}

export default function handler(request: ApiRequest, response: ApiResponse): void {
	if (request.method !== "POST") {
		methodNotAllowed(response, "POST");
		return;
	}
	const body = request.body;
	if (!v.is(requestBody, body)) {
		sendJson(
			response,
			400,
			error(
				v.is(requestIdentity, body) ? body.id : undefined,
				-32600,
				"Invalid JSON-RPC 2.0 request.",
			),
		);
		return;
	}
	if (body.method === "notifications/initialized") {
		response.statusCode = 202;
		response.end();
		return;
	}
	sendJson(response, 200, rpcResult(body));
}
