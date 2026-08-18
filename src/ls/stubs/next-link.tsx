import type { AnchorHTMLAttributes, ReactNode } from "react";

interface NextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string;
	children?: ReactNode;
	prefetch?: boolean;
}

export default function Link({
	href,
	children,
	className,
	onClick,
	title,
}: NextLinkProps) {
	return (
		<a
			href={href}
			className={className}
			title={title}
			onClick={(event) => {
				event.preventDefault();
				onClick?.(event);
			}}
		>
			{children}
		</a>
	);
}
