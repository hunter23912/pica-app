import { invoke } from "@tauri-apps/api/core";
import type { SearchResult } from "../types";

export function searchComic(keyword: string) {
  return invoke<SearchResult>("search_comic", { keyword });
}
