import { getFavorite } from "../api/favorite";
import { useAppStore } from "../store";
import { ComicCard } from "../components/ComicCard";

export function FavoritePane() {
  const favoriteResult = useAppStore((state) => state.favoriteResult);
  const setFavoriteResult = useAppStore((state) => state.setFavoriteResult);
  const setPickedComic = useAppStore((state) => state.setPickedComic);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);

  const handleLoadFavorite = async () => {
    try {
      const result = await getFavorite();
      setFavoriteResult(result);
    } catch (error) {
      console.error(error);
      setFavoriteResult(undefined);
    }
  };

  const handlePickComic = (comic: {
    id: string;
    title: string;
    author: string;
  }) => {
    setPickedComic({
      id: comic.id,
      title: comic.title,
      author: comic.author,
    });
    setCurrentTab("chapter");
  };

  return (
    <section className="pane">
      <button onClick={handleLoadFavorite}>加载收藏夹</button>

      {favoriteResult && (
        <div className="comic-list">
          {favoriteResult.comics.map((comic) => (
            <ComicCard
              key={comic.id}
              title={comic.title}
              author={comic.author}
              onClick={() => handlePickComic(comic)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
