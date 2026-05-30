#![allow(dead_code)]

use crate::comic::{Chapter, ComicInSearch};

pub struct PicaClient {
    token: String,
}

impl PicaClient {
    pub fn new(token: String) -> Self {
        Self { token }
    }

    pub fn search_comics(&self, keyword: &str) -> Result<Vec<ComicInSearch>, String> {
        let _ = &self.token;
        let _ = keyword;

        Err("真实搜索 API 尚未接入".to_string())
    }

    pub fn get_favorite(&self) -> Result<Vec<ComicInSearch>, String> {
        let _ = &self.token;

        Err("真实收藏夹 API 尚未接入".to_string())
    }

    pub fn get_rank(&self) -> Result<Vec<ComicInSearch>, String> {
        let _ = &self.token;

        Err("真实排行榜 API 尚未接入".to_string())
    }

    pub fn get_chapters(&self, comic_id: &str) -> Result<Vec<Chapter>, String> {
        let _ = &self.token;
        let _ = comic_id;

        Err("真实章节 API 尚未接入".to_string())
    }
}
