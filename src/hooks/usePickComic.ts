import { useAppStore } from "../store";
import type { ComicInSearch } from "../types";

export function usePickComic() {
  const setPickedComic = useAppStore((state) => state.setPickedComic);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);

  const pickComic = (
    comic: Pick<ComicInSearch, "id" | "title" | "author" | "chapterCount">,
  ) => {
    setPickedComic({
      id: comic.id,
      title: comic.title,
      author: comic.author,
      chapterCount: comic.chapterCount,
    });

    setCurrentTab("chapter");
  };

  return pickComic;
}
