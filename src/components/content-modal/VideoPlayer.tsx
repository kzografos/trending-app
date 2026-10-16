import { useState } from "react";
import styles from "./VideoPlayer.module.css";

interface VideoPlayerProps {
  src: string;
  title: string;
  onProgress?: (percent: number) => void;
}

export function VideoPlayer({ src, title, onProgress }: VideoPlayerProps) {
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
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        // duration is NaN before metadata loads (and Infinity for live streams)
        if (!Number.isFinite(video.duration) || video.duration === 0) return;
        onProgress?.((video.currentTime / video.duration) * 100);
      }}
      onEnded={() => onProgress?.(100)}
    />
  );
}
