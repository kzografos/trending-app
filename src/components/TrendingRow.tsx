"use client";

import { useState } from "react";
import type { ContentItem } from "@/types/content";
import { ContentModal } from "@/components/ContentModal";
import { useTrending } from "@/hooks/useTrending";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { ProgressBar } from "./ProgressBar";
import styles from "./TrendingRow.module.css";

const SKELETON_COUNT = 8;

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

export function TrendingRow() {
  const { status, items, retry } = useTrending();
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const { history } = useWatchHistory();

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
          <button className={styles.retryButton} type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && items.length === 0 && (
        <p>No trending titles available right now.</p>
      )}

      {status === "success" && items.length > 0 && (
        <ul className={styles.row}>
          {items.map((item) => {
            const progress = history[item.id]?.progress ?? 0;

            return (
              <li key={item.id} className={styles.item}>
                <button
                  type="button"
                  className={styles.tile}
                  onClick={() => setSelected(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- external API thumbnails (SVG placeholders); see README */}
                  <img
                    className={styles.poster}
                    src={item.thumbnail}
                    alt=""
                    width={500}
                    height={750}
                    loading="lazy"
                  />
                  {progress > 0 && <ProgressBar value={progress} />}
                  <span className={styles.title}>{item.title}</span>
                  {progress > 0 && (
                    <span className="visually-hidden">{`, ${progress}% watched`}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <ContentModal item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
