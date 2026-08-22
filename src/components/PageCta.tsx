import type { ReactNode } from "react";
import { CtaPair } from "./Links";

interface PageCtaProps {
	id: string;
	title?: string;
	actions?: ReactNode;
}

const container = "mx-auto w-[min(1399px,calc(100%_-_48px))]";

export function PageCta({
	id,
	title = "AI that stays yours",
	actions,
}: PageCtaProps) {
	return (
		<section className={`${container} page-cta`} aria-labelledby={id}>
			<div>
				<h2 id={id}>{title}</h2>
				<div className="hero__actions">
					{actions ?? (
						<CtaPair secondary={{ href: "/setup", label: "Setup prompt" }} />
					)}
				</div>
			</div>
		</section>
	);
}
