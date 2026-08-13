import { LogoMark } from "./LogoMark";

const links = [
	{ label: "Product", href: "#product", className: "nav__optional-small" },
	{ label: "Mobile", href: "https://localstudio.ai/mobile" },
	{ label: "Docs", href: "https://localstudio.ai/docs" },
	{
		label: "Setup",
		href: "https://localstudio.ai/prompt",
		className: "nav__setup",
	},
	{ label: "Media", href: "#media", className: "nav__optional" },
	{
		label: "GitHub",
		href: "https://github.com/sybil-solutions/local-studio",
		className: "nav__optional",
		external: true,
	},
];

export function Header() {
	return (
		<header className="nav">
			<a className="brand" href="#top" aria-label="Local Studio">
				<LogoMark />
				<span>Local Studio</span>
			</a>
			<nav className="nav__links" aria-label="Landing navigation">
				{links.map((link) => (
					<a
						className={link.className}
						href={link.href}
						key={link.label}
						target={link.external ? "_blank" : undefined}
						rel={link.external ? "noreferrer" : undefined}
					>
						{link.label}
					</a>
				))}
			</nav>
		</header>
	);
}
