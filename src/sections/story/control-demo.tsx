import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/formatters";
import { TokenActivityHeatmap } from "@/features/usage/token-activity-heatmap";
import { STORY_CROP } from "./demo-frame";
import { DemoShell } from "./demo-shell";

function demoDays(): Array<{
	date: string;
	requests: number;
	total_tokens: number;
}> {
	const days = [];
	const end = new Date(Date.UTC(2026, 7, 18));
	for (let offset = 120; offset >= 0; offset -= 1) {
		const day = new Date(end);
		day.setUTCDate(end.getUTCDate() - offset);
		const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
		const wave = (offset * 17) % 23;
		const active = !weekend && wave > 3;
		days.push({
			date: day.toISOString().slice(0, 10),
			requests: active ? 12 + wave : 0,
			total_tokens: active ? 4200 + wave * 380 : 0,
		});
	}
	return days;
}

const DAYS = demoDays();

export function ControlDemo() {
	const [tokens, setTokens] = useState(1_186_400);
	const [requests, setRequests] = useState(2140);
	const [sessions, setSessions] = useState(86);

	useEffect(() => {
		const id = window.setInterval(() => {
			setTokens((value) => Math.min(1_284_200, value + 2400));
			setRequests((value) => Math.min(2288, value + 3));
			setSessions((value) => Math.min(94, value + 1));
		}, 180);
		return () => window.clearInterval(id);
	}, []);

	return (
		<DemoShell
			scene="control"
			pathname="/usage"
			label="Usage controller"
			crop={STORY_CROP}
		>
			<div className="min-h-0 flex-1 overflow-hidden px-8 py-7">
				<h3 className="text-[length:var(--fs-xl)] font-medium">Usage</h3>
				<p className="mt-1 text-[length:var(--fs-sm)] text-(--dim)">
					Proxied through this controller
				</p>
				<p className="mt-8 text-[3.5rem] font-medium leading-none tracking-[-0.055em] tabular-nums">
					{formatNumber(tokens)}
				</p>
				<dl className="mt-8 flex gap-10">
					<Stat label="Requests" value={formatNumber(requests)} />
					<Stat label="Sessions" value={formatNumber(sessions)} />
					<Stat label="Active days" value="86" />
				</dl>
				<section className="mt-10 max-w-[32rem]">
					<h4 className="mb-4 text-[length:var(--fs-md)] font-medium">Token activity</h4>
					<TokenActivityHeatmap daily={DAYS} period="daily" />
				</section>
			</div>
		</DemoShell>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="text-left">
			<dd className="text-[length:var(--fs-lg)] font-medium tabular-nums">
				{value}
			</dd>
			<dt className="mt-0.5 text-[length:var(--fs-xs)] text-(--ui-muted)">
				{label}
			</dt>
		</div>
	);
}
