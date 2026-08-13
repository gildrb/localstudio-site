import type { ReactNode } from "react";

interface PageIntroProps {
	actions?: ReactNode;
	aside?: ReactNode;
	children?: ReactNode;
	description: ReactNode;
	id: string;
	layout?: "centered" | "left" | "split";
	title: ReactNode;
}

export function PageIntro({
	actions,
	aside,
	children,
	description,
	id,
	layout = "centered",
	title,
}: PageIntroProps) {
	return (
		<section
			className={`page-intro section-width ${layout !== "centered" ? `page-intro--${layout}` : ""}`}
			aria-labelledby={id}
		>
			<div className="page-intro__content">
				<h1 id={id}>{title}</h1>
				<p>{description}</p>
				{actions ? <div className="hero__actions">{actions}</div> : null}
				{children}
			</div>
			{aside ? <div className="page-intro__aside">{aside}</div> : null}
		</section>
	);
}
