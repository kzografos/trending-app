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

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="modal-title"
      onClose={onClose}
    >
      {item && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- external API thumbnails (SVG placeholders); see README */}
          <img
            className={styles.poster}
            src={item.thumbnail}
            alt=""
            width={500}
            height={750}
          />

          <h2 id="modal-title">{item.title}</h2>

          <p>
            {item.year} · {formatDuration(item.duration)} ·{" "}
            <span aria-hidden="true">★</span>
            <span className="visually-hidden">Rating:</span>{" "}
            {formatRating(item.rating)}
          </p>
          <p>{item.description}</p>

          <p>Genre: {item.genre.join(", ")}</p>
          <p>Cast: {item.cast.join(", ")}</p>

          <button type="button" onClick={onClose}>
            Close
          </button>
        </>
      )}
    </dialog>
  );
}
