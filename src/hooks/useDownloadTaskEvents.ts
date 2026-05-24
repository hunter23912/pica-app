import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useAppStore } from "../store";
import type { DownloadTask } from "../types";
import { DOWNLOAD_TASK_EVENT } from "../constants/events";

export function useDownloadTaskEvents() {
  const updateDownloadTask = useAppStore((state) => state.updateDownloadTask);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function listenEvents() {
      unlisten = await listen<DownloadTask>(DOWNLOAD_TASK_EVENT, (event) => {
        updateDownloadTask(event.payload.id, event.payload);
      });
    }

    listenEvents();

    return () => {
      unlisten?.();
    };
  }, [updateDownloadTask]);
}
