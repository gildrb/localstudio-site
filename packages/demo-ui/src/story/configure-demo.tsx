import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./configure-demo.styles.ts";
import { Cpu, Monitor, Plus, Server, SquarePen } from "../ui/icon-registry";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

const MACHINES = [
	{
		name: "Mac Studio",
		description: "Apple silicon · studio.local",
		accelerator: "M3 Ultra · 64 GB unified memory",
		system: "256 GB RAM · 32 cores",
		status: "this machine",
	},
	{
		name: "Inference node",
		description: "Linux · gpu-node.local",
		accelerator: "2× NVIDIA RTX 4090 · 48 GB VRAM",
		system: "128 GB RAM · 24 cores",
		status: "worker",
	},
] as const;

export function ConfigureDemo() {
	return (
		<DemoShell scene="configure" label="Configure machines" crop={STORY_CROP}>
			<div {...stylex.props(demoStyles.reset, styles.div25)}>
				<header {...stylex.props(demoStyles.reset)}>
					<h3 {...stylex.props(demoStyles.reset, styles.h327)}>Configure</h3>
					<nav
						{...stylex.props(demoStyles.reset, styles.nav29)}
						aria-label="Configure sections"
					>
						<button
							type="button"
							aria-current="page"
							{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button35)}
						>
							<Monitor {...stylex.props(demoStyles.reset, styles.monitor37, styles.lucideScale)} /> Machines
						</button>
						<button
							type="button"
							{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button41)}
						>
							<Server {...stylex.props(demoStyles.reset, styles.monitor37, styles.lucideScale)} /> Server
						</button>
					</nav>
				</header>

				<section {...stylex.props(demoStyles.reset, styles.section48)}>
					<header {...stylex.props(demoStyles.reset, styles.header49)}>
						<div {...stylex.props(demoStyles.reset)}>
							<h4 {...stylex.props(demoStyles.reset, styles.h451)}>
								Your Machines
							</h4>
							<p {...stylex.props(demoStyles.reset, styles.p54)}>
								Hardware available to this controller for local and distributed
								serves.
							</p>
						</div>
						<div {...stylex.props(demoStyles.reset, styles.div59)}>
							<span {...stylex.props(demoStyles.reset, styles.span60)}>
								2 machines · 112 GB GPU
							</span>
							<button
								type="button"
								{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button65)}
							>
								<Plus {...stylex.props(demoStyles.reset, styles.plus67, styles.lucideScale)} /> Add
							</button>
						</div>
					</header>

					<div {...stylex.props(demoStyles.reset, styles.div72)}>
						{MACHINES.map((machine, index) => (
							<button
								key={machine.name}
								type="button"
								{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button77, index < MACHINES.length - 1 && styles.rowDivider)}
							>
								<span {...stylex.props(demoStyles.reset, styles.span79)}>
									<span {...stylex.props(demoStyles.reset, styles.span80)}>
										{index === 0 ? (
											<Monitor {...stylex.props(demoStyles.reset, styles.monitor82, styles.lucideScale)} />
										) : (
											<Server {...stylex.props(demoStyles.reset, styles.monitor82, styles.lucideScale)} />
										)}
									</span>
									<span {...stylex.props(demoStyles.reset, styles.span87)}>
										<strong {...stylex.props(demoStyles.reset, styles.strong88)}>
											{machine.name}
										</strong>
										<span {...stylex.props(demoStyles.reset, styles.span91)}>
											{machine.description}
										</span>
									</span>
								</span>
								<span {...stylex.props(demoStyles.reset, styles.span87)}>
									<strong {...stylex.props(demoStyles.reset, styles.strong97)}>
										{machine.accelerator}
									</strong>
									<span {...stylex.props(demoStyles.reset, styles.span100)}>
										{machine.system}
									</span>
								</span>
								<span {...stylex.props(demoStyles.reset, styles.div59)}>
									<span
										{...stylex.props(demoStyles.reset, styles.statusBadge, index === 0 ? styles.statusActive : styles.statusIdle)}
									>
										{machine.status}
									</span>
									<SquarePen {...stylex.props(demoStyles.reset, styles.squarepen110, styles.lucideScale)} />
								</span>
							</button>
						))}
					</div>
				</section>

				<section {...stylex.props(demoStyles.reset, styles.section117)}>
					<header {...stylex.props(demoStyles.reset, styles.header118)}>
						<div {...stylex.props(demoStyles.reset)}>
							<h4 {...stylex.props(demoStyles.reset, styles.h451)}>
								Distributed Serve Pool
							</h4>
							<p {...stylex.props(demoStyles.reset, styles.p54)}>
								Both machines can cooperate on models that exceed a single node.
							</p>
						</div>
						<span {...stylex.props(demoStyles.reset, styles.span60)}>
							Ready
						</span>
					</header>
					<div {...stylex.props(demoStyles.reset, styles.div131)}>
						<div {...stylex.props(demoStyles.reset, styles.div132)}>
							<span {...stylex.props(demoStyles.reset, styles.span133)}>
								<Cpu {...stylex.props(demoStyles.reset, styles.plus67, styles.lucideScale)} /> Capacity
							</span>
							<strong {...stylex.props(demoStyles.reset, styles.strong136)}>
								112 GB
							</strong>
						</div>
						<div {...stylex.props(demoStyles.reset, styles.div132, styles.columnDivider)}>
							<span {...stylex.props(demoStyles.reset, styles.span141)}>
								Controller
							</span>
							<strong {...stylex.props(demoStyles.reset, styles.strong144)}>
								studio.local:49300
							</strong>
						</div>
						<div {...stylex.props(demoStyles.reset, styles.div132, styles.columnDivider)}>
							<span {...stylex.props(demoStyles.reset, styles.span141)}>
								Placement
							</span>
							<strong {...stylex.props(demoStyles.reset, styles.strong152)}>
								Automatic
							</strong>
						</div>
					</div>
				</section>
			</div>
		</DemoShell>
	);
}
