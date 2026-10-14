export interface WatchHistoryEntry {
  /** Percentage watched, 0–100 */
  progress: number;
  /** Unix timestamp (ms) of the last update */
  updatedAt: number;
}

/** Keyed by ContentItem id */
export type WatchHistory = Record<number, WatchHistoryEntry>;
