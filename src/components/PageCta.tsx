import type { ReactNode } from "react";
import { CtaPair } from "./Links";

export function PageCta({
	id,
	title = "AI that stays yours",
	actions,
	variant = "page",
}: {
	id: string;
	title?: string;
	actions?: ReactNode;
	variant?: "page" | "home";
}) {
	const className =
		variant === "home"
			? "final-callout page-cta section-width"
			: "page-cta section-width";
	return (
		<section
			id={variant === "home" ? "downloads" : undefined}
			className={className}
			aria-labelledby={id}
		>
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
