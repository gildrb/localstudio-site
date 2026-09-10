import * as stylex from "@stylexjs/stylex";
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import type { MenuId } from "../domain/nav";
import { menuColumns } from "./header-content";
import { MenuItems } from "./HeaderMenuItems";

function useMenuOffset(menu: MenuId) {
	const innerRef = useRef<HTMLDivElement>(null);
	const [offset, setOffset] = useState(0);
	useLayoutEffect(() => {
		function sync() {
			const trigger = document.querySelector<HTMLElement>(`[aria-controls="nav-menu-${menu}"]`);
			const inner = innerRef.current;
			if (!trigger || !inner) return;
			const triggerText =
				trigger.getBoundingClientRect().left -
				inner.getBoundingClientRect().left +
				Number.parseFloat(getComputedStyle(trigger).paddingLeft);
			setOffset(triggerText);
		}
		sync();
		window.addEventListener("resize", sync);
		return () => {
			window.removeEventListener("resize", sync);
		};
	}, [menu]);
	return { innerRef, offset } as const;
}

function navigateMenu(
	event: Readonly<Pick<KeyboardEvent<HTMLDivElement>, "key" | "preventDefault">> & {
		readonly currentTarget: Readonly<Pick<HTMLDivElement, "querySelectorAll">>;
	},
) {
	if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
	const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')];
	if (items.length === 0) return;
	const activeElement = document.activeElement;
	const current = activeElement instanceof HTMLElement ? items.indexOf(activeElement) : -1;
	const next =
		event.key === "Home"
			? 0
			: event.key === "End"
				? items.length - 1
				: (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
	event.preventDefault();
	items[next]?.focus();
}

export function DesktopMenu({
	menu,
	onNavigate,
}: {
	readonly menu: MenuId;
	readonly onNavigate: () => void;
}) {
	const label = menu === "products" ? "Products" : "Resources";
	const { innerRef, offset } = useMenuOffset(menu);

	return (
		<div
			{...stylex.props(
				baseStyles.element,
				headerStyles.mega,
				menu === "resources" && headerStyles.megaResources,
			)}
			id={`nav-menu-${menu}`}
			aria-label={`${label} menu`}
			role="menu"
			onKeyDown={navigateMenu}
		>
			<div {...stylex.props(baseStyles.element, headerStyles.megaInner)} ref={innerRef}>
				<div {...stylex.props(baseStyles.element, headerStyles.megaGrid(offset))}>
					{menuColumns[menu].map((column) => (
						<section
							{...stylex.props(baseStyles.element, headerStyles.megaSection)}
							key={column[0]?.label ?? menu}
						>
							<MenuItems items={column} onNavigate={onNavigate} desktop />
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
