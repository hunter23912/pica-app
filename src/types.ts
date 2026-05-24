export type Config = {
  token: string;
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
  state: "pending" | "downloading" | "completed";
  progress: number;
};
