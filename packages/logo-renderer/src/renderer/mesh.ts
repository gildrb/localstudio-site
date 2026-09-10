import type { Bounds, MeshData } from "./render";
import type { MeshInput, Vec3 } from "./render/types";
import type { GltfDocument, GltfPrimitive } from "./gltf";

const GLTF_MODE_TRIANGLES = 4;
const GL_FLOAT = 5126;
const GL_UNSIGNED_BYTE = 5121;
const GL_UNSIGNED_SHORT = 5123;
const GL_UNSIGNED_INT = 5125;
const POSITION_COMPONENTS = 3;
const NORMAL_COMPONENTS = 3;

export async function decodeGltfMesh(
	gltf: GltfDocument,
	loadBuffer: (uri: string) => Promise<ArrayBufferLike>,
): Promise<MeshData> {
	const buffers = await Promise.all((gltf.buffers ?? []).map((buffer) => loadBuffer(buffer.uri)));
	const positions: number[] = [];
	const normals: number[] = [];
	const indices: number[] = [];

	for (const mesh of gltf.meshes ?? []) {
		for (const primitive of mesh.primitives ?? []) {
			const data = decodePrimitive(buffers, gltf, primitive);
			if (data === null) continue;
			const vertexOffset = positions.length / POSITION_COMPONENTS;
			for (const value of data.positions) positions.push(value);
			for (const value of data.normals) normals.push(value);
			if (data.indices === undefined) {
				for (let i = 0; i < data.positions.length / POSITION_COMPONENTS; i++)
					indices.push(vertexOffset + i);
			} else {
				for (const index of data.indices) indices.push(vertexOffset + index);
			}
		}
	}

	if (positions.length === 0 || indices.length === 0)
		throw new Error("No triangle mesh data found in glTF asset.");

	const positionArray = new Float32Array(positions);
	return {
		positions: positionArray,
		normals: new Float32Array(normals),
		indices: new Uint32Array(indices),
		bounds: meshBounds(positionArray),
	};
}

function decodePrimitive(
	buffers: readonly Readonly<ArrayBufferLike>[],
	gltf: GltfDocument,
	primitive: GltfPrimitive,
) {
	if (primitive.mode !== undefined && primitive.mode !== GLTF_MODE_TRIANGLES) return null;
	const positionAccessorIndex = primitive.attributes?.POSITION;
	const positionAccessor =
		positionAccessorIndex === undefined ? undefined : gltf.accessors[positionAccessorIndex];
	if (positionAccessor === undefined) return null;
	const normalAccessorIndex = primitive.attributes?.NORMAL;
	const normalAccessor =
		normalAccessorIndex === undefined ? undefined : gltf.accessors[normalAccessorIndex];
	const positions = readFloatAccessor(buffers, gltf, positionAccessor, POSITION_COMPONENTS);
	const normals =
		normalAccessor === undefined
			? fallbackNormals(positions)
			: readFloatAccessor(buffers, gltf, normalAccessor, NORMAL_COMPONENTS);
	if (primitive.indices === undefined) return { positions, normals, indices: undefined };
	const indexAccessor = gltf.accessors[primitive.indices];
	if (indexAccessor === undefined) throw new Error("Missing glTF index accessor.");
	return { positions, normals, indices: readIndexAccessor(buffers, gltf, indexAccessor) };
}

export function meshAspect(mesh: MeshInput) {
	const width = mesh.bounds.max[0] - mesh.bounds.min[0];
	const height = mesh.bounds.max[1] - mesh.bounds.min[1];
	return width / height;
}

function accessorSource(
	buffers: readonly Readonly<ArrayBufferLike>[],
	gltf: GltfDocument,
	accessor: GltfDocument["accessors"][number],
) {
	const view = gltf.bufferViews[accessor.bufferView];
	if (view === undefined) throw new Error("Missing glTF buffer view.");
	const buffer = buffers[view.buffer];
	if (buffer === undefined) throw new Error("Missing glTF buffer.");
	const viewOffset = view.byteOffset ?? 0;
	const accessorOffset = accessor.byteOffset ?? 0;
	if (view.byteLength > buffer.byteLength - viewOffset || accessorOffset > view.byteLength)
		throw new Error("glTF accessor exceeds its buffer view.");
	return {
		view,
		buffer,
		byteOffset: viewOffset + accessorOffset,
		availableBytes: view.byteLength - accessorOffset,
	};
}

function readFloatAccessor(
	buffers: readonly Readonly<ArrayBufferLike>[],
	gltf: GltfDocument,
	accessor: GltfDocument["accessors"][number],
	components: number,
) {
	const { view, buffer, byteOffset, availableBytes } = accessorSource(buffers, gltf, accessor);
	if (accessor.componentType !== GL_FLOAT)
		throw new Error(`Unsupported float accessor component type ${accessor.componentType}`);
	const elementBytes = components * Float32Array.BYTES_PER_ELEMENT;
	const stride =
		view.byteStride === undefined || view.byteStride === 0 ? elementBytes : view.byteStride;
	const requiredBytes = accessor.count === 0 ? 0 : (accessor.count - 1) * stride + elementBytes;
	if (stride < elementBytes || requiredBytes > availableBytes)
		throw new Error("glTF float accessor exceeds its buffer view.");
	if (
		view.byteStride === undefined ||
		view.byteStride === 0 ||
		view.byteStride === components * Float32Array.BYTES_PER_ELEMENT
	) {
		return new Float32Array(buffer, byteOffset, accessor.count * components);
	}

	const source = new DataView(buffer, byteOffset, availableBytes);
	const out = new Float32Array(accessor.count * components);
	for (let i = 0; i < accessor.count; i++) {
		for (let component = 0; component < components; component++) {
			out[i * components + component] = source.getFloat32(
				i * view.byteStride + component * Float32Array.BYTES_PER_ELEMENT,
				true,
			);
		}
	}
	return out;
}

function readIndexAccessor(
	buffers: readonly Readonly<ArrayBufferLike>[],
	gltf: GltfDocument,
	accessor: GltfDocument["accessors"][number],
) {
	const { buffer, byteOffset, availableBytes } = accessorSource(buffers, gltf, accessor);
	const bytesPerIndex =
		accessor.componentType === GL_UNSIGNED_BYTE
			? Uint8Array.BYTES_PER_ELEMENT
			: accessor.componentType === GL_UNSIGNED_SHORT
				? Uint16Array.BYTES_PER_ELEMENT
				: Uint32Array.BYTES_PER_ELEMENT;
	if (accessor.count * bytesPerIndex > availableBytes)
		throw new Error("glTF index accessor exceeds its buffer view.");
	if (accessor.componentType === GL_UNSIGNED_BYTE)
		return new Uint8Array(buffer, byteOffset, accessor.count);
	if (accessor.componentType === GL_UNSIGNED_SHORT)
		return new Uint16Array(buffer, byteOffset, accessor.count);
	if (accessor.componentType === GL_UNSIGNED_INT)
		return new Uint32Array(buffer, byteOffset, accessor.count);
	throw new Error(`Unsupported index accessor component type ${accessor.componentType}`);
}

function fallbackNormals(positions: Readonly<Float32Array<Readonly<ArrayBufferLike>>>) {
	const normals = new Float32Array(positions.length);
	for (let i = 0; i < positions.length; i += 9) {
		const ax = positions[i];
		const ay = positions[i + 1];
		const az = positions[i + 2];
		const bx = positions[i + 3];
		const by = positions[i + 4];
		const bz = positions[i + 5];
		const cx = positions[i + 6];
		const cy = positions[i + 7];
		const cz = positions[i + 8];
		if (
			ax === undefined ||
			ay === undefined ||
			az === undefined ||
			bx === undefined ||
			by === undefined ||
			bz === undefined ||
			cx === undefined ||
			cy === undefined ||
			cz === undefined
		)
			throw new Error("Incomplete glTF triangle positions.");
		const normal = faceNormal([ax, ay, az], [bx, by, bz], [cx, cy, cz]);
		normals.set(normal, i);
		normals.set(normal, i + 3);
		normals.set(normal, i + 6);
	}
	return normals;
}

function meshBounds(positions: Readonly<Float32Array<Readonly<ArrayBufferLike>>>): Bounds {
	const min = [
		Number.POSITIVE_INFINITY,
		Number.POSITIVE_INFINITY,
		Number.POSITIVE_INFINITY,
	] satisfies Vec3;
	const max = [
		Number.NEGATIVE_INFINITY,
		Number.NEGATIVE_INFINITY,
		Number.NEGATIVE_INFINITY,
	] satisfies Vec3;
	for (let i = 0; i < positions.length; i += POSITION_COMPONENTS) {
		const x = positions[i];
		const y = positions[i + 1];
		const z = positions[i + 2];
		if (x === undefined || y === undefined || z === undefined)
			throw new Error("Incomplete glTF vertex position.");
		min[0] = Math.min(min[0], x);
		min[1] = Math.min(min[1], y);
		min[2] = Math.min(min[2], z);
		max[0] = Math.max(max[0], x);
		max[1] = Math.max(max[1], y);
		max[2] = Math.max(max[2], z);
	}
	return { min, max };
}

function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
	const ux = b[0] - a[0];
	const uy = b[1] - a[1];
	const uz = b[2] - a[2];
	const vx = c[0] - a[0];
	const vy = c[1] - a[1];
	const vz = c[2] - a[2];
	return normalize3([uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]);
}

function normalize3(v: Vec3): Vec3 {
	const len = Math.hypot(v[0], v[1], v[2]) || 1;
	return [v[0] / len, v[1] / len, v[2] / len];
}
