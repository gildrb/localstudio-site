export type ButtonVariant =
	| "primary"
	| "secondary"
	| "danger"
	| "ghost"
	| "icon";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-(--color-primary) text-(--color-primary-foreground) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
	secondary:
		"bg-(--ui-fg)/5 text-(--ui-fg) hover:bg-(--ui-fg)/10 active:bg-(--ui-fg)/12 disabled:opacity-50",
	danger:
		"bg-(--ui-danger) text-(--destructive-foreground) hover:bg-(--ui-danger)/90 disabled:cursor-not-allowed disabled:opacity-50",
	ghost:
		"text-(--ui-muted) hover:bg-(--ui-fg)/[0.07] hover:text-(--ui-fg) disabled:opacity-50",
	icon: "text-(--ui-muted) hover:bg-(--ui-hover) hover:text-(--ui-fg) disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "h-7 px-3 text-[length:var(--fs-sm)]",
	md: "h-8 px-3.5 text-[length:var(--fs-base)]",
	lg: "h-9 px-4 text-[length:var(--fs-base)]",
};

const iconSizeClasses: Record<ButtonSize, string> = {
	sm: "h-7 w-7",
	md: "h-8 w-8",
	lg: "h-9 w-9",
};

const baseClasses =
	"inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-[transform,color,background-color,border-color,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) active:scale-[0.98]";

export function buttonClasses(
	variant: ButtonVariant,
	size: ButtonSize,
): string {
	const sizeClass =
		variant === "icon" ? iconSizeClasses[size] : sizeClasses[size];
	return `${baseClasses} ${variantClasses[variant]} ${sizeClass}`;
}
