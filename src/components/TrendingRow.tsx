"use client";

import { useTrending } from "@/hooks/useTrending";

export function TrendingRow() {
  const { status, items, retry } = useTrending();

  return (
    <section aria-labelledby="trending-heading">
      <h2 id="trending-heading">Trending Now</h2>

      {status === "loading" && <p>Loading...</p>}
      {status === "error" && (
        <div role="alert">
          <p>Failed to load trending titles.</p>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && items.length === 0 && (
        <p>No trending titles available right now.</p>
      )}

      {status === "success" && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button type="button">
                <img src={item.thumbnail} alt="" />
                <span>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
