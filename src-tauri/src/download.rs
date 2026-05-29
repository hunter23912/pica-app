use crate::config::Config;
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
    pub download_dir: String,
    pub chapter_concurrency: u32,
    pub image_concurrency: u32,
}

#[tauri::command]
pub fn create_download_task(
    app: AppHandle,
    comic_id: String,
    comic_title: String,
    chapter_id: String,
    chapter_title: String,
) -> Result<DownloadTask, String> {
    let config = Config::load(&app)?;
    let task = DownloadTask {
        id: format!("{}-{}", comic_id, chapter_id),
        comic_title: comic_title.clone(),
        chapter_title: chapter_title.clone(),
        state: "pending".to_string(),
        progress: 0,
        chapter_concurrency: config.chapter_concurrency,
        image_concurrency: config.image_concurrency,
        download_dir: config.effective_download_dir(&app)?,
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

#[tauri::command]
pub fn open_download_dir(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;

    let config = crate::config::Config::load(&app)?;
    let download_dir = config.effective_download_dir(&app)?;

    if download_dir.is_empty() {
        return Err("请先设置下载目录".to_string());
    }

    let path = std::path::PathBuf::from(download_dir);

    if !path.exists() {
        std::fs::create_dir_all(&path).map_err(|err| err.to_string())?;
    }

    if !path.is_dir() {
        return Err("下载目录不是一个有效文件夹".to_string());
    }

    app.opener()
        .open_path(path.to_string_lossy().to_string(), None::<&str>)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn get_default_download_dir(app: AppHandle) -> Result<String, String> {
    Config::default_download_dir(&app)
}
