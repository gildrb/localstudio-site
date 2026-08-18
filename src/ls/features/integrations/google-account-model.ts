import { Schema } from "effect";
import type { GoogleAccountView } from "@local-studio/agent-runtime/google-account-contract";
import type { GoogleWorkspacePluginId } from "@local-studio/agent-runtime/google-workspace-binding";

export const GoogleCancellationResponseSchema = Schema.Struct({
  cancelled: Schema.Literal(true),
});

function responseError(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const error = Reflect.get(body, "error");
  return typeof error === "string" ? error : fallback;
}

export async function requestJson<T>(
  url: string,
  decode: (input: unknown) => T,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    throw new Error(responseError(errorBody, `Request failed (${response.status})`));
  }
  const body: unknown = await response.json().catch(() => null);
  return decode(body);
}

export async function openExternal(url: string): Promise<void> {
  const bridge = window.localStudioDesktop?.openExternal;
  if (bridge && (await bridge(url))) return;
  if (!window.open(url, "_blank", "noopener,noreferrer")) {
    throw new Error("Local Studio could not open the Google sign-in page");
  }
}

export function sharedClientWarning(
  accountId: GoogleWorkspacePluginId,
  account: GoogleAccountView | null,
  editing: boolean,
  clientId: string,
): string | null {
  const otherAccountId = accountId === "gmail" ? "google-calendar" : "gmail";
  if (!editing || !account?.connections[otherAccountId].connected) return null;
  if (clientId.trim() === account.clientId) return null;
  const otherDisplayName = accountId === "gmail" ? "Google Calendar" : "Gmail";
  return `Replacing this client revokes the current Cloud project's Google access and disconnects ${otherDisplayName} before starting again.`;
}
