import type { WatchHistory, WatchHistoryEntry } from "@/types/watchHistory";

const STORAGE_KEY = "watch-history";
const listeners = new Set<() => void>();

/** Raw string (or null). Strings compare by value, so the snapshot stays stable. */
export function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked (e.g. some private modes)
  }
}

/** No localStorage on the server, so no history */
export function getServerSnapshot(): string | null {
  return null;
}

/** Parses and validates stored history. Never throws. */
export function parseHistory(raw: string | null): WatchHistory {
  if (!raw) return {};

  try {
    const data: unknown = JSON.parse(raw);

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {};
    }

    const result: WatchHistory = {};

    for (const [id, entry] of Object.entries(data)) {
      if (isValidEntry(entry)) {
        result[Number(id)] = entry;
      }
    }
    return result;
  } catch {
    return {}; // corrupted JSON
  }
}

function isValidEntry(value: unknown): value is WatchHistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;

  return (
    typeof entry.progress === "number" &&
    entry.progress >= 0 &&
    entry.progress <= 100 &&
    typeof entry.updatedAt === "number"
  );
}

export function recordProgress(id: number, progress: number): void {
  const history = parseHistory(getSnapshot());

  const rounded = Math.min(100, Math.max(0, Math.round(progress)));

  if (history[id]?.progress === rounded) return;

  history[id] = { progress: rounded, updatedAt: Date.now() };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    return; // quota exceeded / storage blocked: history is a nice-to-have
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
