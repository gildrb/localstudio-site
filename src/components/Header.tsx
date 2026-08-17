import { ChevronDown, Equal, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { LocalLink } from "./LocalLink";

const products = [
	{ label: "Local AI", href: "https://local.ai", external: true },
	{ label: "Local Studio", href: "/download/macos" },
	{ label: "KittyLitter", href: "https://kittylitter.app", external: true },
];

const resources = [
	{ label: "Documentation", href: "/docs" },
	{ label: "Setup", href: "/prompt" },
	{ label: "Agents", href: "/agents" },
	{ label: "Mobile", href: "/mobile" },
	{ label: "Overview", href: "/resources" },
];

const githubUrl = "https://github.com/sybil-solutions/local-studio";
const mobileQuery = "(max-width: 900px)";

function Chevron({ open }: { open: boolean }) {
	return (
		<ChevronDown
			size={14}
			strokeWidth={1.25}
			aria-hidden="true"
			className={open ? "nav__chevron is-open" : "nav__chevron"}
		/>
	);
}

function GitHubMark() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				fill="currentColor"
				d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.11.79-.25.79-.56v-2.23c-3.23.7-3.91-1.37-3.91-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.58-.29-5.29-1.29-5.29-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.4-2.72 5.38-5.31 5.67.42.36.79 1.07.79 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"
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
					<a
						role="menuitem"
						href={item.href}
						key={item.label}
						target="_blank"
						rel="noreferrer"
					>
						{item.label}
					</a>
				) : (
					<LocalLink
						role="menuitem"
						href={item.href}
						key={item.label}
						onClick={onNavigate}
					>
						{item.label}
					</LocalLink>
				),
			)}
		</div>
	);
}

function SheetItems({
	items,
	onNavigate,
}: {
	items: typeof products;
	onNavigate: () => void;
}) {
	return (
		<ul className="nav__sheet-items">
			{items.map((item) => (
				<li key={item.label}>
					{item.external ? (
						<a
							href={item.href}
							target="_blank"
							rel="noreferrer"
							onClick={onNavigate}
						>
							{item.label}
						</a>
					) : (
						<LocalLink href={item.href} onClick={onNavigate}>
							{item.label}
						</LocalLink>
					)}
				</li>
			))}
		</ul>
	);
}

export function Header() {
	const [openMenu, setOpenMenu] = useState<string | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const menusRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	const sheetId = useId();

	useEffect(() => {
		if (!openMenu) return;
		function onPointerDown(event: PointerEvent) {
			// SAFETY: pointerdown event targets are DOM Nodes by specification.
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

	useEffect(() => {
		const media = window.matchMedia(mobileQuery);
		function onChange() {
			if (!media.matches) setMobileOpen(false);
		}
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		const main = document.getElementById("content");
		const footer = document.querySelector("footer");
		const header = toggleRef.current?.closest("header");
		function syncNavHeight() {
			if (!header) return;
			root.style.setProperty("--nav-height", `${Math.round(header.getBoundingClientRect().height)}px`);
		}
		syncNavHeight();
		root.classList.toggle("nav-open", mobileOpen);
		main?.toggleAttribute("inert", mobileOpen);
		footer?.toggleAttribute("inert", mobileOpen);
		if (!mobileOpen) return;
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setMobileOpen(false);
				toggleRef.current?.focus();
			}
		}
		window.addEventListener("resize", syncNavHeight);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			root.classList.remove("nav-open");
			main?.removeAttribute("inert");
			footer?.removeAttribute("inert");
			window.removeEventListener("resize", syncNavHeight);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [mobileOpen]);

	const close = () => setOpenMenu(null);
	const closeMobile = () => setMobileOpen(false);

	function menu(id: string, label: string, items: typeof products) {
		const open = openMenu === id;
		return (
			<div
				className="nav__menu"
				onPointerLeave={() =>
					setOpenMenu((current) => (current === id ? null : current))
				}
			>
				<button
					type="button"
					className="nav__menu-trigger"
					aria-haspopup="menu"
					aria-expanded={open}
					onClick={() => {
						if (open) return;
						setOpenMenu(id);
					}}
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
		<header className={mobileOpen ? "nav is-open" : "nav"}>
			<LocalLink
				className="brand"
				href="/"
				aria-label="Local Studio"
				onClick={closeMobile}
			>
				<img
					className="brand__logo"
					src="/images/localstudio-logo.svg"
					alt=""
					width="4667"
					height="525"
				/>
			</LocalLink>
			<nav
				className="nav__links"
				aria-label="Landing navigation"
				ref={menusRef}
			>
				{menu("products", "Products", products)}
				{menu("resources", "Resources", resources)}
				<a href="https://www.sybilsolutions.ai/">Company</a>
				<LocalLink
					className="nav__github"
					href={githubUrl}
					target="_blank"
					rel="noreferrer"
					aria-label="Local Studio on GitHub"
				>
					<GitHubMark />
				</LocalLink>
			</nav>
			<button
				ref={toggleRef}
				type="button"
				className="nav__toggle"
				aria-label={mobileOpen ? "Close menu" : "Open menu"}
				aria-expanded={mobileOpen}
				aria-controls={sheetId}
				onClick={() => setMobileOpen((open) => !open)}
			>
				{mobileOpen ? (
					<X size={22} strokeWidth={1.5} aria-hidden="true" />
				) : (
					<Equal size={22} strokeWidth={1.5} aria-hidden="true" />
				)}
			</button>
			<div
				id={sheetId}
				ref={sheetRef}
				className="nav__sheet"
				role="dialog"
				aria-modal={mobileOpen || undefined}
				aria-label="Navigation menu"
				aria-hidden={!mobileOpen}
				inert={!mobileOpen || undefined}
			>
				<nav className="nav__sheet-nav" aria-label="Mobile navigation">
					<details name="mobile-nav" className="nav__sheet-group">
						<summary className="nav__sheet-summary">
							Products
							<ChevronDown
								className="nav__sheet-chevron"
								size={20}
								strokeWidth={1.25}
								aria-hidden="true"
							/>
						</summary>
						<SheetItems items={products} onNavigate={closeMobile} />
					</details>
					<details name="mobile-nav" className="nav__sheet-group">
						<summary className="nav__sheet-summary">
							Resources
							<ChevronDown
								className="nav__sheet-chevron"
								size={20}
								strokeWidth={1.25}
								aria-hidden="true"
							/>
						</summary>
						<SheetItems items={resources} onNavigate={closeMobile} />
					</details>
					<a
						className="nav__sheet-link"
						href="https://www.sybilsolutions.ai/"
						onClick={closeMobile}
					>
						Company
					</a>
				</nav>
				<div className="nav__sheet-actions">
					<LocalLink
						className="button"
						href="/download/macos"
						onClick={closeMobile}
					>
						Download for macOS
					</LocalLink>
					<a
						className="text-link"
						href={githubUrl}
						target="_blank"
						rel="noreferrer"
						onClick={closeMobile}
					>
						<GitHubMark />
						GitHub
					</a>
				</div>
			</div>
		</header>
	);
}
