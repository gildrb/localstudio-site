interface LogoMarkProps {
	className?: string;
}

export function LogoMark({ className = "" }: LogoMarkProps) {
	return (
		<span className={`logo-mark ${className}`} aria-hidden="true">
			<span className="logo-mark__orbit">
				<span />
				<span />
			</span>
			<span className="logo-mark__core" />
		</span>
	);
}
