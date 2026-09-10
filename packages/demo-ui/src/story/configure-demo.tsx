import { styles as poolStyles } from "./configure-pool.styles.ts";
import { styles as rowStyles } from "./configure-machines.styles.ts";
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
				<ConfigureHeader />

				<section {...stylex.props(demoStyles.reset, styles.section48)}>
					<MachinesHeader />

					<div {...stylex.props(demoStyles.reset, styles.div72)}>
						{MACHINES.map((machine, index) => (
							<MachineRow key={machine.name} machine={machine} index={index} />
						))}
					</div>
				</section>

				<DistributedPool />
			</div>
		</DemoShell>
	);
}

function MachineRow({
	machine,
	index,
}: {
	readonly machine: (typeof MACHINES)[number];
	readonly index: number;
}) {
	return (
		<button
			type="button"
			{...stylex.props(
				demoStyles.reset,
				demoStyles.controlReset,
				rowStyles.button77,
				index < MACHINES.length - 1 && rowStyles.rowDivider,
			)}
		>
			<MachineName machine={machine} index={index} />
			<span {...stylex.props(demoStyles.reset, rowStyles.span87)}>
				<strong {...stylex.props(demoStyles.reset, rowStyles.strong97)}>
					{machine.accelerator}
				</strong>
				<span {...stylex.props(demoStyles.reset, rowStyles.span100)}>{machine.system}</span>
			</span>
			<span {...stylex.props(demoStyles.reset, styles.div59)}>
				<span
					{...stylex.props(
						demoStyles.reset,
						rowStyles.statusBadge,
						index === 0 ? rowStyles.statusActive : rowStyles.statusIdle,
					)}
				>
					{machine.status}
				</span>
				<SquarePen
					{...stylex.props(demoStyles.reset, rowStyles.squarepen110, styles.lucideScale)}
				/>
			</span>
		</button>
	);
}

function ConfigureHeader() {
	return (
		<header {...stylex.props(demoStyles.reset)}>
			<h3 {...stylex.props(demoStyles.reset, styles.h327)}>Configure</h3>
			<nav {...stylex.props(demoStyles.reset, styles.nav29)} aria-label="Configure sections">
				<button
					type="button"
					aria-current="page"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button35)}
				>
					<Monitor {...stylex.props(demoStyles.reset, styles.monitor37, styles.lucideScale)} />{" "}
					Machines
				</button>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button41)}
				>
					<Server {...stylex.props(demoStyles.reset, styles.monitor37, styles.lucideScale)} />{" "}
					Server
				</button>
			</nav>
		</header>
	);
}

function MachinesHeader() {
	return (
		<header {...stylex.props(demoStyles.reset, styles.header49)}>
			<div {...stylex.props(demoStyles.reset)}>
				<h4 {...stylex.props(demoStyles.reset, styles.h451)}>Your Machines</h4>
				<p {...stylex.props(demoStyles.reset, styles.p54)}>
					Hardware available to this controller for local and distributed serves.
				</p>
			</div>
			<div {...stylex.props(demoStyles.reset, styles.div59)}>
				<span {...stylex.props(demoStyles.reset, styles.span60)}>2 machines · 112 GB GPU</span>
				<button
					type="button"
					{...stylex.props(demoStyles.reset, demoStyles.controlReset, styles.button65)}
				>
					<Plus {...stylex.props(demoStyles.reset, styles.plus67, styles.lucideScale)} /> Add
				</button>
			</div>
		</header>
	);
}

function DistributedPool() {
	return (
		<section {...stylex.props(demoStyles.reset, poolStyles.section117)}>
			<header {...stylex.props(demoStyles.reset, poolStyles.header118)}>
				<div {...stylex.props(demoStyles.reset)}>
					<h4 {...stylex.props(demoStyles.reset, styles.h451)}>Distributed Serve Pool</h4>
					<p {...stylex.props(demoStyles.reset, styles.p54)}>
						Both machines can cooperate on models that exceed a single node.
					</p>
				</div>
				<span {...stylex.props(demoStyles.reset, styles.span60)}>Ready</span>
			</header>
			<div {...stylex.props(demoStyles.reset, poolStyles.div131)}>
				<div {...stylex.props(demoStyles.reset, poolStyles.div132)}>
					<span {...stylex.props(demoStyles.reset, poolStyles.span133)}>
						<Cpu {...stylex.props(demoStyles.reset, styles.plus67, styles.lucideScale)} /> Capacity
					</span>
					<strong {...stylex.props(demoStyles.reset, poolStyles.strong136)}>112 GB</strong>
				</div>
				<div {...stylex.props(demoStyles.reset, poolStyles.div132, poolStyles.columnDivider)}>
					<span {...stylex.props(demoStyles.reset, poolStyles.span141)}>Controller</span>
					<strong {...stylex.props(demoStyles.reset, poolStyles.strong144)}>
						studio.local:49300
					</strong>
				</div>
				<div {...stylex.props(demoStyles.reset, poolStyles.div132, poolStyles.columnDivider)}>
					<span {...stylex.props(demoStyles.reset, poolStyles.span141)}>Placement</span>
					<strong {...stylex.props(demoStyles.reset, poolStyles.strong152)}>Automatic</strong>
				</div>
			</div>
		</section>
	);
}

function MachineName({
	machine,
	index,
}: {
	readonly machine: (typeof MACHINES)[number];
	readonly index: number;
}) {
	return (
		<span {...stylex.props(demoStyles.reset, rowStyles.span79)}>
			<span {...stylex.props(demoStyles.reset, rowStyles.span80)}>
				{index === 0 ? (
					<Monitor {...stylex.props(demoStyles.reset, rowStyles.monitor82, styles.lucideScale)} />
				) : (
					<Server {...stylex.props(demoStyles.reset, rowStyles.monitor82, styles.lucideScale)} />
				)}
			</span>
			<span {...stylex.props(demoStyles.reset, rowStyles.span87)}>
				<strong {...stylex.props(demoStyles.reset, rowStyles.strong88)}>{machine.name}</strong>
				<span {...stylex.props(demoStyles.reset, rowStyles.span91)}>{machine.description}</span>
			</span>
		</span>
	);
}
