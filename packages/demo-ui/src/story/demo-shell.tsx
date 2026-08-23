import type { ReactNode } from "react";
import { useDemoTabBoundary } from "../hooks/demo-tab-boundary";
import { DEMO_HEIGHT, DEMO_WIDTH, useDemoFrame, type DemoCrop } from "./demo-frame";
import type { FeatureScene } from "./scenes";

export function DemoShell({
	label,
	scene,
	crop,
	children,
}: {
	label: string;
	scene: FeatureScene;
	crop: DemoCrop;
	children: ReactNode;
}) {
	const { hostRef, mobile, scale, shiftX, shiftY, cropH } = useDemoFrame(crop);
	useDemoTabBoundary(hostRef);
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
						transform: `scale(${scale}) translate(${shiftX}px, ${shiftY}px)`,
						transformOrigin: "top left",
					}}
				>
					<main className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-(--agent-bg)">
						{children}
					</main>
				</div>
			</div>
		</section>
	);
}
