export function responsiveSrcSet(path: string) {
	const base = path.replace(/\.png$/, "");
	return `${base}-800.png 800w, ${base}-1300.png 1300w, ${base}-2600.png 2600w`;
}

export const heroSizes = "min(1399px, calc(100vw - 48px))";
export const storySizes = "(min-width: 900px) 835px, calc(100vw - 48px)";
export const frameSizes = "(min-width: 900px) 790px, calc(100vw - 48px)";
