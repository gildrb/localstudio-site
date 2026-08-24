import { assets } from "../domain/asset";

export function BrandLogo() {
	return (
		<img
			className="brand__logo"
			src={assets.wordmark}
			alt=""
			width="3000"
			height="566"
			draggable={false}
		/>
	);
}
