export type Config = {
  token: string;
  downloadDir: string;
  chapterConcurrency: number;
  imageConcurrency: number;
};

export type UserProfile = {
  name: string;
};

export type Comic = {
  id: string;
  title: string;
  author: string;
};

export type ComicInSearch = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
};

export type SearchResult = {
  comics: ComicInSearch[];
};

export type Chapter = {
  id: string;
  title: string;
  order: number;
};

export type MainTab = "search" | "favorite" | "rank" | "library" | "chapter";

export type DownloadTask = {
  id: string;
  comicTitle: string;
  chapterTitle: string;
  downloadDir: string;
  chapterConcurrency: number;
  imageConcurrency: number;
  state:
    | "pending"
    | "downloading"
    | "completed"
    | "canceled"
    | "failed"
    | "paused";
  progress: number;
};

export type FavoriteResult = {
  comics: ComicInSearch[];
};

export type RankResult = {
  comics: ComicInSearch[];
};

export type LibraryResult = {
  comics: ComicInSearch[];
};

export type ComicDetail = {
  id: string;
  title: string;
  author: string;
  chapters: Chapter[];
};
