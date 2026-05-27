import type { Chapter, Comic, DownloadTask } from "../types";
import { createDownloadTask } from "../api/download";

type FakeDownloadServiceParams = {
  comic: Comic;
  chapters: Chapter[];
  addDownloadTask: (task: DownloadTask) => boolean;
  hasDownloadTask: (taskId: string) => boolean;
};

type StartFakeDownloadTasksResult = {
  createdCount: number;
  skippedCount: number;
};

export async function startFakeDownloadTasks({
  comic,
  chapters,
  addDownloadTask,
  hasDownloadTask,
}: FakeDownloadServiceParams): Promise<StartFakeDownloadTasksResult> {
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
