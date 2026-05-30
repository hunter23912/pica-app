#![allow(dead_code)]
use hmac::{Hmac, KeyInit, Mac};
use reqwest::Method;
use serde_json::{json, Value};
use sha2::Sha256;

use crate::comic::{Chapter, ComicInSearch};

const HOST_URL: &str = "https://picaapi.picacomic.com/";
const API_KEY: &str = "C69BAF41DA5ABD1FFEDC6D2FEA56B";
const NONCE: &str = "ptxdhmjzqtnrtwndhbxcpkjamb33w837";
const DIGEST_KEY: &str = r"~d}$Q7$eIni=V)9\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn";

pub struct PicaClient {
    token: String,
    http: reqwest::Client,
}

impl PicaClient {
    pub fn new(token: String) -> Self {
        Self {
            token,
            http: reqwest::Client::new(),
        }
    }

    pub async fn search_comics(&self, keyword: &str) -> Result<Vec<ComicInSearch>, String> {
        let payload = json!({
            "keyword": keyword,
            "sort": "dd",
            "categories": [],
        });

        let data = self
            .pica_post("comics/advanced-search?page=1", payload)
            .await?;
        let search_data: SearchRespData =
            serde_json::from_value(data).map_err(|err| err.to_string())?;

        Ok(search_data
            .comics
            .docs
            .into_iter()
            .map(|comic| ComicInSearch {
                id: comic.id,
                title: comic.title,
                author: comic.author,
                cover_url: None,
                chapter_count: None,
                downloaded_chapter_count: None,
            })
            .collect())
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

    async fn pica_request(
        &self,
        method: Method,
        path: &str,
        payload: Option<Value>,
    ) -> Result<Value, String> {
        let time = unix_timestamp_seconds()?;
        let signature = create_signature(path, &method, &time)?;
        let url = format!("{HOST_URL}{path}");

        let request = self
            .http
            .request(method, url)
            .header("api-key", API_KEY)
            .header("accept", "application/vnd.picacomic.com.v1+json")
            .header("app-channel", "2")
            .header("time", time)
            .header("nonce", NONCE)
            .header("app-version", "2.2.1.2.3.3")
            .header("app-uuid", "defaultUuid")
            .header("app-platform", "android")
            .header("app-build-version", "44")
            .header("Content-Type", "application/json; charset=UTF-8")
            .header("User-Agent", "okhttp/3.8.1")
            .header("authorization", &self.token)
            .header("image-quality", "original")
            .header("signature", signature);

        let request = if let Some(payload) = payload {
            request.json(&payload)
        } else {
            request
        };

        let response = request.send().await.map_err(|err| err.to_string())?;
        let status = response.status();
        let body = response.text().await.map_err(|err| err.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err(format!("Authorization 无效或已过期: {body}"));
        }

        if !status.is_success() {
            return Err(format!("请求失败 {status}: {body}"));
        }

        let pica_resp: PicaResp = serde_json::from_str(&body)
            .map_err(|err| format!("解析 PicaResp 失败: {err}; body: {body}"))?;

        if pica_resp.code != 200 {
            return Err(format!(
                "Pica API 返回错误 code={}, message={}, error={:?}, detail={:?}",
                pica_resp.code, pica_resp.message, pica_resp.error, pica_resp.detail
            ));
        }

        pica_resp
            .data
            .ok_or_else(|| format!("Pica API 响应缺少 data 字段: {body}"))
    }

    async fn pica_get(&self, path: &str) -> Result<Value, String> {
        self.pica_request(Method::GET, path, None).await
    }

    async fn pica_post(&self, path: &str, payload: Value) -> Result<Value, String> {
        self.pica_request(Method::POST, path, Some(payload)).await
    }
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct PicaResp {
    code: i64,
    message: String,
    data: Option<Value>,
    error: Option<String>,
    detail: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Pagination<T> {
    docs: Vec<T>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct SearchRespData {
    comics: Pagination<PicaComicInSearch>,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct PicaComicInSearch {
    #[serde(rename = "_id")]
    id: String,
    title: String,
    #[serde(default)]
    author: String,
}

fn unix_timestamp_seconds() -> Result<String, String> {
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|err| err.to_string())?
        .as_secs();

    Ok(timestamp.to_string())
}

fn create_signature(path: &str, method: &Method, time: &str) -> Result<String, String> {
    let data = format!("{path}{time}{NONCE}{}{API_KEY}", method.as_str()).to_lowercase();

    hmac_hex(DIGEST_KEY, &data)
}

fn hmac_hex(key: &str, data: &str) -> Result<String, String> {
    let mut mac = Hmac::<Sha256>::new_from_slice(key.as_bytes()).map_err(|err| err.to_string())?;
    mac.update(data.as_bytes());

    Ok(hex::encode(mac.finalize().into_bytes()))
}
