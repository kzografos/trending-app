import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  /** Percentage, 0–100 */
  value: number;
}

// Visual only: callers provide the text alternative ("23% watched")
export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <span className={styles.track} aria-hidden="true">
      <span className={styles.fill} style={{ width: `${value}%` }} />
    </span>
  );
}
