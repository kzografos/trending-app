"use client";

import { useState } from "react";
import type { ContentItem } from "@/types/content";
import { useTrending } from "@/hooks/useTrending";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { ContentModal } from "./ContentModal";
import { TrendingRow } from "./TrendingRow";
import { HistoryRow } from "./HistoryRow";

export function Browse() {
  const { status, items, retry } = useTrending();
  const { history } = useWatchHistory();
  const [selected, setSelected] = useState<ContentItem | null>(null);

  return (
    <>
      <TrendingRow
        status={status}
        items={items}
        history={history}
        onRetry={retry}
        onSelect={setSelected}
      />
      {status === "success" && (
        <HistoryRow items={items} history={history} onSelect={setSelected} />
      )}
      <ContentModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
