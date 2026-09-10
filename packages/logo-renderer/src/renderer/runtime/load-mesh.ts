import { decodeGltfMesh } from "../mesh";
import { parseGltfDocument } from "../gltf";

// Owns browser glTF fetch/decode for the Eve logo mesh.
// INVARIANT: dev no-store fetch behavior is preserved for HMR/content updates.
// Imported only by index.tsx startup.

const DEV_FETCH_OPTIONS = { cache: "no-store" } satisfies RequestInit;
const DATA_BUFFER_PREFIX = "data:application/octet-stream;base64,";

function meshFetchOptions() {
	return import.meta.env.PROD ? undefined : DEV_FETCH_OPTIONS;
}

export async function loadMesh(modelUrl: string) {
	const response = await fetch(modelUrl, meshFetchOptions());
	if (!response.ok) throw new Error(`Failed to load ${modelUrl}: ${response.status}`);
	const document = parseGltfDocument(await response.text());
	return decodeGltfMesh(document, (uri) => loadGltfBuffer(uri, modelUrl));
}

async function loadGltfBuffer(uri: string, modelUrl: string) {
	if (uri.startsWith(DATA_BUFFER_PREFIX)) {
		const source = atob(uri.slice(DATA_BUFFER_PREFIX.length));
		return Uint8Array.from(source, (char) => {
			const value = char.codePointAt(0);
			if (value === undefined) throw new Error("Empty glTF buffer byte.");
			return value;
		}).buffer;
	}
	const url = new URL(uri, window.location.origin + modelUrl);
	const response = await fetch(url, meshFetchOptions());
	if (!response.ok)
		throw new Error(`Failed to load glTF buffer ${url.pathname}: ${response.status}`);
	return response.arrayBuffer();
}
