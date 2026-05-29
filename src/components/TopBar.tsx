import { useState } from "react";
import { login } from "../api/auth";
import { saveConfig } from "../api/config";
import { useAppStore } from "../store";
import { getUserProfile } from "../api/user";
import { LoginDialog } from "./LoginDialog";
import { SettingsDialog } from "./SettingsDialog";
import type { Config } from "../types";
import { openDownloadDir } from "../api/shell";

export function TopBar() {
  const config = useAppStore((state) => state.config);
  const userProfile = useAppStore((state) => state.userProfile);
  const setConfig = useAppStore((state) => state.setConfig);
  const updateConfig = useAppStore((state) => state.updateConfig);
  const setUserProfile = useAppStore((state) => state.setUserProfile);

  const [loginOpen, setLoginOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveConfig = async () => {
    if (!config) {
      return;
    }

    await saveConfig(config);
    setMessage("保存配置成功");
  };

  const handleSaveSettings = async (nextConfig: Config) => {
    setConfig(nextConfig);
    await saveConfig(nextConfig);
    setMessage("设置已保存");
  };

  const handleLogin = async (email: string, password: string) => {
    if (!config) {
      return;
    }

    const token = await login(email, password);

    const nextConfig = {
      ...config,
      token,
    };

    setConfig(nextConfig);
    await saveConfig(nextConfig);
    setMessage("登录成功，已保存 token");
  };

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
      setMessage("获取用户信息成功");
    } catch (error) {
      setMessage(String(error));
    }
  };

  if (!config) {
    // 配置未加载完成，不显示任何内容
    return null;
  }

  const handleOpenDownloadDir = async () => {
    try {
      await openDownloadDir();
    } catch (error) {
      setMessage(String(error));
    }
  };

  return (
    <header className="top-bar">
      <h1>Pica App</h1>
      {userProfile && <p>当前用户：{userProfile.name}</p>}

      <input
        value={config.token}
        onChange={(event) => updateConfig({ token: event.currentTarget.value })}
        placeholder="Authorization Token"
      />
      <button onClick={handleSaveConfig}>保存配置</button>
      <button onClick={() => setLoginOpen(true)}>登录</button>
      <button onClick={() => setSettingsOpen(true)}>设置</button>
      <button onClick={handleOpenDownloadDir}>打开下载目录</button>
      <button onClick={loadUserProfile}>获取用户信息</button>

      {message && <p>{message}</p>}
      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />
      <SettingsDialog
        open={settingsOpen}
        config={config}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </header>
  );
}
