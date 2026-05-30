import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../store";
import { startDownloadTasks } from "../services/downloadService";
import type { Chapter, ComicDetail } from "../types";
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

  const loadChapters = useCallback(async () => {
    if (!pickedComic) {
      return;
    }

    setChaptersError("");
    setLoadingChapters(true);
    setSelectedChapterIds([]);

    try {
      const result = await getComicDetail(pickedComic.id);
      setComicDetail(result);
    } catch (error) {
      setChaptersError(String(error));
    } finally {
      setLoadingChapters(false);
    }
  }, [pickedComic]);

  useEffect(() => {
    if (!pickedComic) {
      setSelectedChapterIds([]);
      setChaptersError("");
      return;
    }

    loadChapters();
  }, [pickedComic, loadChapters]);

  if (!pickedComic) {
    return <section className="pane">请先从搜索结果中选择漫画</section>;
  }

  const title = pickedComic.title;
  const author = pickedComic.author;
  const chapters = comicDetail?.chapters ?? [];

  const toggleChapter = (chapter: Chapter) => {
    if (isChapterDownloaded(chapter.state)) {
      return; // 已下载章节不允许选择
    }
    setSelectedChapterIds((current) => {
      if (current.includes(chapter.id)) {
        // 如果已经选中，则取消选中
        return current.filter((id) => id !== chapter.id);
      }
      return [...current, chapter.id]; // 否则添加到选中列表
    });
  };

  const handleDownloadSelected = async () => {
    const selectedChapters = chapters.filter(
      (chapter) =>
        selectedChapterIds.includes(chapter.id) &&
        !isChapterDownloaded(chapter.state),
    );
    try {
      const result = await startDownloadTasks({
        comic: {
          id: pickedComic.id,
          title,
          author,
          chapterCount: pickedComic.chapterCount,
        },
        chapters: selectedChapters,
        chapterCount: pickedComic.chapterCount ?? chapters.length,
        addDownloadTask,
        hasDownloadTask,
      });
      setMessage(
        `已创建 ${result.createdCount} 个任务，跳过 ${result.skippedCount} 个重复任务。`,
      );
      setSelectedChapterIds([]);
    } catch (error) {
      setMessage(String(error));
    }
  };

  return (
    <section className="pane">
      <h2>{title}</h2>
      <p>作者: {author}</p>
      <button onClick={loadChapters} disabled={loadingChapters}>
        刷新
      </button>
      {loadingChapters && <p>章节加载中...</p>}
      {chaptersError && <p className="error-text">{chaptersError}</p>}
      <p>已选择 {selectedChapterIds.length} 个章节</p>
      {message && <p>{message}</p>}

      <div className="chapter-list">
        {chapters.map((chapter) => (
          <label
            key={chapter.id}
            className={
              isChapterDownloaded(chapter.state)
                ? "chapter-row chapter-row-disabled"
                : "chapter-row"
            }
          >
            <input
              type="checkbox"
              checked={selectedChapterIds.includes(chapter.id)}
              disabled={isChapterDownloaded(chapter.state)}
              onChange={() => toggleChapter(chapter)}
            />
            <span>{chapter.title}</span>
            {chapter.state && (
              <span className="chapter-status">
                {getChapterStateText(chapter.state)}
                {chapter.progress !== undefined ? ` ${chapter.progress}%` : ""}
              </span>
            )}
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

function getChapterStateText(state: string) {
  if (state === "completed") return "已完成";
  if (state === "pending") return "等待中";
  if (state === "downloading") return "下载中";
  if (state === "canceled") return "已取消";
  return state;
}

function isChapterDownloaded(state?: string) {
  return state === "completed";
}
