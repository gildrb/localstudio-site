import type { AbortSessionResult } from "@/features/agent/runtime/api";
import {
  visibleUserTextFromPi,
  type ChatMessage,
  type QueuedMessage,
} from "@/features/agent/messages";

function visibleText(text: string): string {
  return visibleUserTextFromPi(text).trim() || text.trim();
}

function unmatchedRuntimeFollowUps(local: string[], runtime: string[]): string[] {
  const pending = new Map<string, number>();
  for (const text of local) pending.set(text, (pending.get(text) ?? 0) + 1);
  const unmatched: string[] = [];
  for (const text of runtime) {
    const normalized = visibleText(text);
    const count = pending.get(normalized) ?? 0;
    if (count > 0) pending.set(normalized, count - 1);
    else if (normalized) unmatched.push(normalized);
  }
  return unmatched;

export function messagesToResumeAfterAbort(
  queue: QueuedMessage[],
  cleared: AbortSessionResult,
): string[] {
  const steering: string[] = [];
  for (const text of cleared.steering) {
    const visible = visibleText(text);
    if (visible) steering.push(visible);
  }
  const localFollowUps: string[] = [];
  for (const item of queue) {
    if (item.mode !== "follow_up") continue;
    const text = item.text.trim();
    if (text) localFollowUps.push(text);
  }
  const runtimeFollowUps: string[] = [];
  for (const text of cleared.followUp) {
    const visible = visibleText(text);
    if (visible) runtimeFollowUps.push(visible);
  }
  return [
    ...steering,
    ...localFollowUps,
    ...unmatchedRuntimeFollowUps(localFollowUps, runtimeFollowUps),
  ];
}

export function removePendingSteersClearedByAbort(
  messages: ChatMessage[],
  cleared: AbortSessionResult,
): ChatMessage[] {
  const pending = new Map<string, number>();
  for (const rawText of cleared.steering) {
    const text = visibleText(rawText);
    if (text) pending.set(text, (pending.get(text) ?? 0) + 1);
  }
  return messages.filter((message) => {
    if (message.role !== "user" || !message.awaitingEcho) return true;
    const text = visibleText(message.text);
    const count = pending.get(text) ?? 0;
    if (count === 0) return true;
    pending.set(text, count - 1);
    return false;
  });
}
