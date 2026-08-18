import { UserMessage } from "@/features/agent/ui/timeline/user-message-block";
import { DEMO_PROMPT, DEMO_RESULT } from "../../demo/sequence";
import { DemoShell } from "./demo-shell";

export function WorkDemo() {
	return (
		<DemoShell
			scene="work"
			pathname="/agent"
			label="Local Studio workbench"
			fit={580}
			shiftX={-224}
		>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col px-8 py-7">
				<h3 className="text-[length:var(--fs-xl)] font-medium">
					Proxy health check
				</h3>
				<p className="mt-1 text-[length:var(--fs-sm)] text-(--dim)">
					Qwen3.8-27B · this machine
				</p>
				<div className="mt-6 max-w-[32rem] space-y-4">
					<UserMessage
						message={{ id: "user-1", role: "user", text: DEMO_PROMPT }}
					/>
					<article className="min-w-0">
						<div className="chat-markdown whitespace-pre-wrap">
							{DEMO_RESULT}
						</div>
					</article>
				</div>
			</div>
		</DemoShell>
	);
}
