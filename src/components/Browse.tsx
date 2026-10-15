"use client";

import { useState } from "react";
import type { ContentItem } from "@/types/content";
import { useTrending } from "@/hooks/useTrending";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { ContentModal } from "./ContentModal";
import { TrendingRow } from "./TrendingRow";

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
      {/* H5c: HistoryRow εδώ */}
      <ContentModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}
