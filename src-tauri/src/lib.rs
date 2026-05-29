mod comic;
mod config;
mod download;
mod user;

use config::Config;
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
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            user::login,
            user::get_user_profile,
            comic::search_comic,
            comic::get_favorite,
            comic::get_rank,
            comic::get_downloaded_comics,
            comic::get_comic_detail,
            download::create_download_task,
            download::open_download_dir,
            download::get_default_download_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
