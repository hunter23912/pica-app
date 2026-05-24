import { create } from "zustand";
import type {
  Comic,
  Config,
  DownloadTask,
  UserProfile,
  SearchResult,
  MainTab,
} from "./types";

type AppStore = {
  config?: Config;
  userProfile?: UserProfile;
  pickedComic?: Comic;
  searchResult?: SearchResult;
  currentTab: MainTab;
  downloadTasks: DownloadTask[];
  setConfig: (config: Config) => void;
  updateConfig: (partialConfig: Partial<Config>) => void;
  setUserProfile: (profile?: UserProfile) => void;
  setPickedComic: (comic?: Comic) => void;
  setSearchResult: (result?: SearchResult) => void;
  setCurrentTab: (tab: MainTab) => void;
  addDownloadTask: (task: DownloadTask) => void;
  updateDownloadTask: (
    taskId: string,
    partialTask: Partial<DownloadTask>,
  ) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  config: undefined,
  userProfile: undefined,
  pickedComic: undefined,
  searchResult: undefined,
  currentTab: "search",
  downloadTasks: [],
  setConfig: (config) => {
    set({ config });
  },

  updateConfig: (partialConfig) => {
    set((state) => {
      if (!state.config) {
        return state;
      }
      return {
        config: {
          ...state.config,
          ...partialConfig,
        },
      };
    });
  },

  setUserProfile: (userProfile) => {
    set({ userProfile });
  },
  setPickedComic: (comic) => {
    set({ pickedComic: comic });
  },
  setSearchResult: (searchResult) => {
    set({ searchResult });
  },
  setCurrentTab: (tab) => {
    set({ currentTab: tab });
  },
  addDownloadTask: (task) => {
    set((state) => ({
      downloadTasks: [...state.downloadTasks, task],
    }));
  },
  updateDownloadTask: (taskId, partialTask) => {
    set((state) => ({
      downloadTasks: state.downloadTasks.map((task) =>
        task.id === taskId ? { ...task, ...partialTask } : task,
      ),
    }));
  },
}));
