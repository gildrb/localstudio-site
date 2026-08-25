import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import mcpHandler from "../../api/mcp.js";
import productsHandler from "../../api/v1/products.js";
import statusHandler from "../../api/v1/status.js";
import notFoundHandler from "../../api/[...path].js";
import { agentDocument } from "../../src/agent/documents";

function responseRecorder() {
	return {
		statusCode: 200,
		headers: {},
		body: "",
		setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
		end(body = "") { this.body = body; },
	};
}

function call(handler, request) {
	const response = responseRecorder();
	handler(request, response);
	return response;
}

test("homepage shell has complete metadata and no raw style block", () => {
	const html = readFileSync("index.html", "utf8");
	expect(html).toContain('<div id="root"></div>');
	expect(html).not.toContain("<style");
	expect(html).toContain('property="og:image"');
	expect(html).toContain('property="og:type" content="website"');
	const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)?.[1] ?? "null");
	const organization = jsonLd["@graph"].find((entry) => entry["@type"] === "Organization");
	expect(organization.name).toBe("Sybil Solutions");
	expect(organization.description).toBeTruthy();
	expect(organization.contactPoint.email).toContain("@");
	expect(organization.address["@type"]).toBe("PostalAddress");
});

test("OpenAPI is typed and function-calling compatible", () => {
	const document = agentDocument("/openapi.json");
	expect(document?.contentType).toContain("application/json");
	const spec = JSON.parse(document?.body ?? "null");
	expect(spec.openapi).toBe("3.1.0");
	expect(spec.servers[0].url).toBe("/");
	const operations = Object.values(spec.paths).flatMap((path) => Object.values(path));
	const ids = operations.map((operation) => operation.operationId);
	expect(new Set(ids).size).toBe(ids.length);
	for (const operation of operations) {
		expect(operation.operationId).toBeTruthy();
		expect(operation.description).toBeTruthy();
		expect(operation.responses["200"]).toBeTruthy();
	}
	expect(spec.components.schemas.Error.properties.error.properties.resolution).toBeTruthy();
});

test("trust and developer pages are substantial server documents", () => {
	for (const path of ["/developers", "/about", "/contact", "/privacy"]) {
		const document = agentDocument(path);
		expect(document?.contentType, path).toContain("text/html");
		const text = (document?.body ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
		expect(text.length, path).toBeGreaterThan(500);
		expect(document?.body, path).toContain("<h1>");
	}
});

test("REST handlers return typed success and JSON errors", () => {
	const status = call(statusHandler, { method: "GET" });
	expect(status.statusCode).toBe(200);
	expect(status.headers["content-type"]).toContain("application/json");
	expect(JSON.parse(status.body).status).toBe("ok");
	const products = call(productsHandler, { method: "GET" });
	expect(JSON.parse(products.body).products).toHaveLength(3);
	const method = call(statusHandler, { method: "POST" });
	expect(method.statusCode).toBe(405);
	expect(JSON.parse(method.body).error.resolution).toBeTruthy();
	const missing = call(notFoundHandler, { method: "GET" });
	expect(missing.statusCode).toBe(404);
	expect(JSON.parse(missing.body).error.code).toBe("not_found");
});

test("MCP supports initialize, tools/list, and tools/call", () => {
	const initialize = call(mcpHandler, { method: "POST", body: { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } } });
	expect(initialize.statusCode).toBe(200);
	expect(JSON.parse(initialize.body).result.protocolVersion).toBe("2025-06-18");
	const list = call(mcpHandler, { method: "POST", body: { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} } });
	expect(JSON.parse(list.body).result.tools.map((tool) => tool.name)).toContain("list_products");
	const invoke = call(mcpHandler, { method: "POST", body: { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "list_products", arguments: {} } } });
	expect(JSON.parse(invoke.body).result.structuredContent.products).toHaveLength(3);
});
