import { SearchPane } from "../panes/SearchPane";
import { FavoritePane } from "../panes/FavoritePane";
import { RankPane } from "../panes/RankPane";
import { LibraryPane } from "../panes/LibraryPane";
import { ChapterPane } from "../panes/ChapterPane";
import { MainTab } from "../types";
import { useAppStore } from "../store";

const tabs: { value: MainTab; label: string }[] = [
  { value: "search", label: "搜索" },
  { value: "favorite", label: "收藏夹" },
  { value: "rank", label: "排行榜" },
  { value: "library", label: "本地库存" },
  { value: "chapter", label: "章节详情" },
];

export function MainTabs() {
  const currentTab = useAppStore((state) => state.currentTab);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);

  return (
    <section className="main-tabs">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={
              tab.value === currentTab ? "tab-button active" : "tab-button"
            }
            onClick={() => setCurrentTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {currentTab === "search" && <SearchPane />}
        {currentTab === "favorite" && <FavoritePane />}
        {currentTab === "rank" && <RankPane />}
        {currentTab === "library" && <LibraryPane />}
        {currentTab === "chapter" && <ChapterPane />}
      </div>
    </section>
  );
}
