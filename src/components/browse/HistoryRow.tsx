import type { ContentItem } from "@/types/content";
import type { WatchHistory } from "@/types/watchHistory";
import { ContentTile } from "./ContentTile";
import styles from "./Row.module.css";

interface HistoryRowProps {
  items: ContentItem[];
  history: WatchHistory;
  onSelect: (item: ContentItem) => void;
}

export function HistoryRow({ items, history, onSelect }: HistoryRowProps) {
  // Only titles the user has started, most recent first
  const watched = items
    .filter((item) => (history[item.id]?.progress ?? 0) > 0)
    .sort(
      (a, b) =>
        (history[b.id]?.updatedAt ?? 0) - (history[a.id]?.updatedAt ?? 0),
    );

  return (
    <section className={styles.section} aria-labelledby="history-heading">
      <h2 className={styles.heading} id="history-heading">
        Recently Watched
      </h2>

      {watched.length === 0 ? (
        <p className={styles.empty}>
          Titles you start watching will appear here.
        </p>
      ) : (
        <ul className={styles.row}>
          {watched.map((item) => (
            <li key={item.id} className={styles.item}>
              <ContentTile
                item={item}
                progress={history[item.id]?.progress ?? 0}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
