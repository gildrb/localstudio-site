import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-shell.styles.ts";
import { demoStyles } from "../styles/demo-root.styles.ts";
import type { ReactNode } from "react";
import { useDemoTabBoundary } from "../hooks/demo-tab-boundary";
import { DEMO_HEIGHT, useDemoFrame, type DemoCrop } from "./demo-frame";
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
			{...stylex.props(demoStyles.reset, demoStyles.root, mobile && demoStyles.mobile)}
			data-theme="zai-dark"
			data-scene={scene}
			aria-label={label}
		>
			<div
				{...stylex.props(demoStyles.reset, styles.demoViewport, demoStyles.viewport, demoStyles.mobileViewport, demoStyles.viewportHeight(mobile ? cropH * scale : DEMO_HEIGHT * Math.min(scale, 1)))}
			>
				<div
					{...stylex.props(demoStyles.reset, styles.demoApp, demoStyles.app, demoStyles.storyAppTransform(scale, shiftX, shiftY))}
				>
					<div {...stylex.props(demoStyles.reset, styles.div42)}>
						{children}
					</div>
				</div>
			</div>
		</section>
	);
}
