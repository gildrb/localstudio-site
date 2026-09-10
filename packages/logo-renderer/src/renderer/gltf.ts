import * as v from "valibot";

export type GltfPrimitive = {
	readonly mode?: number;
	readonly attributes?: { readonly POSITION?: number; readonly NORMAL?: number };
	readonly indices?: number;
};

export type GltfDocument = {
	readonly buffers?: readonly { readonly uri: string }[];
	readonly bufferViews: readonly {
		readonly buffer: number;
		readonly byteOffset?: number;
		readonly byteLength: number;
		readonly byteStride?: number;
	}[];
	readonly accessors: readonly {
		readonly bufferView: number;
		readonly byteOffset?: number;
		readonly componentType: number;
		readonly count: number;
	}[];
	readonly meshes?: readonly { readonly primitives?: readonly GltfPrimitive[] }[];
};

// Validate the glTF fields consumed by the mesh decoder. Other glTF metadata is ignored.
const gltfInteger = v.pipe(
	v.number(),
	v.integer(),
	v.minValue(0),
	v.maxValue(Number.MAX_SAFE_INTEGER),
);
const gltfBuffer = v.object({ uri: v.string() });
const gltfBufferView = v.object({
	buffer: gltfInteger,
	byteOffset: v.exactOptional(gltfInteger),
	byteLength: gltfInteger,
	byteStride: v.exactOptional(gltfInteger),
});
const gltfAccessor = v.object({
	bufferView: gltfInteger,
	byteOffset: v.exactOptional(gltfInteger),
	componentType: gltfInteger,
	count: gltfInteger,
});
const gltfPrimitive = v.object({
	mode: v.exactOptional(gltfInteger),
	attributes: v.exactOptional(
		v.object({ POSITION: v.exactOptional(gltfInteger), NORMAL: v.exactOptional(gltfInteger) }),
	),
	indices: v.exactOptional(gltfInteger),
});
const gltfMesh = v.object({ primitives: v.exactOptional(v.array(gltfPrimitive)) });
const gltfDocument = v.object({
	buffers: v.exactOptional(v.array(gltfBuffer)),
	bufferViews: v.array(gltfBufferView),
	accessors: v.array(gltfAccessor),
	meshes: v.exactOptional(v.array(gltfMesh)),
});

export function parseGltfDocument(source: string): GltfDocument {
	const input: unknown = JSON.parse(source);
	const document: GltfDocument = v.parse(gltfDocument, input);
	validateGltfReferences(document);
	return document;
}

function validateGltfReferences(document: GltfDocument) {
	for (const view of document.bufferViews) {
		if (document.buffers?.[view.buffer] === undefined)
			throw new Error(`Missing glTF buffer ${view.buffer}`);
	}
	for (const accessor of document.accessors) {
		if (document.bufferViews[accessor.bufferView] === undefined)
			throw new Error(`Missing glTF buffer view ${accessor.bufferView}`);
	}
	for (const mesh of document.meshes ?? []) {
		for (const primitive of mesh.primitives ?? []) {
			for (const index of [
				primitive.attributes?.POSITION,
				primitive.attributes?.NORMAL,
				primitive.indices,
			]) {
				if (index !== undefined && document.accessors[index] === undefined)
					throw new Error(`Missing glTF accessor ${index}`);
			}
		}
	}
}
