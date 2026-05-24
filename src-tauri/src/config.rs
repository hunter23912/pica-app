use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Config {
    pub token: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            token: String::new(),
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
}
