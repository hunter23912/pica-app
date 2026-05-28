import { getDownloadedComics } from "../api/library";
import { ComicCard } from "../components/ComicCard";
import { usePickComic } from "../hooks/usePickComic";
import { useAppStore } from "../store";

export function LibraryPane() {
  const libraryResult = useAppStore((state) => state.libraryResult);
  const setLibraryResult = useAppStore((state) => state.setLibraryResult);
  const pickComic = usePickComic();

  const handleLoadLibrary = async () => {
    try {
      const result = await getDownloadedComics();
      setLibraryResult(result);
    } catch (error) {
      console.error("Failed to load downloaded comics:", error);
      setLibraryResult(undefined);
    }
  };

  return (
    <section className="pane">
      <button onClick={handleLoadLibrary}>加载本地库存</button>

      {libraryResult && (
        <div className="comic-list">
          {libraryResult.comics.map((comic) => (
            <ComicCard
              key={comic.id}
              title={comic.title}
              author={comic.author}
              onClick={() => pickComic(comic)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
