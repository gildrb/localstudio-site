import { sendJson, type ApiRequest, type ApiResponse } from "./_shared.ts";

export default function handler(_request: ApiRequest, response: ApiResponse): void {
	sendJson(response, 404, {
		error: {
			code: "not_found",
			message: "The requested API endpoint does not exist.",
			resolution: "Read /openapi.json or /developers for supported endpoints.",
			documentation: "https://localstudio.ai/developers",
		},
	});
}
