import type { ContentItem } from "@/types/content";
import { ProgressBar } from "./ProgressBar";
import styles from "./ContentTile.module.css";

interface ContentTileProps {
  item: ContentItem;
  /** Percentage watched, 0–100 */
  progress: number;
  onSelect: (item: ContentItem) => void;
}

export function ContentTile({ item, progress, onSelect }: ContentTileProps) {
  return (
    <button
      type="button"
      className={styles.tile}
      onClick={() => onSelect(item)}
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
  );
}
