import "./App.css";
import { useEffect } from "react";
import { getConfig } from "./api/config";
import { getUserProfile } from "./api/user";
import { AppShell } from "./components/AppShell";
import { useAppStore } from "./store";
import { useDownloadLogEvents } from "./hooks/useDownloadLogEvents";
import { useDownloadTaskEvents } from "./hooks/useDownloadTaskEvents";

function App() {
  const config = useAppStore((state) => state.config);
  const setConfig = useAppStore((state) => state.setConfig);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  useDownloadTaskEvents();
  useDownloadLogEvents();

  useEffect(() => {
    async function loadConfig() {
      const loadedConfig = await getConfig();
      setConfig(loadedConfig);

      if (loadedConfig.token.trim() !== "") {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
        } catch (error) {
          setUserProfile(undefined);
        }
      }
    }
    loadConfig();
  }, [setConfig, setUserProfile]);

  if (!config) {
    return <main className="container">加载配置中...</main>;
  }

  return <AppShell />;
}

export default App;
