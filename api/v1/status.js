import { methodNotAllowed, sendJson, status } from "../_shared.js";

export default function handler(request, response) {
	if (request.method !== "GET") return methodNotAllowed(response);
	return sendJson(response, 200, status);
}
