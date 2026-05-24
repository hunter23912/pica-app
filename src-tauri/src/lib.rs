mod comic;
mod config;
mod download;
mod user;

use config::Config;
use download::create_download_task;
use tauri::AppHandle;

#[tauri::command]
fn get_config(app: AppHandle) -> Result<Config, String> {
    Config::load(&app)
}

#[tauri::command]
fn save_config(app: AppHandle, config: Config) -> Result<(), String> {
    Config::save(&app, &config)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            user::login,
            user::get_user_profile,
            comic::search_comic,
            create_download_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
