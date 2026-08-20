import type { PreviewKind } from "../filesystem-types";

function previewKindForPath(path: string): PreviewKind | null {
	if (/\.(html?|svg)$/i.test(path)) return "html";
	if (/\.(jsx|tsx)$/i.test(path)) return "jsx";
	if (/\.(md|mdx|markdown)$/i.test(path)) return "md";
	if (/\.(png|jpe?g|gif|webp|avif|bmp|ico|apng)$/i.test(path)) return "image";
	if (/\.pdf$/i.test(path)) return "pdf";
	return null;
}

export function previewKindForOpenFile(
	openFile: string | null,
): PreviewKind | null {
	return openFile ? previewKindForPath(openFile) : null;
}

export function isBinaryPreviewKind(
	kind: PreviewKind | null,
): kind is "image" | "pdf" {
	return kind === "image" || kind === "pdf";
}

export function rawFileUrl(root: string, relPath: string): string {
	return `/api/agent/fs/raw?cwd=${encodeURIComponent(root)}&path=${encodeURIComponent(relPath)}`;
}
