import { useEffect, useState } from "react";
import { DemoShell } from "./demo-shell";

const NODES = [
	{ name: "this Mac", runtime: "MLX", device: "M3 Ultra · 96 GB" },
	{ name: "studio-box", runtime: "vLLM", device: "2× RTX 4090" },
	{ name: "lab-node", runtime: "SGLang", device: "H100 80 GB" },
];

export function ConfigureDemo() {
	const [selected, setSelected] = useState(0);
	useEffect(() => {
		const id = window.setInterval(() => {
			setSelected((index) => (index + 1) % NODES.length);
		}, 1700);
		return () => window.clearInterval(id);
	}, []);

	return (
		<DemoShell
			scene="configure"
			pathname="/configure"
			label="Hardware configuration"
			crop={{ fit: 580, shiftX: -224, cropH: 580 }}
			mobileCrop={{ fit: 580, shiftX: -224, cropH: 580 }}
		>
			<div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
				<h3 className="text-[length:var(--fs-xl)] font-medium">Hardware</h3>
				<p className="mt-1 text-[length:var(--fs-sm)] text-(--dim)">
					Runtimes stay on the machine that owns the weights.
				</p>
				<div className="mt-6 grid gap-3">
					{NODES.map((node, index) => (
						<button
							key={node.name}
							type="button"
							className={`rounded-xl border px-4 py-4 text-left ${
								selected === index
									? "border-(--border) bg-(--active)"
									: "border-transparent bg-(--ui-surface)/60 hover:bg-(--hover)"
							}`}
							onClick={() => setSelected(index)}
						>
							<span className="block text-[length:var(--fs-md)] font-medium">
								{node.name}
							</span>
							<span className="mt-1 block text-[length:var(--fs-sm)] text-(--dim)">
								{node.runtime} · {node.device}
							</span>
						</button>
					))}
				</div>
			</div>
		</DemoShell>
	);
}
