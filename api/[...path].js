import { sendJson } from "./_shared.js";

export default function handler(_request, response) {
	return sendJson(response, 404, { error: { code: "not_found", message: "The requested API endpoint does not exist.", resolution: "Read /openapi.json or /developers for supported endpoints.", documentation: "https://localstudio.ai/developers" } });
}
