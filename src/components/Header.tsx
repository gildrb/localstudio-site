import { LocalLink } from "./LocalLink";

const links = [
	{ label: "Product", href: "/#product", className: "nav__optional-small" },
	{ label: "Mobile", href: "/mobile" },
	{ label: "Docs", href: "/docs" },
	{ label: "Setup", href: "/prompt", className: "nav__setup" },
	{ label: "Media", href: "/#media", className: "nav__optional" },
	{ label: "Agents", href: "/agents", className: "nav__optional" },
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
					<LocalLink className={link.className} href={link.href} key={link.label}>
						{link.label}
					</LocalLink>
				))}
				<LocalLink
					className="nav__github"
					href="https://github.com/sybil-solutions/local-studio"
					target="_blank"
					rel="noreferrer"
					aria-label="Local Studio on GitHub"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.56v-2.23c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.58-.29-5.29-1.29-5.29-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.4-2.72 5.38-5.31 5.67.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"
						/>
					</svg>
				</LocalLink>
			</nav>
		</header>
	);
}
