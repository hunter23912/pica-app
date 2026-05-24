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
