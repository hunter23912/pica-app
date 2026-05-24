import type { Chapter, Comic, DownloadTask } from "../types";
import { createDownloadTask } from "../api/download";

type FakeDownloadServiceParams = {
  comic: Comic;
  chapters: Chapter[];
  addDownloadTask: (task: DownloadTask) => void;
};

export async function startFakeDownloadTasks({
  comic,
  chapters,
  addDownloadTask,
}: FakeDownloadServiceParams) {
  for (const chapter of chapters) {
    const task = await createDownloadTask({
      comicId: comic.id,
      comicTitle: comic.title,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
    });

    addDownloadTask(task);
  }
}
