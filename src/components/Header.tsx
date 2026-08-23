import { ChevronDown, Equal, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { assets } from "../domain/asset";
import { site } from "../domain/site";
import { cssVars } from "../system/css-vars";
import { resourceNav } from "../domain/route";
import { DownloadButton } from "./Links";
import { LocalLink } from "./LocalLink";

type NavLink = {
	readonly label: string;
	readonly href: string;
	readonly external?: true;
}

type MenuId = "products" | "resources";

type ChevronProps = {
	open: boolean;
}

type MenuListProps = {
	items: readonly NavLink[];
	onNavigate: () => void;
	className?: string;
	desktop?: boolean;
}

const products = [
	{ label: site.products.localAi.name, href: site.products.localAi.url, external: true },
	{ label: site.products.localStudio.name, href: "/download" },
	{ label: site.products.kittyLitter.name, href: site.products.kittyLitter.url, external: true },
] as const satisfies readonly NavLink[];

const resources = resourceNav().map((item) => ({
	label: item.label,
	href: item.href,
})) satisfies readonly NavLink[];

const menuColumns = {
	products: [products],
	resources: [resources],
} as const satisfies Record<MenuId, readonly (readonly NavLink[])[]>;
const githubUrl = site.products.localStudio.repository;
const mobileQuery = "(max-width: 900px)";

function Chevron({ open }: ChevronProps) {
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
	className = "nav__menu-items",
	desktop = false,
}: MenuListProps) {
	return (
		<ul className={className} role={desktop ? "none" : undefined}>
			{items.map((item) => (
				<li key={item.label} role={desktop ? "none" : undefined}>
					{item.external ? (
						<a
							href={item.href}
							target="_blank"
							rel="noreferrer"
							onClick={onNavigate}
							role={desktop ? "menuitem" : undefined}
						>
							{item.label}
						</a>
					) : (
						<LocalLink
							href={item.href}
							onClick={onNavigate}
							role={desktop ? "menuitem" : undefined}
						>
							{item.label}
						</LocalLink>
					)}
				</li>
			))}
		</ul>
	);
}

function DesktopMenu({
	menu,
	onNavigate,
}: {
	menu: MenuId;
	onNavigate: () => void;
}) {
	const label = menu === "products" ? "Products" : "Resources";
	const innerRef = useRef<HTMLDivElement>(null);
	const [offset, setOffset] = useState(0);
	useLayoutEffect(() => {
		function sync() {
			const trigger = document.querySelector<HTMLElement>(
				`[aria-controls="nav-menu-${menu}"]`,
			);
			const inner = innerRef.current;
			const header = inner?.closest<HTMLElement>("header");
			if (!trigger || !inner || !header) return;
			const triggerText =
				trigger.getBoundingClientRect().left -
				inner.getBoundingClientRect().left +
				Number.parseFloat(getComputedStyle(trigger).paddingLeft);
			setOffset(triggerText);
			header.style.setProperty(
				"--nav-mega-height",
				`${Math.ceil(inner.getBoundingClientRect().height)}px`,
			);
		}
		sync();
		window.addEventListener("resize", sync);
		return () => window.removeEventListener("resize", sync);
	}, [menu]);

	return (
		<div
			className="nav__mega nav__menu-panel"
			id={`nav-menu-${menu}`}
			aria-label={`${label} menu`}
			role="menu"
			onKeyDown={(event) => {
				if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
				const items = [
					...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
				];
				if (items.length === 0) return;
				const current = items.findIndex((item) => item === document.activeElement);
				const next =
					event.key === "Home"
						? 0
						: event.key === "End"
							? items.length - 1
							: (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
								items.length;
				event.preventDefault();
				items[next]?.focus();
			}}
		>
			<div className="nav__mega-inner" ref={innerRef}>
				<div
					className="nav__mega-grid"
					style={cssVars({ "--mega-col": `${offset}px` })}
				>
					{menuColumns[menu].map((column) => (
						<section className="nav__mega-section" key={column[0].label}>
							<MenuItems items={column} onNavigate={onNavigate} desktop />
						</section>
					))}
				</div>
			</div>
		</div>
	);
}

export function Header() {
	const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
	const [mobileOpen, setMobileOpen] = useState(false);
	const menusRef = useRef<HTMLElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);
	const sheetRef = useRef<HTMLDialogElement>(null);
	const closeTimerRef = useRef<number | null>(null);
	const sheetId = useId();

	function cancelMenuClose() {
		if (closeTimerRef.current === null) return;
		window.clearTimeout(closeTimerRef.current);
		closeTimerRef.current = null;
	}

	function close() {
		cancelMenuClose();
		setOpenMenu(null);
	}

	function scheduleMenuClose() {
		cancelMenuClose();
		closeTimerRef.current = window.setTimeout(() => {
			setOpenMenu(null);
			closeTimerRef.current = null;
		}, 100);
	}

	useEffect(() => {
		if (!openMenu) return;
		function onPointerDown(event: PointerEvent) {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (!menusRef.current?.contains(target)) {
				setOpenMenu(null);
			}
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				const trigger = menusRef.current?.querySelector<HTMLButtonElement>(
					`[aria-controls="nav-menu-${openMenu}"]`,
				);
				setOpenMenu(null);
				trigger?.focus();
			}
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
			if (media.matches) setOpenMenu(null);
			if (!media.matches) setSheetOpen(false);
		}
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		const header = toggleRef.current?.closest("header");
		function syncNavHeight() {
			if (!(header instanceof HTMLElement)) return;
			root.style.setProperty(
				"--nav-height",
				`${Math.round(header.getBoundingClientRect().height)}px`,
			);
		}
		syncNavHeight();
		window.addEventListener("resize", syncNavHeight);
		return () => {
			window.removeEventListener("resize", syncNavHeight);
			root.classList.remove("nav-open");
		};
	}, []);

	useEffect(() => {
		const main = document.getElementById("content");
		const footer = document.querySelector("footer");
		main?.toggleAttribute("inert", mobileOpen);
		footer?.toggleAttribute("inert", mobileOpen);
		if (!mobileOpen) return;
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setSheetOpen(false);
				toggleRef.current?.focus();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => {
			main?.removeAttribute("inert");
			footer?.removeAttribute("inert");
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [mobileOpen]);

	useEffect(() => {
		const sheet = sheetRef.current;
		if (!sheet) return;
		if (mobileOpen && !sheet.open) sheet.show();
		if (!mobileOpen && sheet.open) sheet.close();
	}, [mobileOpen]);

	function setSheetOpen(open: boolean) {
		document.documentElement.classList.toggle("nav-open", open);
		setMobileOpen(open);
	}

	const closeMobile = () => setSheetOpen(false);

	function menu(id: MenuId, label: string) {
		const open = openMenu === id;
		return (
			<div className="nav__menu">
				<button
					type="button"
					className="nav__menu-trigger"
					aria-haspopup="menu"
					aria-expanded={open}
					aria-controls={`nav-menu-${id}`}
					onClick={(event) =>
						setOpenMenu(event.detail === 0 && open ? null : id)
					}
					onPointerEnter={() => setOpenMenu(id)}
					onKeyDown={(event) => {
						if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
						event.preventDefault();
						setOpenMenu(id);
						window.requestAnimationFrame(() => {
							const items = menusRef.current?.querySelectorAll<HTMLElement>(
								`#nav-menu-${id} [role="menuitem"]`,
							);
							items?.[event.key === "ArrowDown" ? 0 : items.length - 1]?.focus();
						});
					}}
				>
					{label}
					<Chevron open={open} />
				</button>
			</div>
		);
	}

	return (
		<header
			ref={menusRef}
			className={`nav${mobileOpen ? " is-open" : ""}${openMenu ? ` has-menu has-menu--${openMenu}` : ""}`}
			onPointerOver={cancelMenuClose}
			onPointerLeave={scheduleMenuClose}
		>
			<div className="nav__primary">
				<LocalLink
					className="brand"
					href="/"
					aria-label="Local Studio"
					onClick={closeMobile}
					onPointerEnter={close}
				>
					<img
						className="brand__logo"
						src={assets.wordmark}
						alt=""
						width="4667"
						height="525"
						draggable={false}
					/>
				</LocalLink>
				<nav className="nav__links" aria-label="Landing navigation">
					{menu("products", "Products")}
					{menu("resources", "Resources")}
					<a
						href={site.company.url}
						onPointerEnter={close}
					>
						Company
					</a>
				</nav>
			</div>
			<div className="nav__actions">
				<LocalLink
					className="nav__github"
					href={githubUrl}
					target="_blank"
					rel="noreferrer"
					aria-label="Local Studio on GitHub"
					onPointerEnter={close}
				>
					<GitHubMark />
				</LocalLink>
				<DownloadButton />
			</div>
			{openMenu ? (
				<DesktopMenu menu={openMenu} onNavigate={close} />
			) : null}
			<button
				ref={toggleRef}
				type="button"
				className="nav__toggle"
				aria-label={mobileOpen ? "Close menu" : "Open menu"}
				aria-expanded={mobileOpen}
				aria-controls={sheetId}
				onClick={() => setSheetOpen(!mobileOpen)}
			>
				{mobileOpen ? (
					<X size={22} strokeWidth={1.5} aria-hidden="true" />
				) : (
					<Equal size={22} strokeWidth={1.5} aria-hidden="true" />
				)}
			</button>
			<dialog
				id={sheetId}
				ref={sheetRef}
				className="nav__sheet"
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
						<MenuItems
							items={products}
							onNavigate={closeMobile}
							className="nav__sheet-items"
						/>
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
						<MenuItems
							items={resources}
							onNavigate={closeMobile}
							className="nav__sheet-items"
						/>
					</details>
					<a
						className="nav__sheet-link"
						href={site.company.url}
						onClick={closeMobile}
					>
						Company
					</a>
				</nav>
				<div className="nav__sheet-actions">
					<LocalLink
						className="button"
						href="/download"
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
			</dialog>
		</header>
	);
}
