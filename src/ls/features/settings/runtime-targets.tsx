"use client";

import { ArrowUpCircle, DownloadCloud } from "@/ui/icon-registry";
import type { EngineJob, RuntimeTarget } from "@/lib/types";
import { RowDetailLine, RowFacts, StatusPill, type RowFact, type UiTone, Spinner } from "@/ui";
import { SettingsButton, SettingsRow, SettingsValue } from "./settings-ui";
import {
  ENGINE_META,
  MANAGED_RUNTIME_BACKENDS,
  isRunningEngineJob,
  jobForRuntimeTarget,
  managedInstallJob,
  managedTargetForBackend,
  type ManagedRuntimeInstallBackend,
} from "./runtime-target-model";

export function ManagedRuntimeInstallRows({
  backends = MANAGED_RUNTIME_BACKENDS,
  jobs = [],
  targets = [],
  onInstall,
  onUpdateTarget,
}: {
  backends?: readonly ManagedRuntimeInstallBackend[];
  jobs?: EngineJob[];
  targets?: RuntimeTarget[];
  onInstall: (backend: ManagedRuntimeInstallBackend) => void | Promise<void>;
  onUpdateTarget?: (target: RuntimeTarget) => void | Promise<void>;
}) {
  return (
    <>
      {backends.map((backend) => {
        const meta = ENGINE_META[backend];
        const target = managedTargetForBackend(targets, backend);
        const installedTarget = target?.installed ? target : undefined;
        const job = installedTarget
          ? jobForRuntimeTarget(jobs, installedTarget)
          : managedInstallJob(jobs, backend);
        const running = isRunningEngineJob(job);
        const updateTarget = installedTarget?.capabilities.canUpdate ? installedTarget : undefined;
        const onAction = updateTarget ? onUpdateTarget : onInstall;
        const action = installedTarget ? "Update" : "Install";
        return (
          <SettingsRow
            key={backend}
            variant="resource"
            label={`${meta.label} latest venv`}
            description={`Create or update the controller-managed Python environment for ${meta.label}.`}
            value={
              <SettingsValue mono truncate>
                {target?.pythonPath ?? `$DATA_DIR/runtime/venvs/${backend}-latest`}
              </SettingsValue>
            }
            status={
              target ? (
                <RuntimeTargetStatus
                  installed={target.installed}
                  active={target.active}
                  health={target.health.status}
                />
              ) : (
                <StatusPill tone={job?.status === "success" ? "good" : "default"}>
                  venv
                </StatusPill>
              )
            }
            actions={
              <SettingsButton
                onClick={() =>
                  void (updateTarget ? onUpdateTarget?.(updateTarget) : onInstall(backend))
                }
                disabled={running || !onAction}
              >
                {running ? (
                  <Spinner size="xs" />
                ) : installedTarget ? (
                  <ArrowUpCircle className="h-3 w-3" />
                ) : (
                  <DownloadCloud className="h-3 w-3" />
                )}
                {running ? job?.status : installedTarget ? action : "Create venv"}
              </SettingsButton>
            }
          >
            {job ? <RuntimeJobMessage job={job} /> : null}
          </SettingsRow>
        );
      })}
    </>
  );
}

export function RuntimeTargetRows({
  targets,
  jobs = [],
  onAction,
}: {
  targets: RuntimeTarget[];
  jobs?: EngineJob[];
  onAction?: (target: RuntimeTarget) => void | Promise<void>;
}) {
  return (
    <>
      {targets.map((target) => (
        <RuntimeTargetRow
          key={target.id}
          target={target}
          job={jobForRuntimeTarget(jobs, target)}
          onAction={onAction}
        />
      ))}
    </>
  );
}

function RuntimeTargetRow({
  target,
  job,
  onAction,
}: {
  target: RuntimeTarget;
  job?: EngineJob;
  onAction?: (target: RuntimeTarget) => void | Promise<void>;
}) {
  const meta = ENGINE_META[target.backend];
  const unsupportedReason = target.health.message ?? "Updates are unsupported for this target.";
  const healthMessage = runtimeTargetHealthMessage(target);

  return (
    <SettingsRow
      variant="resource"
      label={target.label || meta?.label || target.backend}
      description={<RuntimeTargetMeta target={target} />}
      control={<RuntimeTargetSummary target={target} />}
      status={
        <RuntimeTargetStatus
          installed={target.installed}
          active={target.active}
          health={target.health.status}
        />
      }
      actions={
        <RuntimeTargetAction
          target={target}
          job={job}
          onAction={onAction}
          unsupportedReason={unsupportedReason}
        />
      }
    >
      {job ? <RuntimeJobMessage job={job} /> : null}
      {target.capabilities.canUpdate && target.update ? (
        <RuntimeUpdateDetails update={target.update} />
      ) : null}
      {!target.capabilities.canUpdate ? <RowDetailLine>{unsupportedReason}</RowDetailLine> : null}
      {healthMessage ? <RowDetailLine tone="warning">{healthMessage}</RowDetailLine> : null}
    </SettingsRow>
  );
}

function RuntimeTargetAction({
  target,
  job,
  onAction,
  unsupportedReason,
}: {
  target: RuntimeTarget;
  job?: EngineJob;
  onAction?: (target: RuntimeTarget) => void | Promise<void>;
  unsupportedReason: string;
}) {
  const running = isRunningEngineJob(job);
  const canUpdate = target.capabilities.canUpdate;
  const disabled = running || !canUpdate || !onAction;
  if (!running && (!canUpdate || !onAction)) {
    return null;
  }
  return (
    <SettingsButton
      onClick={() => void onAction?.(target)}
      disabled={disabled}
      title={canUpdate ? undefined : unsupportedReason}
    >
      {running ? <Spinner size="xs" /> : <ArrowUpCircle className="h-3 w-3" />}
      {running ? job?.status : canUpdate ? (target.installed ? "Update" : "Install") : "Managed"}
    </SettingsButton>
  );
}

function runtimeTargetHealthMessage(target: RuntimeTarget): string | undefined {
  if (!target.capabilities.canUpdate) return undefined;
  if (target.health.status !== "warning" && target.health.status !== "error") return undefined;
  return target.health.message;
}

function RuntimeTargetMeta({ target }: { target: RuntimeTarget }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span>{target.kind}</span>
      <span aria-hidden>·</span>
      <span>{target.source}</span>
      {target.active ? (
        <>
          <span aria-hidden>·</span>
          <span className="text-(--ui-success)">running</span>
        </>
      ) : null}
    </span>
  );
}

function RuntimeTargetSummary({ target }: { target: RuntimeTarget }) {
  const location = pathForTarget(target);
  const facts: RowFact[] = [
    {
      label: "Version",
      value: target.installed ? (target.version ?? "installed") : "not installed",
      mono: true,
    },
  ];
  if (location) {
    facts.push({ label: "Location", value: location, mono: true, title: location, truncate: true });
  }
  if (target.update && target.capabilities.canUpdate) {
    facts.push({ label: "Latest", value: target.update.targetVersion, mono: true });
  }

  return <RowFacts items={facts} />;
}

export function RuntimeTargetStatus({
  installed,
  active,
  health,
}: {
  installed: boolean;
  active?: boolean;
  health?: RuntimeTarget["health"]["status"];
}) {
  const tone: UiTone = active
    ? "good"
    : health === "error"
      ? "danger"
      : installed
        ? "info"
        : "default";
  const label = active
    ? "active"
    : health === "error"
      ? "error"
      : installed
        ? "installed"
        : "available";
  return (
    <StatusPill tone={tone} variant="badge">
      {label}
    </StatusPill>
  );
}

function RuntimeJobMessage({ job }: { job: EngineJob }) {
  const failed = job.status === "error";
  const tone = failed ? "danger" : "muted";
  const reason = job.error?.trim();
  const tail = clipEngineJobOutputTail(job.outputTail);
  return (
    <>
      <RowDetailLine tone={tone} size="md">
        {job.message}
      </RowDetailLine>
      {job.command ? (
        <RowDetailLine mono truncate tone={tone} size="md">
          {job.command}
        </RowDetailLine>
      ) : null}
      {reason && reason !== job.message?.trim() ? (
        <RowDetailLine mono clamp tone={tone} size="md">
          {reason}
        </RowDetailLine>
      ) : null}
      {tail ? <RuntimeJobOutputTail tail={tail} failed={failed} /> : null}
    </>
  );
}

function RuntimeJobOutputTail({ tail, failed }: { tail: string; failed: boolean }) {
  if (!failed) {
    return (
      <RowDetailLine mono clamp size="md">
        {tail}
      </RowDetailLine>
    );
  }
  return (
    <details className="bg-(--ui-bg) border border-(--ui-border) rounded-md overflow-hidden">
      <summary className="cursor-pointer px-2 py-1 text-[length:var(--fs-sm)] text-(--ui-muted)">
        Last output
      </summary>
      <pre className="px-2 py-1 text-[length:var(--fs-sm)] font-mono text-(--ui-danger)/80 whitespace-pre-wrap break-all">
        {tail}
      </pre>
    </details>
  );
}

function RuntimeUpdateDetails({ update }: { update: NonNullable<RuntimeTarget["update"]> }) {
  const pinHint = update.changes.find((change) => change.startsWith("Set "));
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-(--ui-muted)">
        <span>
          Update available:{" "}
          <span className="font-mono text-(--ui-fg)/70">
            {update.currentVersion ?? "unknown"} -&gt; {update.targetVersion}
          </span>
        </span>
        {update.restartRequired ? (
          <StatusPill tone="warning" variant="badge">
            restarts model
          </StatusPill>
        ) : null}
        <a
          href={update.releaseNotesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-(--ui-accent)/80 hover:underline"
        >
          release notes
        </a>
      </div>
      {pinHint ? <RowDetailLine className="text-(--ui-muted)/70">{pinHint}</RowDetailLine> : null}
    </>
  );
}

function pathForTarget(target: RuntimeTarget) {
  return target.pythonPath ?? target.binaryPath ?? target.dockerImage ?? "";
}
