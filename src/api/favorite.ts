import { invoke } from "@tauri-apps/api/core";
import type { FavoriteResult } from "../types";

export function getFavorite() {
  return invoke<FavoriteResult>("get_favorite");
}
