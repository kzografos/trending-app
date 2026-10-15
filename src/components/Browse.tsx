"use client";

import { useState } from "react";
import type { ContentItem } from "@/types/content";
import { useTrending } from "@/hooks/useTrending";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { filterItems, getGenres } from "@/lib/filterContent";
import { ContentModal } from "./ContentModal";
import { TrendingRow } from "./TrendingRow";
import { HistoryRow } from "./HistoryRow";
import { BrowseToolbar } from "./BrowseToolbar";

export function Browse() {
  const { status, items, retry } = useTrending();
  const { history } = useWatchHistory();
  const [selected, setSelected] = useState<ContentItem | null>(null);

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string | null>(null);

  // Derived on every render: never stored in state
  const genres = getGenres(items);
  const visibleItems = filterItems(items, { query, genre });
  const isFiltering = query.trim() !== "" || genre !== null;

  function clearFilters() {
    setQuery("");
    setGenre(null);
  }

  return (
    <>
      {status === "success" && items.length > 0 && (
        <BrowseToolbar
          query={query}
          onQueryChange={setQuery}
          genres={genres}
          selectedGenre={genre}
          onGenreChange={setGenre}
          resultCount={visibleItems.length}
          isFiltering={isFiltering}
        />
      )}
      <TrendingRow
        status={status}
        items={visibleItems}
        history={history}
        onRetry={retry}
        onSelect={setSelected}
        isFiltering={isFiltering}
        onClearFilters={clearFilters}
      />
      {status === "success" && (
        <HistoryRow items={items} history={history} onSelect={setSelected} />
      )}
      <ContentModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
