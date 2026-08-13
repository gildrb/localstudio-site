import { LocalLink } from "./LocalLink";

const links = [
	["Product", "/product"],
	["Mobile", "/mobile"],
	["Docs", "/docs"],
	["Setup", "/prompt"],
	["Agents", "/agents"],
	["Download", "/download/macos"],
] as const;

export function Footer() {
	return (
		<footer className="footer">
			<span>© 2026 Local Studio</span>
			<nav className="footer__links" aria-label="Footer navigation">
				{links.map(([label, href]) => (
					<LocalLink href={href} key={href}>
						{label}
					</LocalLink>
				))}
			</nav>
		</footer>
	);
}
