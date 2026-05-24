import { useAppStore } from "../store";

export function DownloadPanel() {
  const downloadTasks = useAppStore((state) => state.downloadTasks);

  const getTaskStateText = (state: string) => {
    if (state === "pending") return "等待中";
    if (state === "downloading") return "下载中";
    if (state === "completed") return "已完成";
    return state;
  };

  return (
    <aside className="download-panel">
      <div className="panel-header">
        <h2>下载列表</h2>
      </div>
      {downloadTasks.length === 0 ? (
        <div className="empty-panel">暂无下载任务</div>
      ) : (
        <div className="download-task-list">
          {downloadTasks.map((task) => (
            <div key={task.id} className="download-task-card">
              <strong>{task.comicTitle}</strong>
              <span>{task.chapterTitle}</span>
              <div className="download-task-meta">
                <span>{getTaskStateText(task.state)}</span>
                <span>{task.progress}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
