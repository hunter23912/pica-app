import { getRank } from "../api/rank";
import { ComicCard } from "../components/ComicCard";
import { useAppStore } from "../store";

export function RankPane() {
  const rankResult = useAppStore((state) => state.rankResult);
  const setRankResult = useAppStore((state) => state.setRankResult);
  const setPickedComic = useAppStore((state) => state.setPickedComic);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);

  const handleLoadRank = async () => {
    try {
      const result = await getRank();
      setRankResult(result);
    } catch (error) {
      console.error(error);
      setRankResult(undefined);
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
      <button onClick={handleLoadRank}>加载排行榜</button>

      {rankResult && (
        <div className="comic-list">
          {rankResult.comics.map((comic) => (
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
