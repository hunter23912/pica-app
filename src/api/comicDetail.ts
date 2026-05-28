import { invoke } from "@tauri-apps/api/core";
import type { ComicDetail } from "../types";

export function getComicDetail(comicId: string) {
  return invoke<ComicDetail>("get_comic_detail", { comicId });
}
