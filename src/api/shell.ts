import { invoke } from "@tauri-apps/api/core";

export function openDownloadDir() {
  return invoke<void>("open_download_dir");
}

export function getDefaultDownloadDir() {
  return invoke<string>("get_default_download_dir");
}
