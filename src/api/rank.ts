import { invoke } from "@tauri-apps/api/core";
import type { RankResult } from "../types";

export function getRank() {
  return invoke<RankResult>("get_rank");
}
