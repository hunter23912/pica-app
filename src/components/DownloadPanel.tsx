import { openChapterDir } from "../api/download";
import { useAppStore } from "../store";

export function DownloadPanel() {
  const downloadTasks = useAppStore((state) => state.downloadTasks);
  const downloadLogs = useAppStore((state) => state.downloadLogs);
  const cancelDownloadTask = useAppStore((state) => state.cancelDownloadTask);
  const clearDownloadLogs = useAppStore((state) => state.clearDownloadLogs);
  const clearInactiveDownloadTaskRecords = useAppStore(
    (state) => state.clearInactiveDownloadTaskRecords,
  );
  const pauseDownloadTask = useAppStore((state) => state.pauseDownloadTask);
  const resumeDownloadTask = useAppStore((state) => state.resumeDownloadTask);

  const hasClearableTasksRecords = downloadTasks.some(
    (task) => task.state !== "pending" && task.state !== "downloading",
  );
  const recentLogs = downloadLogs.slice(-20);

  return (
    <aside className="download-panel">
      <div className="panel-header">
        <h2>下载列表</h2>

        {hasClearableTasksRecords && (
          <button onClick={clearInactiveDownloadTaskRecords}>清空记录</button>
        )}
      </div>
      {downloadTasks.length === 0 ? (
        <div className="empty-panel">暂无下载任务</div>
      ) : (
        <div className="download-task-list">
          {downloadTasks.map((task) => (
            <div key={task.id} className="download-task-card">
              <div className="download-task-title-row">
                <strong>{task.comicTitle}</strong>

                <div className="download-task-actions">
                  {task.state === "downloading" && (
                    <button onClick={() => pauseDownloadTask(task.id)}>
                      暂停
                    </button>
                  )}

                  {task.state === "paused" && (
                    <button onClick={() => resumeDownloadTask(task.id)}>
                      恢复
                    </button>
                  )}

                  {task.state === "completed" && (
                    <button
                      onClick={() =>
                        openChapterDir({
                          comicTitle: task.comicTitle,
                          chapterTitle: task.chapterTitle,
                        }).catch((error) => {
                          console.error("Failed to open chapter dir:", error);
                        })
                      }
                    >
                      打开目录
                    </button>
                  )}

                  {(task.state === "pending" ||
                    task.state === "downloading" ||
                    task.state === "paused") && (
                    <button onClick={() => cancelDownloadTask(task.id)}>
                      取消
                    </button>
                  )}
                </div>
              </div>
              <span>{task.chapterTitle}</span>
              <span className="download-task-config">
                章节并发 {task.chapterConcurrency} / 图片并发{" "}
                {task.imageConcurrency}
              </span>
              {task.downloadDir && (
                <span className="download-task-config">
                  目录：{task.downloadDir}
                </span>
              )}
              <div className="download-task-meta">
                <span>{getTaskStateText(task.state)}</span>
                {task.errorMessage && (
                  <span className="error-text">{task.errorMessage}</span>
                )}
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

      <section className="download-log-panel">
        <div className="panel-header">
          <h3>最近日志</h3>

          {downloadLogs.length > 0 && (
            <button onClick={clearDownloadLogs}>清空日志</button>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="empty-panel">暂无日志</div>
        ) : (
          <div className="download-log-list">
            {recentLogs.map((log, index) => (
              <div
                key={`${log.taskId}-${index}`}
                className={`download-log-row download-log-row-${log.level}`}
              >
                <span className="download-log-time">
                  {formatLogTime(log.createdAt)}
                </span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}

function formatLogTime(createdAt: string) {
  const timestamp = Number(createdAt);

  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return "--:--:--";
  }

  return new Date(timestamp).toLocaleTimeString();
}

function getTaskStateText(state: string) {
  if (state === "pending") return "等待中";
  if (state === "downloading") return "下载中";
  if (state === "completed") return "已完成";
  if (state === "canceled") return "已取消";
  if (state === "failed") return "失败";
  if (state === "paused") return "已暂停";
  return state;
}
