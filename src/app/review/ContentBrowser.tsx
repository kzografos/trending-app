"use client";

// ContentBrowser.tsx — Code Review Target

import { useState, useEffect, useCallback } from "react";
import type { ContentItem, ApiResponse } from "@/types/content";

const fetchContent = async (
  page: number,
  signal: AbortSignal,
): Promise<ApiResponse> => {
  const response = await fetch(`/api/content?page=${page}`, { signal });
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};
const ContentBrowser: React.FC = () => {
  const [trendingContent, setTrendingContent] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchContent(page, controller.signal)
      .then((data) => {
        setTrendingContent(data.categories.trending);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Failed to load content");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page]);
  const handleItemClick = useCallback((item: ContentItem) => {
    setSelectedItem(item);
  }, []);
  return (
    <div role="main">
      {loading && <div aria-live="polite">Loading content...</div>}
      {error && (
        <div role="alert" style={{ color: "red" }}>
          {error}
        </div>
      )}
      <section aria-labelledby="trending-heading">
        <h2 id="trending-heading">Trending Now</h2>
        <div
          className="content-grid"
          style={{ display: "flex", overflowX: "scroll", gap: "16px" }}
        >
          {trendingContent.map((item) => (
            <div key={item.id} onClick={() => handleItemClick(item)}>
              <img src={item.thumbnail} alt={item.title} />
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </section>
      {selectedItem && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <h2 id="modal-title">{selectedItem.title}</h2>
          <button onClick={() => setSelectedItem(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ContentBrowser;
