import { create } from "zustand";
import type {
  Comic,
  Config,
  DownloadTask,
  MainTab,
  SearchResult,
  UserProfile,
  FavoriteResult,
  RankResult,
} from "./types";

type ConfigSlice = {
  config?: Config;
  setConfig: (config: Config) => void;
  updateConfig: (partialConfig: Partial<Config>) => void;
};

type UserSlice = {
  userProfile?: UserProfile;
  setUserProfile: (profile?: UserProfile) => void;
};

type NavigationSlice = {
  currentTab: MainTab;
  pickedComic?: Comic;
  searchResult?: SearchResult;
  favoriteResult?: FavoriteResult;
  rankResult?: RankResult;
  setPickedComic: (comic?: Comic) => void;
  setSearchResult: (result?: SearchResult) => void;
  setFavoriteResult: (result?: FavoriteResult) => void;
  setRankResult: (result?: RankResult) => void;
  setCurrentTab: (tab: MainTab) => void;
};

type DownloadSlice = {
  downloadTasks: DownloadTask[];
  addDownloadTask: (task: DownloadTask) => boolean;
  hasDownloadTask: (taskId: string) => boolean;
  updateDownloadTask: (
    taskId: string,
    partialTask: Partial<DownloadTask>,
  ) => void;
  cancelDownloadTask: (taskId: string) => void;
  clearInactiveDownloadTaskRecords: () => void;
  pauseDownloadTask: (taskId: string) => void;
  resumeDownloadTask: (taskId: string) => void;
};

type AppStore = ConfigSlice & UserSlice & NavigationSlice & DownloadSlice;

function isActiveDownloadTask(task: DownloadTask) {
  return task.state === "pending" || task.state === "downloading";
}

function shouldIgnoreDownloadTaskUpdate(task: DownloadTask) {
  return task.state === "canceled" || task.state === "paused";
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Config
  config: undefined,
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

  // User
  userProfile: undefined,
  setUserProfile: (userProfile) => {
    set({ userProfile });
  },

  // Navigation and content
  currentTab: "search",
  pickedComic: undefined,
  searchResult: undefined,
  favoriteResult: undefined,
  rankResult: undefined,
  setPickedComic: (comic) => {
    set({ pickedComic: comic });
  },
  setSearchResult: (searchResult) => {
    set({ searchResult });
  },
  setFavoriteResult: (favoriteResult) => {
    set({ favoriteResult });
  },
  setRankResult: (rankResult) => {
    set({ rankResult });
  },
  setCurrentTab: (tab) => {
    set({ currentTab: tab });
  },

  // Download tasks
  downloadTasks: [],
  addDownloadTask: (task) => {
    const exists = get().downloadTasks.some(
      (currentTask) => currentTask.id === task.id,
    );

    if (exists) {
      return false;
    }

    set((state) => ({
      downloadTasks: [...state.downloadTasks, task],
    }));

    return true;
  },
  hasDownloadTask: (taskId) => {
    return get().downloadTasks.some((task) => task.id === taskId);
  },
  updateDownloadTask: (taskId, partialTask) => {
    set((state) => ({
      downloadTasks: state.downloadTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        if (shouldIgnoreDownloadTaskUpdate(task)) {
          return task;
        }
        return {
          ...task,
          ...partialTask,
        };
      }),
    }));
  },
  cancelDownloadTask: (taskId) => {
    set((state) => ({
      downloadTasks: state.downloadTasks.map((task) =>
        task.id === taskId ? { ...task, state: "canceled" } : task,
      ),
    }));
  },
  clearInactiveDownloadTaskRecords: () => {
    set((state) => ({
      downloadTasks: state.downloadTasks.filter(isActiveDownloadTask),
    }));
  },
  pauseDownloadTask: (taskId) => {
    set((state) => ({
      downloadTasks: state.downloadTasks.map((task) =>
        task.id === taskId && task.state === "downloading"
          ? { ...task, state: "paused" }
          : task,
      ),
    }));
  },
  resumeDownloadTask: (taskId) => {
    set((state) => ({
      downloadTasks: state.downloadTasks.map((task) =>
        task.id === taskId && task.state === "paused"
          ? { ...task, state: "downloading" }
          : task,
      ),
    }));
  },
}));
