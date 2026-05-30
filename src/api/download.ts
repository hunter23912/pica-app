import { invoke } from "@tauri-apps/api/core";
import type { DownloadTask } from "../types";

type CreateDownloadTaskParams = {
  comicId: string;
  comicTitle: string;
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  chapterCount: number;
};

export function createDownloadTask(params: CreateDownloadTaskParams) {
  return invoke<DownloadTask>("create_download_task", params);
}

export function openChapterDir(params: {
  comicTitle: string;
  chapterTitle: string;
}) {
  return invoke<void>("open_chapter_dir", params);
}
