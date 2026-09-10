import {
	methodNotAllowed,
	status,
	sendJson,
	type ApiRequest,
	type ApiResponse,
} from "../_shared.ts";

export default function handler(request: ApiRequest, response: ApiResponse): void {
	if (request.method !== "GET") {
		methodNotAllowed(response);
		return;
	}
	sendJson(response, 200, status);
}
