export interface ContentItem {
  id: number;
  title: string;
  year: number;
  genre: string[];
  /** Average rating on a 0–10 scale, one decimal (e.g. 8.0) */
  rating: number;
  thumbnail: string;
  video_url: string;
  /** Runtime in minutes (155 → "2h 35m") */
  duration: number;
  description: string;
  cast: string[];
  /** Percentage watched, 0–100 */
  watchProgress: number;
}

export interface ApiResponse {
  categories: {
    trending: ContentItem[];
  };
}
