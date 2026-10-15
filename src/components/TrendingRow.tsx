import type { ContentItem } from "@/types/content";
import type { WatchHistory } from "@/types/watchHistory";
import type { Status } from "@/hooks/useTrending";
import { ContentTile } from "./ContentTile";
import styles from "./Row.module.css";

const SKELETON_COUNT = 8;
const EAGER_TILE_COUNT = 6;

function RowSkeleton() {
  return (
    <ul className={`${styles.row} ${styles.skeletonRow}`} aria-hidden="true">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <li key={i} className={styles.item}>
          <div className={styles.skeletonPoster} />
          <div className={styles.skeletonTitle} />
        </li>
      ))}
    </ul>
  );
}

interface TrendingRowProps {
  status: Status;
  items: ContentItem[];
  history: WatchHistory;
  onRetry: () => void;
  onSelect: (item: ContentItem) => void;
  isFiltering?: boolean;
  onClearFilters?: () => void;
}

export function TrendingRow({
  status,
  items,
  history,
  onRetry,
  onSelect,
  isFiltering = false,
  onClearFilters,
}: TrendingRowProps) {
  return (
    <section
      className={styles.section}
      aria-labelledby="trending-heading"
      aria-busy={status === "loading"}
    >
      <h2 className={styles.heading} id="trending-heading">
        Trending Now
      </h2>

      <p role="status" className="visually-hidden">
        {status === "loading" ? "Loading trending titles..." : ""}
      </p>

      {status === "loading" && <RowSkeleton />}

      {status === "error" && (
        <div role="alert">
          <p>Failed to load trending titles.</p>
          <button
            className={styles.retryButton}
            type="button"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      )}

      {status === "success" &&
        items.length === 0 &&
        (isFiltering ? (
          <div>
            <p>No titles match your filters.</p>
            <button
              type="button"
              className={styles.retryButton}
              onClick={onClearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <p>No trending titles available right now.</p>
        ))}

      {status === "success" && items.length > 0 && (
        <ul className={styles.row}>
          {items.map((item, index) => (
            <li key={item.id} className={styles.item}>
              <ContentTile
                item={item}
                progress={history[item.id]?.progress ?? 0}
                onSelect={onSelect}
                eager={index < EAGER_TILE_COUNT}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
