import { useEffect, useRef, useState } from "react";
import { LocalLink } from "./LocalLink";

const products = [
	{ label: "Local AI", href: "https://local.ai", external: true },
	{ label: "Local Studio", href: "/download/macos" },
	{ label: "KittyLitter", href: "https://kittylitter.app", external: true },
];

const resources = [
	{ label: "Overview", href: "/resources" },
	{ label: "Setup prompt", href: "/prompt" },
	{ label: "Agent setup", href: "/agents" },
	{ label: "GitHub", href: "https://github.com/sybil-solutions/local-studio", external: true },
];

const githubUrl = "https://github.com/sybil-solutions/local-studio";

function Chevron({ open }: { open: boolean }) {
	return (
		<svg
			viewBox="0 0 16 16"
			height="14"
			width="14"
			aria-hidden="true"
			fill="none"
			stroke="currentColor"
			strokeWidth="0.75"
			className={open ? "nav__chevron is-open" : "nav__chevron"}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="m12.06 6.75-.53.53-2.82 2.82a1 1 0 0 1-1.42 0L4.47 7.28l-.53-.53L5 5.69l.53.53L8 8.69l2.47-2.47.53-.53z"
				clipRule="evenodd"
			/>
		</svg>
	);
}

function MenuItems({
	items,
	onNavigate,
}: {
	items: typeof products;
	onNavigate: () => void;
}) {
	return (
		<div className="nav__menu-items">
			{items.map((item) =>
				item.external ? (
					<a role="menuitem" href={item.href} key={item.label} target="_blank" rel="noreferrer">
						{item.label}
					</a>
				) : (
					<LocalLink role="menuitem" href={item.href} key={item.label} onClick={onNavigate}>
						{item.label}
					</LocalLink>
				),
			)}
		</div>
	);
}

export function Header() {
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const menusRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!openMenu) return;
		function onPointerDown(event: PointerEvent) {
			if (!menusRef.current?.contains(event.target as Node)) {
				setOpenMenu(null);
			}
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") setOpenMenu(null);
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [openMenu]);

	const close = () => setOpenMenu(null);

	function menu(id: string, label: string, items: typeof products) {
		const open = openMenu === id;
		return (
			<div
				className="nav__menu"
				onPointerLeave={() => setOpenMenu((current) => (current === id ? null : current))}
			>
				<button
					type="button"
					className="nav__menu-trigger"
					aria-haspopup="menu"
					aria-expanded={open}
					onClick={() => setOpenMenu(open ? null : id)}
					onPointerEnter={() => setOpenMenu(id)}
				>
					{label}
					<Chevron open={open} />
				</button>
				{open ? (
					<div className="nav__menu-panel" role="menu" aria-label={label}>
						<MenuItems items={items} onNavigate={close} />
					</div>
				) : null}
			</div>
		);
	}

	return (
		<header className="nav">
			<LocalLink className="brand" href="/" aria-label="Local Studio">
				<img
					className="brand__logo"
					src="/images/localstudio-logo.svg"
					alt=""
					width="4667"
					height="525"
				/>
			</LocalLink>
			<nav className="nav__links" aria-label="Landing navigation" ref={menusRef}>
				{menu("products", "Products", products)}
				{menu("resources", "Resources", resources)}
				<a href="https://www.sybilsolutions.ai/">Company</a>
				<LocalLink className="nav__github" href={githubUrl} target="_blank" rel="noreferrer" aria-label="Local Studio on GitHub">
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill="currentColor"
							d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.56v-2.23c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.58-.29-5.29-1.29-5.29-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.4-2.72 5.38-5.31 5.67.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"
						/>
					</svg>
				</LocalLink>
			</nav>
		</header>
	);
}
