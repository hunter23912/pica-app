import type { Chapter, Comic, DownloadTask } from "../types";
import { createDownloadTask } from "../api/download";

type DownloadServiceParams = {
  comic: Comic;
  chapters: Chapter[];
  chapterCount: number;
  addDownloadTask: (task: DownloadTask) => boolean;
  hasDownloadTask: (taskId: string) => boolean;
};

type DownloadTasksResult = {
  createdCount: number;
  skippedCount: number;
};

export async function startDownloadTasks({
  comic,
  chapters,
  chapterCount,
  addDownloadTask,
  hasDownloadTask,
}: DownloadServiceParams): Promise<DownloadTasksResult> {
  let createdCount = 0;
  let skippedCount = 0;

  for (const chapter of chapters) {
    const taskId = `${comic.id}-${chapter.id}`;

    if (hasDownloadTask(taskId)) {
      skippedCount++;
      continue;
    }
    const task = await createDownloadTask({
      comicId: comic.id,
      comicTitle: comic.title,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterOrder: chapter.order,
      chapterCount,
    });

    const added = addDownloadTask(task);

    if (added) {
      createdCount++;
    } else {
      skippedCount++;
    }
  }
  return { createdCount, skippedCount };
}
