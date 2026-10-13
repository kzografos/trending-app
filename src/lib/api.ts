import type { ContentItem } from "@/types/content";

export async function fetchTrending(
  signal?: AbortSignal,
): Promise<ContentItem[]> {
  const response = await fetch("/api/content", { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = await response.json();

  const items = data?.categories?.trending;
  if (!Array.isArray(items)) {
    throw new Error(
      "Invalid data format: 'categories.trending' is not an array",
    );
  }
  return items;
}
