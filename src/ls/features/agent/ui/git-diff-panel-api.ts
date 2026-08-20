import { safeJson } from "../safe-json";

type ChecksSummary = {
	pending: number;
	passing: number;
	failing: number;
	total: number;
};

export type PullRequest = {
	number: number;
	title: string;
	url: string;
	state: string;
	isDraft: boolean;
	headRefName: string;
	baseRefName: string;
	additions: number;
	deletions: number;
	mergeable: string;
	checksSummary: ChecksSummary;
};

export type PrPayload = { pr?: PullRequest; error?: string };
export type MergeMethod = "merge" | "squash" | "rebase";

export async function loadPr(cwd: string): Promise<PrPayload> {
	const response = await fetch(`/api/agent/pr?cwd=${encodeURIComponent(cwd)}`, {
		cache: "no-store",
	});
	const payload = await safeJson<PrPayload>(response);
	if (!response.ok)
		throw new Error(payload.error || "Failed to load pull request");
	return payload;
}

export async function mergePr(
	cwd: string,
	number: number,
	method: MergeMethod,
): Promise<void> {
	const response = await fetch("/api/agent/pr/merge", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ cwd, number, method }),
	});
	const payload = await safeJson<{ ok?: boolean; error?: string }>(response);
	if (!response.ok || payload.error)
		throw new Error(payload.error || "Merge failed");
}
