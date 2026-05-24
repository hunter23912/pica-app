import { useState } from "react";
import { searchComic } from "../api/comic";
import { useAppStore } from "../store";

export function SearchPane() {
  const setPickedComic = useAppStore((state) => state.setPickedComic);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const searchResult = useAppStore((state) => state.searchResult);
  const setSearchResult = useAppStore((state) => state.setSearchResult);
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    try {
      const result = await searchComic(keyword);
      setSearchResult(result);
      setMessage(`共 ${result.comics.length} 条结果`);
    } catch (error) {
      setSearchResult(undefined);
      setMessage(String(error));
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
      <div className="search-area">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.currentTarget.value)}
          placeholder="搜索漫画"
        />

        <button onClick={handleSearch}>搜索</button>
      </div>

      {message && <p>{message}</p>}
      {searchResult && (
        <div className="comic-list">
          {searchResult.comics.map((comic) => (
            // <div key={comic.id} className="comic-card">
            <button
              key={comic.id}
              className="comic-card"
              onClick={() => handlePickComic(comic)}
            >
              <strong>{comic.title}</strong>
              <span>{comic.author}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
