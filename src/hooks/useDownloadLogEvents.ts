import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { DOWNLOAD_LOG_EVENT } from "../constants/events";
import { useAppStore } from "../store";
import type { DownloadLog } from "../types";

export function useDownloadLogEvents() {
  const addDownloadLog = useAppStore((state) => state.addDownloadLog);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function listenEvents() {
      unlisten = await listen<DownloadLog>(DOWNLOAD_LOG_EVENT, (event) => {
        addDownloadLog(event.payload);
      });
    }

    listenEvents();

    return () => {
      unlisten?.();
    };
  }, [addDownloadLog]);
}
