import { useEffect, useRef } from "react";
import type { ContentItem } from "@/types/content";
import { formatDuration, formatRating } from "@/lib/format";
import styles from "./ContentModal.module.css";

interface ContentModalProps {
  item: ContentItem | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])';

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.hasAttribute("data-focus-guard"));
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

  // Shift+Tab on the first element wraps to the last one
  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab" || !event.shiftKey) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusables = getFocusables(dialog);
    if (document.activeElement === focusables[0]) {
      event.preventDefault();
      focusables[focusables.length - 1]?.focus();
    }
  }
  // Tab past the last element lands on the guard and wraps to the first one
  function handleGuardFocus() {
    const dialog = dialogRef.current;
    if (!dialog) return;
    getFocusables(dialog)[0]?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
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
          <span tabIndex={0} data-focus-guard onFocus={handleGuardFocus} />
        </div>
      )}
    </dialog>
  );
}
