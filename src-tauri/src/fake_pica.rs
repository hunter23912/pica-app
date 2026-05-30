use crate::comic::{Chapter, ComicInSearch};

pub fn search_comics(keyword: &str) -> Vec<ComicInSearch> {
    vec![
        ComicInSearch {
            id: "comic-001".to_string(),
            title: format!("{keyword} 的搜索结果 A"),
            author: "测试作者一".to_string(),
            cover_url: None,
            chapter_count: None,
            downloaded_chapter_count: None,
        },
        ComicInSearch {
            id: "comic-002".to_string(),
            title: format!("{keyword} 的搜索结果 B"),
            author: "测试作者二".to_string(),
            cover_url: None,
            chapter_count: None,
            downloaded_chapter_count: None,
        },
    ]
}

pub fn comics(id_prefix: &str, title_prefix: &str, author_prefix: &str) -> Vec<ComicInSearch> {
    vec![
        ComicInSearch {
            id: format!("{id_prefix}-001"),
            title: format!("{title_prefix} A"),
            author: format!("{author_prefix}一"),
            cover_url: None,
            chapter_count: None,
            downloaded_chapter_count: None,
        },
        ComicInSearch {
            id: format!("{id_prefix}-002"),
            title: format!("{title_prefix} B"),
            author: format!("{author_prefix}二"),
            cover_url: None,
            chapter_count: None,
            downloaded_chapter_count: None,
        },
    ]
}

pub fn chapters(comic_id: &str) -> Vec<Chapter> {
    vec![
        Chapter {
            id: format!("{comic_id}-chapter-1"),
            title: "第 1 章".to_string(),
            order: 1,
            state: None,
            progress: None,
        },
        Chapter {
            id: format!("{comic_id}-chapter-2"),
            title: "第 2 章".to_string(),
            order: 2,
            state: None,
            progress: None,
        },
        Chapter {
            id: format!("{comic_id}-chapter-3"),
            title: "第 3 章".to_string(),
            order: 3,
            state: None,
            progress: None,
        },
    ]
}
