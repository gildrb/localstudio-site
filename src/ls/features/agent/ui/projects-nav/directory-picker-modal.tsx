"use client";

import { useCallback, useReducer } from "react";
import { Button, ErrorBox, UiModal, UiModalHeader } from "@/ui";
import { Folder } from "@/ui/icons";
import { useProjectDirectoryPickerModalEffects } from "@/features/agent/ui/projects-nav/use-projects-nav-effects";
import type { DirectoryBrowserEntry, DirectoryBrowserPayload } from "./types";

type DirectoryBrowserState = {
  currentPath: string;
  draftPath: string;
  parentPath: string | null;
  homePath: string;
  entries: DirectoryBrowserEntry[];
  loading: boolean;
  browseError: string;
};

type DirectoryBrowserAction =
  | { type: "loading" }
  | { type: "loaded"; payload: DirectoryBrowserPayload }
  | { type: "failed"; message: string }
  | { type: "draftChanged"; value: string };

const INITIAL_DIRECTORY_STATE: DirectoryBrowserState = {
  currentPath: "",
  draftPath: "",
  parentPath: null,
  homePath: "",
  entries: [],
  loading: false,
  browseError: "",
};

function directoryBrowserReducer(
  state: DirectoryBrowserState,
  action: DirectoryBrowserAction,
): DirectoryBrowserState {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, browseError: "" };
    case "loaded":
      return {
        currentPath: action.payload.path,
        draftPath: action.payload.path,
        parentPath: action.payload.parent,
        homePath: action.payload.home,
        entries: action.payload.entries ?? [],
        loading: false,
        browseError: "",
      };
    case "failed":
      return { ...state, loading: false, browseError: action.message };
    case "draftChanged":
      return { ...state, draftPath: action.value };
  }
}

export function ProjectDirectoryPickerModal({
  open,
  error,
  onClose,
  onSelect,
}: {
  open: boolean;
  error: string;
  onClose: () => void;
  onSelect: (path: string) => void;
}) {
  const [state, dispatch] = useReducer(directoryBrowserReducer, INITIAL_DIRECTORY_STATE);
  const { currentPath, draftPath, parentPath, homePath, entries, loading, browseError } = state;

  const loadDirectory = useCallback(async (directoryPath?: string) => {
    dispatch({ type: "loading" });
    try {
      const query = directoryPath ? `?path=${encodeURIComponent(directoryPath)}` : "";
      const response = await fetch(`/api/agent/directories${query}`, { cache: "no-store" });
      const payload = (await response.json()) as DirectoryBrowserPayload;
      if (!response.ok) throw new Error(payload.error || "Failed to list directories");
      dispatch({ type: "loaded", payload });
    } catch (loadError) {
      dispatch({
        type: "failed",
        message: loadError instanceof Error ? loadError.message : "Failed to list directories",
      });
    }
  }, []);

  useProjectDirectoryPickerModalEffects({ loadDirectory, open });

  const goToDraftPath = () => {
    const next = draftPath.trim();
    if (next) void loadDirectory(next);
  };

  return (
    <UiModal isOpen={open} onClose={onClose} maxWidth="max-w-3xl">
      <UiModalHeader
        title="Add project folder"
        icon={<Folder className="h-4 w-4" />}
        onClose={onClose}
      />
      <div className="space-y-4 p-5 text-sm text-(--fg)">
        <p className="text-xs leading-5 text-(--dim)">
          Browse folders on the machine running Local Studio, or paste an absolute path.
        </p>
        <div className="flex gap-2">
          <input
            value={draftPath}
            onChange={(event) => dispatch({ type: "draftChanged", value: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") goToDraftPath();
            }}
            className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--color-input) px-3 py-2 font-mono text-xs text-(--fg) outline-none focus:border-(--accent)"
            placeholder="/Users/name/project"
            aria-label="Directory path"
          />
          <Button
            variant="secondary"
            onClick={goToDraftPath}
            disabled={loading || !draftPath.trim()}
          >
            Go
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => homePath && void loadDirectory(homePath)}
            disabled={!homePath || loading}
          >
            Home
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => parentPath && void loadDirectory(parentPath)}
            disabled={!parentPath || loading}
          >
            Up
          </Button>
          <span className="truncate font-mono text-xs text-(--dim)" title={currentPath}>
            {currentPath || "Loading..."}
          </span>
        </div>
        <div className="h-72 overflow-auto rounded-lg border border-(--border) bg-(--color-background)">
          {loading ? (
            <div className="px-3 py-8 text-center text-xs text-(--dim)">Loading folders...</div>
          ) : entries.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-(--dim)">No subfolders found.</div>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.path}
                type="button"
                onClick={() => void loadDirectory(entry.path)}
                className="flex w-full items-center gap-2 border-b border-(--separator) px-3 py-2 text-left hover:bg-(--hover)"
                title={entry.path}
              >
                <Folder className="h-4 w-4 shrink-0 text-(--dim)" />
                <span className="truncate">{entry.name}</span>
              </button>
            ))
          )}
        </div>
        {(browseError || error) && <ErrorBox>{browseError || error}</ErrorBox>}
        <div className="flex justify-end gap-2 border-t border-(--border) pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const selectedPath = draftPath.trim() || currentPath;
              if (selectedPath) onSelect(selectedPath);
            }}
            disabled={!(draftPath.trim() || currentPath) || loading}
          >
            Select this folder
          </Button>
        </div>
      </div>
    </UiModal>
  );
}
