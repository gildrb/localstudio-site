interface FooterProps {
	left?: string;
	right?: string;
}

export function Footer({
	left = "Local Studio",
	right = "Desktop / web / controller / agents",
}: FooterProps) {
	return (
		<footer className="footer">
			<span>{left}</span>
			<span>{right}</span>
		</footer>
	);
}
