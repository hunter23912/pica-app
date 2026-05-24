import { invoke } from "@tauri-apps/api/core";
import type { DownloadTask } from "../types";

type CreateDownloadTaskParams = {
  comicId: string;
  comicTitle: string;
  chapterId: string;
  chapterTitle: string;
};

export function createDownloadTask(params: CreateDownloadTaskParams) {
  return invoke<DownloadTask>("create_download_task", params);
}
