import type { ContentItem } from "@/types/content";
import { filterItems, getGenres } from "./filterContent";

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 1,
    title: "Echoes of Orion",
    year: 2019,
    genre: ["Sci-Fi", "Drama"],
    rating: 8,
    thumbnail: "/poster.png",
    video_url: "/video.mp4",
    duration: 45,
    description: "A test description.",
    cast: ["Actor One"],
    watchProgress: 0,
    ...overrides,
  };
}

const orion = makeItem();
const saltRoad = makeItem({
  id: 2,
  title: "The Salt Road",
  genre: ["Western", "Drama"],
});
const items = [orion, saltRoad];

describe("filterItems", () => {
  it("returns every item when no filter is active", () => {
    expect(filterItems(items, { query: "", genre: null })).toEqual(items);
  });

  it("matches the title regardless of case", () => {
    expect(filterItems(items, { query: "ORION", genre: null })).toEqual([
      orion,
    ]);
  });

  it("ignores surrounding whitespace", () => {
    expect(filterItems(items, { query: "  salt  ", genre: null })).toEqual([
      saltRoad,
    ]);
  });

  it("filters by genre", () => {
    expect(filterItems(items, { query: "", genre: "Western" })).toEqual([
      saltRoad,
    ]);
  });

  it("combines query and genre", () => {
    expect(filterItems(items, { query: "orion", genre: "Western" })).toEqual(
      [],
    );
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterItems(items, { query: "zzz", genre: null })).toEqual([]);
  });
});

describe("getGenres", () => {
  it("returns unique genres sorted A–Z", () => {
    expect(getGenres(items)).toEqual(["Drama", "Sci-Fi", "Western"]);
  });
});
