import Image from "next/image";
import type { ContentItem } from "@/types/content";
import { ProgressBar } from "@/components/ui/ProgressBar";
import styles from "./ContentTile.module.css";

interface ContentTileProps {
  item: ContentItem;
  /** Percentage watched, 0–100 */
  progress: number;
  onSelect: (item: ContentItem) => void;
  /** Load immediately instead of lazily (for tiles visible on first paint) */
  eager?: boolean;
}

export function ContentTile({
  item,
  progress,
  onSelect,
  eager = false,
}: ContentTileProps) {
  return (
    <button
      type="button"
      className={styles.tile}
      onClick={() => onSelect(item)}
    >
      <Image
        className={styles.poster}
        src={item.thumbnail}
        alt=""
        width={500}
        height={750}
        sizes="(min-width: 1280px) 200px, (min-width: 1024px) 180px, (min-width: 768px) 160px, 140px"
        loading={eager ? "eager" : "lazy"}
      />
      {progress > 0 && <ProgressBar value={progress} />}
      <span className={styles.title}>{item.title}</span>
      {progress > 0 && (
        <span className="visually-hidden">{`, ${progress}% watched`}</span>
      )}
    </button>
  );
}
