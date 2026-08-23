import { assets } from "../domain/asset";
const SPONSORS = [
	{ name: "NVIDIA", src: assets.sponsorNvidia, width: 112, height: 21 },
	{ name: "Factory", src: assets.sponsorFactory, width: 140, height: 21 },
	{ name: "Lambda", src: assets.sponsorLambda, width: 98, height: 21 },
	{
		name: "Prime Intellect",
		src: assets.sponsorPrime,
		width: 162,
		height: 27,
	},
	{
		name: "TNG Technology Consulting",
		src: assets.sponsorTng,
		width: 143,
		height: 21,
	},
];

export function Sponsors() {
	return (
		<section
			className="sponsors section-width"
			aria-labelledby="sponsors-title"
		>
			<p id="sponsors-title" className="sponsors__title">
				Supporters of Sybil Solutions
			</p>
			<ul className="sponsors__list">
				{SPONSORS.map(({ name, src, width, height }) => (
					<li key={name}>
						<img
							src={src}
							alt={name}
							style={{ width, height }}
							draggable={false}
						/>
					</li>
				))}
			</ul>
		</section>
	);
}
