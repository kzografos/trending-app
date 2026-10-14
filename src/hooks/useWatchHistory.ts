import { useMemo, useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  parseHistory,
  recordProgress,
  subscribe,
} from "@/lib/watchHistoryStore";

export function useWatchHistory() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const history = useMemo(() => parseHistory(raw), [raw]);

  return { history, recordProgress };
}
