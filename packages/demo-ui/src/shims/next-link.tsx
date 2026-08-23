import type { AnchorHTMLAttributes, ReactNode } from "react";

interface NextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string;
	children?: ReactNode;
	prefetch?: boolean;
}

export default function Link({
	href,
	children,
	prefetch: _prefetch,
	onClick,
	...props
}: NextLinkProps) {
	return (
		<a
			{...props}
			href={href}
			onClick={(event) => {
				event.preventDefault();
				onClick?.(event);
			}}
		>
			{children}
		</a>
	);
}
