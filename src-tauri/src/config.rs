use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Config {
    pub token: String,
    pub download_dir: String,
    pub chapter_concurrency: u32,
    pub image_concurrency: u32,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            token: String::new(),
            download_dir: String::new(),
            chapter_concurrency: 2,
            image_concurrency: 4,
        }
    }
}

impl Config {
    fn path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
        let dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

        fs::create_dir_all(&dir).map_err(|err| err.to_string())?;

        Ok(dir.join("config.json"))
    }

    pub fn load(app: &AppHandle) -> Result<Self, String> {
        let path = Self::path(app)?;

        if !path.exists() {
            return Ok(Self::default());
        }

        let text = fs::read_to_string(path).map_err(|err| err.to_string())?;
        let config = serde_json::from_str(&text).map_err(|err| err.to_string())?;

        Ok(config)
    }

    pub fn save(app: &AppHandle, config: &Self) -> Result<(), String> {
        let path = Self::path(app)?;
        let text = serde_json::to_string_pretty(config).map_err(|err| err.to_string())?;

        fs::write(path, text).map_err(|err| err.to_string())?;

        Ok(())
    }

    pub fn default_download_dir(app: &AppHandle) -> Result<String, String> {
        let dir = app
            .path()
            .app_data_dir()
            .map_err(|err| err.to_string())?
            .join("downloads");

        Ok(dir.to_string_lossy().to_string())
    }

    pub fn effective_download_dir(&self, app: &AppHandle) -> Result<String, String> {
        if self.download_dir.trim().is_empty() {
            return Self::default_download_dir(app);
        }

        Ok(self.download_dir.clone())
    }
}
