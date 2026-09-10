import fs from "node:fs";

interface MeshAttribute extends Readonly<Pick<Float32Array, number | "length" | "byteLength">> {
	readonly buffer: Readonly<ArrayBuffer>;
}
export interface Mesh {
	readonly positions: MeshAttribute;
	readonly normals: MeshAttribute;
	readonly indices: MeshAttribute;
}
interface GltfOptions {
	readonly outGltf: string;
	readonly outBin: string;
	readonly binUri: string;
	readonly generator: string;
	readonly name: string;
	readonly check: boolean;
}

function meshBounds(positions: ArrayLike<number>) {
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	for (let i = 0; i < positions.length; i += 3) {
		const x = positions[i];
		const y = positions[i + 1];
		const z = positions[i + 2];
		if (x === undefined || y === undefined || z === undefined)
			throw new Error("Incomplete mesh position");
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
		minZ = Math.min(minZ, z);
		maxZ = Math.max(maxZ, z);
	}
	return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

function meshAccessors(mesh: Mesh) {
	const vertexCount = mesh.positions.length / 3;
	const { min, max } = meshBounds(mesh.positions);
	return [
		{ bufferView: 0, componentType: 5126, count: vertexCount, type: "VEC3", min, max },
		{ bufferView: 1, componentType: 5126, count: vertexCount, type: "VEC3" },
		{ bufferView: 2, componentType: 5125, count: mesh.indices.length, type: "SCALAR" },
	];
}

function gltfBody(mesh: Mesh, options: GltfOptions, bufferLength: number): string {
	const { generator, name, binUri } = options;
	const positionBytes = mesh.positions.byteLength;
	const normalBytes = mesh.normals.byteLength;
	const gltf = {
		asset: { generator, version: "2.0" },
		scene: 0,
		scenes: [{ name: "Scene", nodes: [0] }],
		nodes: [{ mesh: 0, name }],
		meshes: [{ name, primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2 }] }],
		accessors: meshAccessors(mesh),
		bufferViews: [
			{ buffer: 0, byteLength: positionBytes, byteOffset: 0, target: 34962 },
			{ buffer: 0, byteLength: normalBytes, byteOffset: positionBytes, target: 34962 },
			{
				buffer: 0,
				byteLength: mesh.indices.byteLength,
				byteOffset: positionBytes + normalBytes,
				target: 34963,
			},
		],
		buffers: [{ byteLength: bufferLength, uri: binUri }],
	};
	return `${JSON.stringify(gltf, null, "\t")}\n`;
}

function checkOutputs(options: GltfOptions, buffer: ArrayLike<number>, body: string): boolean {
	const { outBin, outGltf } = options;
	const mismatches: string[] = [];
	if (!fs.existsSync(outBin) || !Buffer.from(fs.readFileSync(outBin)).equals(Buffer.from(buffer))) {
		mismatches.push(outBin);
	}
	if (!fs.existsSync(outGltf) || fs.readFileSync(outGltf, "utf8") !== body) {
		mismatches.push(outGltf);
	}
	if (mismatches.length > 0) {
		console.error(`mesh outputs are stale:\n${mismatches.join("\n")}`);
		process.exitCode = 1;
		return false;
	}
	return true;
}

export function writeGltf(mesh: Mesh, options: GltfOptions): void {
	const { outGltf, outBin, name, check } = options;
	const vertexCount = mesh.positions.length / 3;
	const positionBytes = mesh.positions.byteLength;
	const normalBytes = mesh.normals.byteLength;
	const indexBytes = mesh.indices.byteLength;
	const bufferLength = positionBytes + normalBytes + indexBytes;
	const buffer = new Uint8Array(bufferLength);
	buffer.set(new Uint8Array(mesh.positions.buffer, 0, positionBytes), 0);
	buffer.set(new Uint8Array(mesh.normals.buffer, 0, normalBytes), positionBytes);
	buffer.set(new Uint8Array(mesh.indices.buffer, 0, indexBytes), positionBytes + normalBytes);
	const body = gltfBody(mesh, options, bufferLength);
	if (check) {
		if (checkOutputs(options, buffer, body)) {
			console.log(`${name} mesh outputs ok (${bufferLength} bytes, ${vertexCount} vertices)`);
		}
		return;
	}
	fs.writeFileSync(outBin, buffer);
	fs.writeFileSync(outGltf, body);
	console.log(
		`wrote ${outGltf} (${bufferLength} bytes): ${vertexCount} vertices, ${mesh.indices.length / 3} triangles`,
	);
}
