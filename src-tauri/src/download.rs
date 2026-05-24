use tauri::{AppHandle, Emitter};

const DOWNLOAD_TASK_EVENT: &str = "download_task_event";

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadTask {
    pub id: String,
    pub comic_title: String,
    pub chapter_title: String,
    pub state: String,
    pub progress: u32,
}

#[tauri::command]
pub fn create_download_task(
    app: AppHandle,
    comic_id: String,
    comic_title: String,
    chapter_id: String,
    chapter_title: String,
) -> Result<DownloadTask, String> {
    let task = DownloadTask {
        id: format!("{}-{}", comic_id, chapter_id),
        comic_title: comic_title.clone(),
        chapter_title: chapter_title.clone(),
        state: "pending".to_string(),
        progress: 0,
    };

    let task_for_event = task.clone();

    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(500));

        let _ = app.emit(
            DOWNLOAD_TASK_EVENT,
            DownloadTask {
                state: "downloading".to_string(),
                progress: 30,
                ..task_for_event.clone()
            },
        );

        std::thread::sleep(std::time::Duration::from_millis(500));

        let _ = app.emit(
            DOWNLOAD_TASK_EVENT,
            DownloadTask {
                state: "downloading".to_string(),
                progress: 70,
                ..task_for_event.clone()
            },
        );

        std::thread::sleep(std::time::Duration::from_millis(500));

        let _ = app.emit(
            DOWNLOAD_TASK_EVENT,
            DownloadTask {
                state: "completed".to_string(),
                progress: 100,
                ..task_for_event
            },
        );
    });

    Ok(task)
}
