const MAX_PROFILE_IMAGE_BYTES = 2_000_000;

export function profileAvatarColor(hue: number): string {
	return `oklch(0.55 0.13 ${hue})`;
}

export function profileImageFromFile(file: File): Promise<string> {
	if (!file.type.startsWith("image/")) throw new Error("Choose an image file");
	if (file.size > MAX_PROFILE_IMAGE_BYTES)
		throw new Error("Choose an image smaller than 2 MB");
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () =>
			typeof reader.result === "string"
				? resolve(reader.result)
				: reject(new Error("Image failed to load"));
		reader.onerror = () => reject(new Error("Image failed to load"));
		reader.readAsDataURL(file);
	});
}
