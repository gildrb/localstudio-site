import { formatBytes } from "../../../lib/formatters";
import type { ModelDownload } from "../../../lib/types";

export function downloadProgressText(
	download: Pick<ModelDownload, "downloaded_bytes" | "total_bytes">,
): string {
	const total = download.total_bytes ?? 0;
	if (total <= 0)
		return `${formatBytes(download.downloaded_bytes)} / unavailable`;
	const progress = Math.min(
		100,
		Math.round((download.downloaded_bytes / total) * 100),
	);
	return `${formatBytes(download.downloaded_bytes)} / ${formatBytes(total)} · ${progress}%`;
}

export function downloadSpeedText(
	download: Pick<ModelDownload, "speed_bytes_per_second">,
): string | null {
	const speed = download.speed_bytes_per_second ?? 0;
	return speed > 0 ? `${formatBytes(speed)}/s` : null;
}

export function downloadCompletedText(
	download: Pick<ModelDownload, "status" | "completed_at" | "updated_at">,
): string | null {
	if (download.status !== "completed") return null;
	return `done ${download.completed_at || download.updated_at}`;
}
