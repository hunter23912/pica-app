import { MainTabs } from "./MainTabs";
import { DownloadPanel } from "./DownloadPanel";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <main className="app-shell">
      <TopBar />
      <div className="app-layout">
        <section className="main-panel">
          <MainTabs />
        </section>

        <DownloadPanel />
      </div>
    </main>
  );
}
