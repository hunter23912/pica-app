use crate::config::Config;
use tauri::{AppHandle, Emitter};
const DOWNLOAD_TASK_EVENT: &str = "download_task_event";
const DOWNLOAD_LOG_EVENT: &str = "download_log_event";
const FAKE_IMAGE_COUNT: u32 = 3;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadTask {
    pub id: String,
    pub comic_id: String,
    pub comic_title: String,
    pub chapter_id: String,
    pub chapter_title: String,
    pub chapter_order: u32,
    pub chapter_count: u32,
    pub state: String,
    pub progress: u32,
    pub error_message: Option<String>,
    pub download_dir: String,
    pub chapter_concurrency: u32,
    pub image_concurrency: u32,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadLog {
    task_id: String,
    level: String,
    message: String,
    created_at: String,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadedImage {
    index: u32,
    url: String,
    file_name: String,
    state: String,
}

#[derive(Debug, Clone)]
struct ChapterImageSource {
    index: u32,
    url: String,
}

fn filename_safe(value: &str) -> String {
    // 替换 Windows 文件名中的非法字符。
    value
        .chars()
        .map(|ch| match ch {
            '<' | '>' | ':' | '"' | '/' | '\\' | '|' | '?' | '*' => '_',
            _ => ch,
        })
        .collect()
}

// 创建漫画/章节目录结构，并写入初始元数据文件。
fn write_download_placeholders(task: &DownloadTask) -> Result<(), String> {
    let comic_dir =
        std::path::PathBuf::from(&task.download_dir).join(filename_safe(&task.comic_title));

    let chapter_dir = comic_dir.join(filename_safe(&task.chapter_title));

    std::fs::create_dir_all(&chapter_dir).map_err(|err| err.to_string())?;

    let comic_metadata = serde_json::json!({
        "comicId": task.comic_id,
        "comicTitle": task.comic_title,
        "chapterCount": task.chapter_count,
        "downloadDir": task.download_dir,
    });

    std::fs::write(
        comic_dir.join("metadata.json"),
        serde_json::to_string_pretty(&comic_metadata).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;

    write_chapter_metadata(task, &[])?;

    Ok(())
}

// 获取章节下载任务对应的元数据文件路径。
fn chapter_metadata_path(task: &DownloadTask) -> std::path::PathBuf {
    std::path::PathBuf::from(&task.download_dir)
        .join(filename_safe(&task.comic_title))
        .join(filename_safe(&task.chapter_title))
        .join("chapter.json")
}

fn is_chapter_completed(task: &DownloadTask) -> Result<bool, String> {
    let metadata_path = chapter_metadata_path(task);

    if !metadata_path.exists() {
        return Ok(false);
    }

    let text = std::fs::read_to_string(metadata_path).map_err(|err| err.to_string())?;
    let metadata: serde_json::Value = serde_json::from_str(&text).map_err(|err| err.to_string())?;

    Ok(metadata.get("state").and_then(serde_json::Value::as_str) == Some("completed"))
}

fn emit_download_log(
    app: &AppHandle,
    task: &DownloadTask,
    level: impl Into<String>,
    message: impl Into<String>,
) {
    let created_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_millis().to_string())
        .unwrap_or_else(|_| "0".to_string());

    let _ = app.emit(
        DOWNLOAD_LOG_EVENT,
        DownloadLog {
            task_id: task.id.clone(),
            level: level.into(),
            message: message.into(),
            created_at,
        },
    );
}

// 持久化章节任务状态，让本地元数据反映当前进度。
fn write_chapter_metadata(task: &DownloadTask, images: &[DownloadedImage]) -> Result<(), String> {
    let files: Vec<&str> = images
        .iter()
        .map(|image| image.file_name.as_str())
        .collect();

    let chapter_metadata = serde_json::json!({
        "chapterId": task.chapter_id,
        "chapterTitle": task.chapter_title,
        "order": task.chapter_order,
        "state": task.state,
        "progress": task.progress,
        "errorMessage": task.error_message,
        "files": files,
        "images": images,
    });

    std::fs::write(
        chapter_metadata_path(task),
        serde_json::to_string_pretty(&chapter_metadata).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())
}

// 保存单张图片文件；当前写入占位文本，后续会替换为真实 HTTP 下载。
fn download_image_file(
    task: &DownloadTask,
    image_source: &ChapterImageSource,
) -> Result<String, String> {
    let chapter_dir = std::path::PathBuf::from(&task.download_dir)
        .join(filename_safe(&task.comic_title))
        .join(filename_safe(&task.chapter_title));

    let file_name = format!("{index:04}.txt", index = image_source.index);
    let image_path = chapter_dir.join(&file_name);

    std::fs::write(
        image_path,
        format!(
            "placeholder image {} for {}\nsource: {}",
            image_source.index, task.chapter_title, image_source.url,
        ),
    )
    .map_err(|err| err.to_string())?;

    Ok(file_name)
}

// 生成假图片地址，用来模拟真实 API 返回的图片 URL。
fn fake_image_url(task: &DownloadTask, index: u32) -> String {
    format!("fake://{}/{}/{}", task.comic_id, task.chapter_id, index)
}

fn get_chapter_image_sources(task: &DownloadTask) -> Vec<ChapterImageSource> {
    (1..=FAKE_IMAGE_COUNT)
        .map(|index| ChapterImageSource {
            index,
            url: fake_image_url(task, index),
        })
        .collect()
}

fn run_download_task(app: AppHandle, task: DownloadTask) {
    emit_download_log(&app, &task, "info", "开始下载章节");

    let image_sources = get_chapter_image_sources(&task);
    let image_count = image_sources.len() as u32;
    let mut downloaded_images = Vec::new();

    emit_download_log(
        &app,
        &task,
        "info",
        format!("获取到 {} 张图片", image_count),
    );

    for image_source in image_sources {
        std::thread::sleep(std::time::Duration::from_millis(500));

        match download_image_file(&task, &image_source) {
            Ok(file_name) => {
                let image_index = image_source.index;

                downloaded_images.push(DownloadedImage {
                    index: image_index,
                    url: image_source.url,
                    file_name,
                    state: "completed".to_string(),
                });

                emit_download_log(
                    &app,
                    &task,
                    "info",
                    format!("第 {} 张图片下载完成", image_index),
                );
            }
            Err(error) => {
                let failed_task = DownloadTask {
                    state: "failed".to_string(),
                    error_message: Some(error),
                    ..task.clone()
                };

                let _ = write_chapter_metadata(&failed_task, &downloaded_images);
                emit_download_log(&app, &failed_task, "error", "下载失败");
                let _ = app.emit(DOWNLOAD_TASK_EVENT, failed_task);
                return;
            }
        }

        let progress = image_source.index * 100 / image_count;
        let state = if image_source.index == image_count {
            "completed"
        } else {
            "downloading"
        };

        let current_task = DownloadTask {
            state: state.to_string(),
            progress,
            error_message: None,
            ..task.clone()
        };

        let _ = write_chapter_metadata(&current_task, &downloaded_images);
        if state == "completed" {
            emit_download_log(&app, &current_task, "info", "章节下载完成");
        }
        let _ = app.emit(DOWNLOAD_TASK_EVENT, current_task);
    }
}

#[tauri::command]
pub fn create_download_task(
    app: AppHandle,
    comic_id: String,
    comic_title: String,
    chapter_id: String,
    chapter_title: String,
    chapter_order: u32,
    chapter_count: u32,
) -> Result<DownloadTask, String> {
    let config = Config::load(&app)?;
    let task = DownloadTask {
        id: format!("{}-{}", comic_id, chapter_id),
        comic_id,
        comic_title: comic_title.clone(),
        chapter_id,
        chapter_title: chapter_title.clone(),
        chapter_order,
        chapter_count,
        state: "pending".to_string(),
        progress: 0,
        chapter_concurrency: config.chapter_concurrency,
        image_concurrency: config.image_concurrency,
        download_dir: config.effective_download_dir(&app)?,
        error_message: None,
    };

    if is_chapter_completed(&task)? {
        return Err("该章节已经下载完成，无需重复下载".to_string());
    }

    write_download_placeholders(&task)?;

    let task_for_event = task.clone();

    std::thread::spawn(move || {
        run_download_task(app, task_for_event);
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
pub fn open_chapter_dir(
    app: AppHandle,
    comic_title: String,
    chapter_title: String,
) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;

    let config = Config::load(&app)?;
    let download_dir = config.effective_download_dir(&app)?;
    let path = std::path::PathBuf::from(download_dir)
        .join(filename_safe(&comic_title))
        .join(filename_safe(&chapter_title));

    if !path.exists() {
        return Err("章节目录不存在".to_string());
    }

    if !path.is_dir() {
        return Err("章节目录不是一个有效文件夹".to_string());
    }

    app.opener()
        .open_path(path.to_string_lossy().to_string(), None::<&str>)
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn get_default_download_dir(app: AppHandle) -> Result<String, String> {
    Config::default_download_dir(&app)
}
