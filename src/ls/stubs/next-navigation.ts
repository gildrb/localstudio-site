export function usePathname(): string {
	return "/agent";
}

export function useRouter(): {
	push: (href: string) => void;
	replace: (href: string) => void;
	back: () => void;
	forward: () => void;
} {
	return {
		push() {},
		replace() {},
		back() {},
		forward() {},
	};
}

export function useSearchParams(): URLSearchParams {
	return new URLSearchParams();
}
