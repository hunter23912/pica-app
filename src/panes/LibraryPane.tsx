import { getDownloadedComics } from "../api/library";
import { ComicCard } from "../components/ComicCard";
import { usePickComic } from "../hooks/usePickComic";
import { useAppStore } from "../store";
import { useEffect, useState } from "react";

export function LibraryPane() {
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const libraryResult = useAppStore((state) => state.libraryResult);
  const setLibraryResult = useAppStore((state) => state.setLibraryResult);
  const pickComic = usePickComic();

  const handleLoadLibrary = async () => {
    setLoadingLibrary(true);
    setLibraryError("");

    try {
      const result = await getDownloadedComics();
      setLibraryResult(result);
    } catch (error) {
      console.error("Failed to load downloaded comics:", error);
      setLibraryResult(undefined);
      setLibraryError(String(error));
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    handleLoadLibrary();
  }, []);

  return (
    <section className="pane">
      <button onClick={handleLoadLibrary} disabled={loadingLibrary}>
        {loadingLibrary ? "加载中..." : "刷新"}
      </button>
      {libraryError && <p className="error-text">{libraryError}</p>}

      {libraryResult && libraryResult.comics.length === 0 && (
        <p>暂无本地漫画</p>
      )}
      {libraryResult && (
        <div className="comic-list">
          {libraryResult.comics.map((comic) => (
            <ComicCard
              key={comic.id}
              title={comic.title}
              author={comic.author}
              description={
                comic.chapterCount !== undefined
                  ? `已下载 ${comic.downloadedChapterCount ?? 0}/${comic.chapterCount} 章`
                  : undefined
              }
              onClick={() => pickComic(comic)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
