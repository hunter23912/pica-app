import { invoke } from "@tauri-apps/api/core";
import type { LibraryResult } from "../types";

export function getDownloadedComics() {
  return invoke<LibraryResult>("get_downloaded_comics");
}
