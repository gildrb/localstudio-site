import { LocalLink } from "./LocalLink";
import type { RoutePath } from "../routing";

const links = [
	["Machines", "/machine"],
	["Mobile", "/mobile"],
	["Docs", "/docs"],
	["Setup", "/setup"],
	["Agents", "/agents"],
	["Download", "/download"],
] as const satisfies readonly (readonly [string, RoutePath])[];

export function Footer() {
	return (
		<footer className="footer">
			<nav className="footer__links" aria-label="Footer navigation">
				{links.map(([label, href]) => (
					<LocalLink href={href} key={href}>
						{label}
					</LocalLink>
				))}
			</nav>
			<span className="footer__copyright">
				© 2026 <span translate="no">Local Studio</span>
			</span>
		</footer>
	);
}
