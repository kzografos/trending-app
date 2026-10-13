"use client";
import { useTrending } from "@/hooks/useTrending";
import styles from "./TrendingRow.module.css";

export function TrendingRow() {
  const { status, items, retry } = useTrending();

  return (
    <section className={styles.section} aria-labelledby="trending-heading">
      <h2 className={styles.heading} id="trending-heading">
        Trending Now
      </h2>

      {status === "loading" && <p>Loading...</p>}
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
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <button type="button" className={styles.tile}>
                {/* eslint-disable-next-line @next/next/no-img-element -- external API thumbnails (SVG placeholders); see README */}
                <img
                  className={styles.poster}
                  src={item.thumbnail}
                  alt=""
                  width={500}
                  height={750}
                  loading="lazy"
                />
                <span className={styles.title}>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
