import { LocalLink } from "./LocalLink";

const links = [
	{ label: "Product", href: "/#product", className: "nav__optional-small" },
	{ label: "Mobile", href: "/mobile" },
	{ label: "Docs", href: "/docs" },
	{ label: "Setup", href: "/prompt", className: "nav__setup" },
	{ label: "Media", href: "/#media", className: "nav__optional" },
	{ label: "Agents", href: "/agents", className: "nav__optional" },
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
			<LocalLink className="brand" href="/" aria-label="Local Studio">
				<img
					className="brand__logo"
					src="/images/localstudio-logo.svg"
					alt=""
					width="4667"
					height="525"
				/>
			</LocalLink>
			<nav className="nav__links" aria-label="Landing navigation">
				{links.map((link) => (
					<LocalLink
						className={link.className}
						href={link.href}
						key={link.label}
						target={link.external ? "_blank" : undefined}
						rel={link.external ? "noreferrer" : undefined}
					>
						{link.label}
					</LocalLink>
				))}
			</nav>
		</header>
	);
}
