import type { ContentItem } from "@/types/content";

export interface ContentFilters {
  /** Free text, matched against the title (case-insensitive) */
  query: string;
  /** A genre name, or null for "All" */
  genre: string | null;
}

/** Unique genres across all items, sorted A–Z */
export function getGenres(items: ContentItem[]): string[] {
  return [...new Set(items.flatMap((item) => item.genre))].sort();
}

export function filterItems(
  items: ContentItem[],
  { query, genre }: ContentFilters,
): ContentItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesQuery =
      normalizedQuery === "" ||
      item.title.toLowerCase().includes(normalizedQuery);
    const matchesGenre = genre === null || item.genre.includes(genre);
    return matchesQuery && matchesGenre;
  });
}
