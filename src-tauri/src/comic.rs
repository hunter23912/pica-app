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

#[tauri::command]
pub fn search_comic(app: AppHandle, keyword: String) -> Result<SearchResult, String> {
    let config = Config::load(&app)?;

    if config.token.trim().is_empty() {
        return Err("请先登录后再搜索漫画".to_string());
    }

    if keyword.trim().is_empty() {
        return Err("请输入搜索关键词".to_string());
    }

    Ok(SearchResult {
        comics: vec![
            ComicInSearch {
                id: "comic-001".to_string(),
                title: format!("{} 的搜索结果 A", keyword),
                author: "测试作者一".to_string(),
                cover_url: None,
            },
            ComicInSearch {
                id: "comic-002".to_string(),
                title: format!("{} 的搜索结果 B", keyword),
                author: "测试作者二".to_string(),
                cover_url: None,
            },
        ],
    })
}

#[tauri::command]
pub fn get_favorite(app: AppHandle) -> Result<SearchResult, String> {
    let config = Config::load(&app)?;

    if config.token.trim().is_empty() {
        return Err("请先登录后再查看收藏夹".to_string());
    }

    Ok(SearchResult {
        comics: vec![
            ComicInSearch {
                id: "favorite-001".to_string(),
                title: "收藏漫画 A".to_string(),
                author: "收藏作者一".to_string(),
                cover_url: None,
            },
            ComicInSearch {
                id: "favorite-002".to_string(),
                title: "收藏漫画 B".to_string(),
                author: "收藏作者二".to_string(),
                cover_url: None,
            },
        ],
    })
}

#[tauri::command]
pub fn get_rank(app: AppHandle) -> Result<SearchResult, String> {
    let config = Config::load(&app)?;

    if config.token.trim().is_empty() {
        return Err("请先登录后再查看排行榜".to_string());
    }

    Ok(SearchResult {
        comics: vec![
            ComicInSearch {
                id: "rank-001".to_string(),
                title: "排行榜漫画 A".to_string(),
                author: "排行作者一".to_string(),
                cover_url: None,
            },
            ComicInSearch {
                id: "rank-002".to_string(),
                title: "排行榜漫画 B".to_string(),
                author: "排行作者二".to_string(),
                cover_url: None,
            },
        ],
    })
}
