import type { ReactNode } from "react";
import { HeroDesktopSidebar } from "../hero/desktop-sidebar";
import {
	DEMO_HEIGHT,
	DEMO_WIDTH,
	useDemoFrame,
	type DemoCrop,
} from "./demo-frame";
import type { FeatureScene } from "./scenes";

export function DemoShell({
	pathname,
	label,
	scene,
	crop,
	children,
}: {
	pathname: string;
	label: string;
	scene: FeatureScene;
	crop: DemoCrop;
	children: ReactNode;
}) {
	const { hostRef, mobile, scale, shiftX, shiftY, cropH } = useDemoFrame(crop);
	return (
		<section
			ref={hostRef}
			className="demo ls-app"
			data-theme="zai-dark"
			data-scene={scene}
			aria-label={label}
		>
			<div
				className="demo__viewport"
				style={{
					height: mobile ? cropH * scale : DEMO_HEIGHT * Math.min(scale, 1),
				}}
			>
				<div
					className="demo__app"
					style={{
						width: DEMO_WIDTH,
						height: DEMO_HEIGHT,
						transform: mobile
							? `scale(${scale}) translate(${shiftX}px, ${shiftY}px)`
							: `translate(${shiftX}px, ${shiftY}px) scale(${scale})`,
						transformOrigin: "top left",
					}}
				>
					<HeroDesktopSidebar pathname={pathname} showProjects={false} />
					<main className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-(--agent-bg)">
						{children}
					</main>
				</div>
			</div>
		</section>
	);
}
