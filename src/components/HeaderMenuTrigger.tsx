import * as stylex from "@stylexjs/stylex";
import { ChevronDown } from "lucide-react";
import type { MouseEvent } from "react";
import { baseStyles } from "../styles/base-styles";
import { headerStyles } from "../styles/header-styles";
import type { MenuId } from "../domain/nav";
import type { DesktopControls, MenuKeyEvent } from "./header-navigation";

function Chevron({ open }: { readonly open: boolean }) {
	return (
		<ChevronDown
			size={14}
			strokeWidth={1.25}
			aria-hidden="true"
			{...stylex.props(headerStyles.chevron, open && headerStyles.chevronOpen)}
		/>
	);
}

export function HeaderMenuTrigger({
	id,
	label,
	open,
	controls,
}: {
	readonly id: MenuId;
	readonly label: string;
	readonly open: boolean;
	readonly controls: DesktopControls;
}) {
	return (
		<div {...stylex.props(baseStyles.element, headerStyles.menu)}>
			<button
				type="button"
				{...stylex.props(
					baseStyles.element,
					baseStyles.interactive,
					baseStyles.focusable,
					baseStyles.button,
					headerStyles.menuTrigger,
					stylex.defaultMarker(),
					open && headerStyles.menuTriggerOpen,
				)}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={`nav-menu-${id}`}
				onClick={(event: Readonly<Pick<MouseEvent<HTMLButtonElement>, "detail">>) => {
					controls.activate(id, event.detail);
				}}
				onPointerEnter={() => {
					controls.enter(id);
				}}
				onKeyDown={(event: MenuKeyEvent) => {
					controls.keyDown(id, event);
				}}
			>
				<span
					{...stylex.props(baseStyles.element, headerStyles.triggerSurface)}
					aria-hidden="true"
				/>
				{label}
				<Chevron open={open} />
			</button>
		</div>
	);
}
