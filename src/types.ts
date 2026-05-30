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
  chapterCount?: number;
};

export type ComicInSearch = {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  chapterCount?: number;
  downloadedChapterCount?: number;
};

export type SearchResult = {
  comics: ComicInSearch[];
};

export type Chapter = {
  id: string;
  title: string;
  order: number;
  state?: string;
  progress?: number;
};

export type MainTab = "search" | "favorite" | "rank" | "library" | "chapter";

export type DownloadTask = {
  id: string;
  comicId: string;
  comicTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  chapterCount: number;
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
  errorMessage?: string;
};

export type DownloadLog = {
  taskId: string;
  level: "info" | "error";
  message: string;
  createdAt: string;
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
