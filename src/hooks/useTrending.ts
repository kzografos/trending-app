import { useState, useEffect } from "react";
import type { ContentItem } from "@/types/content";
import { fetchTrending } from "@/lib/api";

export type Status = "loading" | "error" | "success";

export function useTrending() {
  const [status, setStatus] = useState<Status>("loading");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchTrending(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setItems(data);
        setStatus("success");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("Error fetching trending content:", err);
        setStatus("error");
      });

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setStatus("loading");
    setAttempt((prev) => prev + 1);
  }

  return { status, items, retry };
}
