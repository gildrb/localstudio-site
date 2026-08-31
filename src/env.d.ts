/// <reference path="../packages/logo-renderer/env.d.ts" />
/// <reference types="@vgpu/wgsl/wgsl-types" />

declare module "*?raw" {
	const content: string;
	export default content;
}

declare module "*.css";
