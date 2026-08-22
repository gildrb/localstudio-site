const SPONSORS = [
	{ name: "NVIDIA", src: "/images/sponsors/nvidia.svg", width: 112, height: 21 },
	{ name: "Factory", src: "/images/sponsors/factory.svg", width: 140, height: 21 },
	{ name: "Lambda", src: "/images/sponsors/lambda.svg", width: 98, height: 21 },
	{
		name: "Prime Intellect",
		src: "/images/sponsors/prime-intellect.svg",
		width: 162,
		height: 27,
	},
	{
		name: "TNG Technology Consulting",
		src: "/images/sponsors/tng.svg",
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
