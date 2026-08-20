export function createManagedObjectUrl(blob: Blob): string {
	const createObjectUrl = URL.createObjectURL.bind(URL);
	const url = createObjectUrl(blob);
	if (typeof window !== "undefined") {
		window.addEventListener("pagehide", () => URL.revokeObjectURL(url), {
			once: true,
		});
	}
	return url;
}
