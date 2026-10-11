export interface ContentItem {
  id: string;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  thumbnail: string;
  video_url: string;
  duration: number;
  description: string;
  cast: string[];
  watchProgress: number;
}

export interface ApiResponse {
  categories: {
    trending: ContentItem[];
  };
}
