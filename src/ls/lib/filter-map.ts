type Falsy = false | 0 | "" | null | undefined;

export function filterMap<T, R>(
	values: readonly T[],
	transform: (value: T, index: number) => R | Falsy,
): R[] {
	const result: R[] = [];
	for (let index = 0; index < values.length; index += 1) {
		if (!(index in values)) continue;
		const transformed = transform(values[index], index);
		if (transformed) result.push(transformed);
	}
	return result;
}
