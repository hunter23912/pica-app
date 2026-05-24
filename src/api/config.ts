import {invoke} from "@tauri-apps/api/core";
import type { Config } from "../types";

export function getConfig() {
  return invoke<Config>("get_config");
}

export function saveConfig(config: Config) {
  return invoke("save_config", { config });
}