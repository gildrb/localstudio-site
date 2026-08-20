"use client";

import { ChevronLeft, Trash2 } from "@/ui/icon-registry";
import { Button, SearchInput, StatusPill } from "@/ui";
import type { LogSession } from "@/lib/types";

export function LogsSessionsSidebar({
  sessions,
  filteredSessions,
  selectedSession,
  filter,
  sidebarOpen,
  onFilterChange,
  onSidebarToggle,
  onSelectSession,
  onDeleteSession,
  formatDateTime,
}: {
  sessions: LogSession[];
  filteredSessions: LogSession[];
  selectedSession: string | null;
  filter: string;
  sidebarOpen: boolean;
  onFilterChange: (value: string) => void;
  onSidebarToggle: (value: boolean) => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  formatDateTime: (dateValue: string) => string;
}) {
  const countLabel =
    filter.trim() && filteredSessions.length !== sessions.length
      ? `${filteredSessions.length} of ${sessions.length}`
      : String(sessions.length);
  const countNoun = filteredSessions.length === 1 ? "session" : "sessions";
  const renderFilter = () => (
    <SearchInput value={filter} onChange={onFilterChange} placeholder="Filter..." />
  );

  const renderSessionRow = (session: LogSession) => (
    <div
      key={session.id}
      className={`group flex w-full items-start border-b border-(--separator) transition-colors ${
        selectedSession === session.id ? "bg-(--surface)" : "hover:bg-(--hover)"
      }`}
    >
      <button
        type="button"
        aria-pressed={selectedSession === session.id}
        onClick={() => onSelectSession(session.id)}
        className="min-w-0 flex-1 p-3 text-left"
      >
        <span className="block truncate text-sm font-medium text-(--fg)">
          {session.model || session.id}
        </span>
        <span className="mt-1 block text-[length:var(--fs-sm)] text-(--dim)">
          {formatDateTime(session.created_at)}
        </span>
        {session.backend ? (
          <StatusPill tone="info" variant="badge" className="mt-1.5">
            {session.backend}
          </StatusPill>
        ) : null}
      </button>
      <Button
        variant="icon"
        size="sm"
        disabled={session.id === "controller"}
        onClick={() => onDeleteSession(session.id)}
        aria-label={`Delete ${session.model || session.id} log session`}
        className={`mr-2 mt-3 p-1 text-(--dim) opacity-0 transition-all group-hover:opacity-100 ${
          session.id === "controller" ? "cursor-not-allowed opacity-20" : "hover:text-(--err)"
        }`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const renderSessions = () =>
    filteredSessions.length === 0 ? (
      <div className="p-4 text-center text-(--dim) text-sm">No log files found</div>
    ) : (
      filteredSessions.map(renderSessionRow)
    );

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close log sessions"
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => onSidebarToggle(false)}
        />
      )}

      <div className="w-72 border-r border-(--border) flex-col bg-(--surface) shrink-0 hidden md:flex">
        <div className="p-4 border-b border-(--border)">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-medium text-(--dim) uppercase tracking-wider">
              Log Sessions
            </h1>
          </div>
          {renderFilter()}
        </div>
        <div className="flex-1 overflow-y-auto">{renderSessions()}</div>
        <div className="p-3 border-t border-(--border) text-[length:var(--fs-sm)] text-(--dim)">
          {countLabel} {countNoun}
        </div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-(--border) flex flex-col bg-(--surface) transform transition-transform duration-200 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-(--border)">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-medium text-(--dim) uppercase tracking-wider">
              Log Sessions
            </h1>
            <Button variant="icon" size="sm" onClick={() => onSidebarToggle(false)}>
              <ChevronLeft className="h-4 w-4 text-(--dim)" />
            </Button>
          </div>
          {renderFilter()}
        </div>
        <div className="flex-1 overflow-y-auto">{renderSessions()}</div>
        <div className="p-3 border-t border-(--border) text-[length:var(--fs-sm)] text-(--dim)">
          {countLabel} {countNoun}
        </div>
      </div>
    </>
  );
}
