export function stableContentKeys(values: readonly string[]): string[] {
	const occurrences = new Map<string, number>();
	return values.map((value) => {
		const occurrence = occurrences.get(value) ?? 0;
		occurrences.set(value, occurrence + 1);
		return `${value}\u0000${occurrence}`;
	});
}
