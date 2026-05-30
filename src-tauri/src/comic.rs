use crate::config::Config;
use tauri::AppHandle;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ComicInSearch {
    pub id: String,
    pub title: String,
    pub author: String,
    pub cover_url: Option<String>,
    pub chapter_count: Option<u32>,
    pub downloaded_chapter_count: Option<u32>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub comics: Vec<ComicInSearch>,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Chapter {
    pub id: String,
    pub title: String,
    pub order: u32,
    pub state: Option<String>,
    pub progress: Option<u32>,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ComicDetail {
    pub id: String,
    pub title: String,
    pub author: String,
    pub chapters: Vec<Chapter>,
}

fn ensure_authorized(app: &AppHandle, message: &str) -> Result<(), String> {
    let config = Config::load(app)?;

    if config.token.trim().is_empty() {
        return Err(message.to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn search_comic(app: AppHandle, keyword: String) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再搜索漫画")?;

    if keyword.trim().is_empty() {
        return Err("请输入搜索关键词".to_string());
    }

    Ok(SearchResult {
        comics: crate::fake_pica::search_comics(keyword.trim()),
    })
}

#[tauri::command]
pub fn get_favorite(app: AppHandle) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再查看收藏夹")?;

    Ok(SearchResult {
        comics: crate::fake_pica::comics("favorite", "收藏漫画", "收藏作者"),
    })
}

#[tauri::command]
pub fn get_rank(app: AppHandle) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再查看排行榜")?;

    Ok(SearchResult {
        comics: crate::fake_pica::comics("rank", "排行榜漫画", "排行作者"),
    })
}

#[tauri::command]
pub fn get_downloaded_comics(app: AppHandle) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再查看本地库存")?;

    let config = Config::load(&app)?;
    let download_dir = config.effective_download_dir(&app)?;
    let comics = scan_downloaded_comics(&download_dir)?;

    Ok(SearchResult { comics })
}

#[tauri::command]
pub fn get_comic_detail(app: AppHandle, comic_id: String) -> Result<ComicDetail, String> {
    ensure_authorized(&app, "请先登录后再查看漫画详情")?;

    let config = Config::load(&app)?;
    let download_dir = config.effective_download_dir(&app)?;
    let local_chapters = scan_local_chapters(&download_dir, &comic_id)?;

    let chapters = merge_local_chapter_state(crate::fake_pica::chapters(&comic_id), local_chapters);

    Ok(ComicDetail {
        id: comic_id,
        title: "漫画详情标题".to_string(),
        author: "漫画详情作者".to_string(),
        chapters,
    })
}

fn count_local_chapters(comic_dir: &std::path::Path) -> Result<(u32, u32), String> {
    let mut chapter_count = 0;
    let mut downloaded_chapter_count = 0;

    for entry in std::fs::read_dir(comic_dir).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let metadata_path = path.join("chapter.json");

        if !metadata_path.exists() {
            continue;
        }

        chapter_count += 1;

        let text = std::fs::read_to_string(&metadata_path).map_err(|err| err.to_string())?;
        let metadata: serde_json::Value =
            serde_json::from_str(&text).map_err(|err| err.to_string())?;

        let is_completed =
            metadata.get("state").and_then(serde_json::Value::as_str) == Some("completed");

        if is_completed {
            downloaded_chapter_count += 1;
        }
    }

    Ok((chapter_count, downloaded_chapter_count))
}

fn scan_downloaded_comics(download_dir: &str) -> Result<Vec<ComicInSearch>, String> {
    let root = std::path::PathBuf::from(download_dir);

    if !root.exists() {
        return Ok(Vec::new());
    }

    let mut comics = Vec::new();

    for entry in std::fs::read_dir(root).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let metadata_path = path.join("metadata.json");

        if !metadata_path.exists() {
            continue;
        }

        let text = std::fs::read_to_string(&metadata_path).map_err(|err| err.to_string())?;
        let metadata: serde_json::Value =
            serde_json::from_str(&text).map_err(|err| err.to_string())?;

        let title = metadata
            .get("comicTitle")
            .and_then(serde_json::Value::as_str)
            .unwrap_or_else(|| {
                path.file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("未知漫画")
            })
            .to_string();

        let id = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or(&title)
            .to_string();

        let metadata_chapter_count = metadata
            .get("chapterCount")
            .and_then(serde_json::Value::as_u64)
            .map(|value| value as u32);

        let (local_chapter_count, downloaded_chapter_count) = count_local_chapters(&path)?;

        comics.push(ComicInSearch {
            id,
            title,
            author: "本地库存".to_string(),
            cover_url: None,
            chapter_count: Some(metadata_chapter_count.unwrap_or(local_chapter_count)),
            downloaded_chapter_count: Some(downloaded_chapter_count),
        });
    }

    Ok(comics)
}

fn scan_local_chapters(download_dir: &str, comic_id: &str) -> Result<Vec<Chapter>, String> {
    let comic_dir = std::path::PathBuf::from(download_dir).join(comic_id);

    if !comic_dir.exists() {
        return Ok(Vec::new());
    }

    let mut chapters = Vec::new();

    for entry in std::fs::read_dir(comic_dir).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();

        if !path.is_dir() {
            continue;
        }

        let metadata_path = path.join("chapter.json");

        if !metadata_path.exists() {
            continue;
        }

        let text = std::fs::read_to_string(&metadata_path).map_err(|err| err.to_string())?;
        let metadata: serde_json::Value =
            serde_json::from_str(&text).map_err(|err| err.to_string())?;

        let title = metadata
            .get("chapterTitle")
            .and_then(serde_json::Value::as_str)
            .unwrap_or_else(|| {
                path.file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("未知章节")
            })
            .to_string();

        let state = metadata
            .get("state")
            .and_then(serde_json::Value::as_str)
            .map(ToString::to_string);

        let progress = metadata
            .get("progress")
            .and_then(serde_json::Value::as_u64)
            .map(|value| value as u32);

        let order = metadata
            .get("order")
            .and_then(serde_json::Value::as_u64)
            .map(|value| value as u32)
            .unwrap_or_else(|| chapters.len() as u32 + 1);

        chapters.push(Chapter {
            id: path
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or(&title)
                .to_string(),
            title,
            order,
            state,
            progress,
        });
    }

    chapters.sort_by_key(|chapter| chapter.order);

    Ok(chapters)
}

fn merge_local_chapter_state(
    mut chapters: Vec<Chapter>,
    local_chapters: Vec<Chapter>,
) -> Vec<Chapter> {
    for chapter in &mut chapters {
        if let Some(local_chapter) = local_chapters
            .iter()
            .find(|local_chapter| local_chapter.title == chapter.title)
        {
            chapter.state = local_chapter.state.clone();
            chapter.progress = local_chapter.progress;
        }
    }

    chapters
}
