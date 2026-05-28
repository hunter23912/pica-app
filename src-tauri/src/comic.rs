use crate::config::Config;
use tauri::AppHandle;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ComicInSearch {
    pub id: String,
    pub title: String,
    pub author: String,
    pub cover_url: Option<String>,
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

fn fake_search_comics(keyword: &str) -> Vec<ComicInSearch> {
    vec![
        ComicInSearch {
            id: "comic-001".to_string(),
            title: format!("{keyword} 的搜索结果 A"),
            author: "测试作者一".to_string(),
            cover_url: None,
        },
        ComicInSearch {
            id: "comic-002".to_string(),
            title: format!("{keyword} 的搜索结果 B"),
            author: "测试作者二".to_string(),
            cover_url: None,
        },
    ]
}

fn fake_comics(id_prefix: &str, title_prefix: &str, author_prefix: &str) -> Vec<ComicInSearch> {
    vec![
        ComicInSearch {
            id: format!("{id_prefix}-001"),
            title: format!("{title_prefix} A"),
            author: format!("{author_prefix}一"),
            cover_url: None,
        },
        ComicInSearch {
            id: format!("{id_prefix}-002"),
            title: format!("{title_prefix} B"),
            author: format!("{author_prefix}二"),
            cover_url: None,
        },
    ]
}

fn fake_chapters(comic_id: &str) -> Vec<Chapter> {
    vec![
        Chapter {
            id: format!("{comic_id}-chapter-1"),
            title: "第 1 章".to_string(),
            order: 1,
        },
        Chapter {
            id: format!("{comic_id}-chapter-2"),
            title: "第 2 章".to_string(),
            order: 2,
        },
        Chapter {
            id: format!("{comic_id}-chapter-3"),
            title: "第 3 章".to_string(),
            order: 3,
        },
    ]
}

#[tauri::command]
pub fn search_comic(app: AppHandle, keyword: String) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再搜索漫画")?;

    if keyword.trim().is_empty() {
        return Err("请输入搜索关键词".to_string());
    }

    Ok(SearchResult {
        comics: fake_search_comics(keyword.trim()),
    })
}

#[tauri::command]
pub fn get_favorite(app: AppHandle) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再查看收藏夹")?;

    Ok(SearchResult {
        comics: fake_comics("favorite", "收藏漫画", "收藏作者"),
    })
}

#[tauri::command]
pub fn get_rank(app: AppHandle) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再查看排行榜")?;

    Ok(SearchResult {
        comics: fake_comics("rank", "排行榜漫画", "排行作者"),
    })
}

#[tauri::command]
pub fn get_downloaded_comics(app: AppHandle) -> Result<SearchResult, String> {
    ensure_authorized(&app, "请先登录后再查看本地库存")?;

    Ok(SearchResult {
        comics: fake_comics("library", "本地漫画", "本地作者"),
    })
}

#[tauri::command]
pub fn get_comic_detail(app: AppHandle, comic_id: String) -> Result<ComicDetail, String> {
    ensure_authorized(&app, "请先登录后再查看漫画详情")?;
    let chapters = fake_chapters(&comic_id);

    Ok(ComicDetail {
        id: comic_id,
        title: "漫画详情标题".to_string(),
        author: "漫画详情作者".to_string(),
        chapters,
    })
}
