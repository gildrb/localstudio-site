import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import * as v from "valibot";
import { agentDocument } from "../../src/agent/documents.ts";
import { handleApi } from "../../worker/api.ts";

type RecordedResponse = {
	statusCode: number;
	headers: Headers;
	body: string;
};

const linkedData = v.object({
	"@graph": v.array(v.looseObject({ "@type": v.string() })),
});
const organizationData = v.object({
	name: v.string(),
	description: v.unknown(),
	contactPoint: v.object({ email: v.string() }),
	address: v.object({ "@type": v.string() }),
});
const serverData = v.object({ url: v.string() });
const operationData = v.object({
	operationId: v.string(),
	description: v.unknown(),
	responses: v.record(v.string(), v.unknown()),
});
const openApiData = v.object({
	openapi: v.string(),
	servers: v.tupleWithRest([serverData], serverData),
	paths: v.record(v.string(), v.record(v.string(), operationData)),
	components: v.object({
		schemas: v.object({
			Error: v.object({
				properties: v.object({
					error: v.object({
						properties: v.object({ resolution: v.unknown() }),
					}),
				}),
			}),
		}),
	}),
});
const statusData = v.object({ status: v.string() });
const productData = v.object({ products: v.array(v.unknown()) });
const errorData = v.object({
	error: v.object({ code: v.string(), resolution: v.unknown() }),
});
const initializedData = v.object({ result: v.object({ protocolVersion: v.string() }) });
const toolsData = v.object({
	result: v.object({ tools: v.array(v.object({ name: v.string() })) }),
});
const invokedData = v.object({ result: v.object({ structuredContent: productData }) });

async function call(pathname: string, method: string, body?: unknown): Promise<RecordedResponse> {
	const response = await handleApi(
		new Request(new URL(pathname, "https://localstudio.ai"), {
			method,
			headers: { "Content-Type": "application/json" },
			body: body === undefined ? null : JSON.stringify(body),
		}),
		pathname,
	);
	return { statusCode: response.status, headers: response.headers, body: await response.text() };
}

test("homepage shell has complete metadata and no raw style block", () => {
	const html = readFileSync("index.html", "utf8");
	expect(html).toContain('<div id="root"></div>');
	expect(html).not.toContain("<style");
	expect(html).toContain('property="og:image"');
	expect(html).toContain('property="og:type" content="website"');
	const jsonLd = v.parse(
		linkedData,
		JSON.parse(
			html.match(/<script type="application\/ld\+json">([\s\S]+?)<\/script>/)?.[1] ?? "null",
		),
	);
	const organization = v.parse(
		organizationData,
		jsonLd["@graph"].find((entry) => entry["@type"] === "Organization"),
	);
	expect(organization.name).toBe("Sybil Solutions");
	expect(organization.description).toBeTruthy();
	expect(organization.contactPoint.email).toContain("@");
	expect(organization.address["@type"]).toBe("PostalAddress");
});

test("OpenAPI is typed and function-calling compatible", () => {
	const document = agentDocument("/openapi.json");
	expect(document?.contentType).toContain("application/json");
	const spec = v.parse(openApiData, JSON.parse(document?.body ?? "null"));
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
		const text = (document?.body ?? "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		expect(text.length, path).toBeGreaterThan(500);
		expect(document?.body, path).toContain("<h1>");
	}
});

test("REST handlers return typed success and JSON errors", async () => {
	const status = await call("/api/v1/status", "GET");
	expect(status.statusCode).toBe(200);
	expect(status.headers.get("content-type")).toContain("application/json");
	expect(v.parse(statusData, JSON.parse(status.body)).status).toBe("ok");
	const products = await call("/api/v1/products", "GET");
	expect(v.parse(productData, JSON.parse(products.body)).products).toHaveLength(3);
	const method = await call("/api/v1/status", "POST");
	expect(method.statusCode).toBe(405);
	expect(v.parse(errorData, JSON.parse(method.body)).error.resolution).toBeTruthy();
	const missing = await call("/api/v1/missing", "GET");
	expect(missing.statusCode).toBe(404);
	expect(v.parse(errorData, JSON.parse(missing.body)).error.code).toBe("not_found");
});

test("MCP supports initialize, tools/list, and tools/call", async () => {
	const initialize = await call("/.well-known/mcp", "POST", {
		jsonrpc: "2.0",
		id: 1,
		method: "initialize",
		params: {
			protocolVersion: "2025-06-18",
			capabilities: {},
			clientInfo: { name: "test", version: "1" },
		},
	});
	expect(initialize.statusCode).toBe(200);
	expect(v.parse(initializedData, JSON.parse(initialize.body)).result.protocolVersion).toBe(
		"2025-06-18",
	);
	const list = await call("/api/mcp", "POST", {
		jsonrpc: "2.0",
		id: 2,
		method: "tools/list",
		params: {},
	});
	expect(v.parse(toolsData, JSON.parse(list.body)).result.tools.map((tool) => tool.name)).toContain(
		"list_products",
	);
	const invoke = await call("/api/mcp", "POST", {
		jsonrpc: "2.0",
		id: 3,
		method: "tools/call",
		params: { name: "list_products", arguments: {} },
	});
	expect(
		v.parse(invokedData, JSON.parse(invoke.body)).result.structuredContent.products,
	).toHaveLength(3);
});
