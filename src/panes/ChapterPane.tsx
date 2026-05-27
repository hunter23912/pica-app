import { useState } from "react";
import { useAppStore } from "../store";
import { startFakeDownloadTasks } from "../services/fakeDownloadService";
import type { Chapter } from "../types";

function createFakeChapters(comicId: string): Chapter[] {
  return [
    { id: `${comicId}-chapter-1`, title: "第 1 章", order: 1 },
    { id: `${comicId}-chapter-2`, title: "第 2 章", order: 2 },
    { id: `${comicId}-chapter-3`, title: "第 3 章", order: 3 },
  ];
}

export function ChapterPane() {
  const pickedComic = useAppStore((state) => state.pickedComic);
  const addDownloadTask = useAppStore((state) => state.addDownloadTask);
  const hasDownloadTask = useAppStore((state) => state.hasDownloadTask);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  if (!pickedComic) {
    return <section className="pane">请先从搜索结果中选择漫画</section>;
  }

  const chapters = createFakeChapters(pickedComic.id);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((current) => {
      if (current.includes(chapterId)) {
        // 如果已经选中，则取消选中
        return current.filter((id) => id !== chapterId);
      }
      return [...current, chapterId]; // 否则添加到选中列表
    });
  };

  const handleDownloadSelected = async () => {
    const selectedChapters = chapters.filter((chapter) =>
      selectedChapterIds.includes(chapter.id),
    );

    const result = await startFakeDownloadTasks({
      comic: pickedComic,
      chapters: selectedChapters,
      addDownloadTask,
      hasDownloadTask,
    });
    setMessage(
      `已创建 ${result.createdCount} 个任务，跳过 ${result.skippedCount} 个重复任务。`,
    );
    setSelectedChapterIds([]);
  };

  return (
    <section className="pane">
      <h2>{pickedComic.title}</h2>
      <p>作者: {pickedComic.author}</p>
      <p>已选择 {selectedChapterIds.length} 个章节</p>
      {message && <p>{message}</p>}

      <div className="chapter-list">
        {chapters.map((chapter) => (
          <label key={chapter.id} className="chapter-row">
            <input
              type="checkbox"
              checked={selectedChapterIds.includes(chapter.id)}
              onChange={() => toggleChapter(chapter.id)}
            />
            <span>{chapter.title}</span>
          </label>
        ))}
      </div>
      <button
        onClick={handleDownloadSelected}
        disabled={selectedChapterIds.length === 0}
      >
        {selectedChapterIds.length === 0
          ? "请选择章节"
          : `下载 ${selectedChapterIds.length} 个章节`}
      </button>
    </section>
  );
}
