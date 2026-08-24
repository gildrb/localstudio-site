import type { ReactNode } from "react";
import { LocalLink } from "./LocalLink";

type TocEntry = readonly [label: string, id: string];

export function DocsLayout({
	toc,
	path,
	label,
	children,
}: {
	toc: readonly TocEntry[];
	path: string;
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="docs-layout section-width">
			<aside className="docs-layout__toc">
				<p className="docs-toc__label">On this page</p>
				<nav className="docs-toc" aria-label={label}>
					<ul className="docs-toc__list">
						{toc.map(([title, id]) => (
							<li key={id}>
								<LocalLink href={`${path}#${id}`}>{title}</LocalLink>
							</li>
						))}
					</ul>
				</nav>
			</aside>
			<article className="docs-prose">{children}</article>
		</div>
	);
}
