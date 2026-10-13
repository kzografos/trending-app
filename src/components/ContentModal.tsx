import { useEffect, useRef } from "react";
import type { ContentItem } from "@/types/content";
import { formatDuration, formatRating } from "@/lib/format";
import styles from "./ContentModal.module.css";

interface ContentModalProps {
  item: ContentItem | null;
  onClose: () => void;
}

export function ContentModal({ item, onClose }: ContentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item && !dialog.open) {
      dialog.showModal();
    }

    if (!item && dialog.open) {
      dialog.close();
    }
  }, [item]);
  // Backdrop clicks land on the <dialog> itself; clicks inside land on .content
  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={handleDialogClick}
    >
      {item && (
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {item.title}
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </header>
          <div className={styles.body}>
            {/* eslint-disable-next-line @next/next/no-img-element -- external API thumbnails (SVG placeholders); see README */}
            <img
              className={styles.poster}
              src={item.thumbnail}
              alt=""
              width={500}
              height={750}
            />

            <div className={styles.info}>
              <p className={styles.meta}>
                {item.year} · {formatDuration(item.duration)} ·{" "}
                <span aria-hidden="true">★</span>
                <span className="visually-hidden">Rating:</span>{" "}
                {formatRating(item.rating)}
              </p>
              <p>{item.description}</p>

              <p className={styles.muted}>Genre: {item.genre.join(", ")}</p>
              <p className={styles.muted}>Cast: {item.cast.join(", ")}</p>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
