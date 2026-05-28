import { useState, useEffect } from "react";
import { useAppStore } from "../store";
import { startFakeDownloadTasks } from "../services/fakeDownloadService";
import type { ComicDetail } from "../types";
import { getComicDetail } from "../api/comicDetail";

export function ChapterPane() {
  const pickedComic = useAppStore((state) => state.pickedComic);
  const addDownloadTask = useAppStore((state) => state.addDownloadTask);
  const hasDownloadTask = useAppStore((state) => state.hasDownloadTask);
  const [comicDetail, setComicDetail] = useState<ComicDetail>();
  const [chaptersError, setChaptersError] = useState("");
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!pickedComic) {
      setComicDetail(undefined);
      setSelectedChapterIds([]);
      setChaptersError("");
      return;
    }

    const loadChapters = async () => {
      setChaptersError("");
      setLoadingChapters(true);
      setSelectedChapterIds([]);

      try {
        const result = await getComicDetail(pickedComic.id);
        setComicDetail(result);
      } catch (error) {
        setComicDetail(undefined);
        setChaptersError(String(error));
      } finally {
        setLoadingChapters(false);
      }
    };

    loadChapters();
  }, [pickedComic]);

  if (!pickedComic) {
    return <section className="pane">请先从搜索结果中选择漫画</section>;
  }

  const title = pickedComic.title;
  const author = pickedComic.author;
  const chapters = comicDetail?.chapters ?? [];

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
      comic: { id: pickedComic.id, title, author },
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
      <h2>{title}</h2>
      <p>作者: {author}</p>
      {loadingChapters && <p>章节加载中...</p>}
      {chaptersError && <p className="error-text">{chaptersError}</p>}
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
