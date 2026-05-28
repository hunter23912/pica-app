import { getFavorite } from "../api/favorite";
import { useAppStore } from "../store";
import { ComicCard } from "../components/ComicCard";
import { usePickComic } from "../hooks/usePickComic";

export function FavoritePane() {
  const favoriteResult = useAppStore((state) => state.favoriteResult);
  const setFavoriteResult = useAppStore((state) => state.setFavoriteResult);

  const pickComic = usePickComic();

  const handleLoadFavorite = async () => {
    try {
      const result = await getFavorite();
      setFavoriteResult(result);
    } catch (error) {
      console.error(error);
      setFavoriteResult(undefined);
    }
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
              onClick={() => pickComic(comic)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
