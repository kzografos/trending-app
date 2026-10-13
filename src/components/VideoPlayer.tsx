import { useState } from "react";
import styles from "./VideoPlayer.module.css";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={styles.fallback}>
        <p>This video isn&apos;t available right now.</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <video
      className={styles.video}
      src={src}
      controls
      preload="metadata"
      playsInline
      aria-label={`${title} video`}
      onError={() => setFailed(true)}
    />
  );
}
