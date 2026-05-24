use crate::config::Config;
use tauri::AppHandle;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct UserProfile {
    name: String,
}

#[tauri::command]
pub fn get_user_profile(app: AppHandle) -> Result<UserProfile, String> {
    let config = Config::load(&app)?;

    if config.token.trim().is_empty() {
        return Err("请先登录或填写 Authorization token".to_string());
    }

    Ok(UserProfile {
        name: "测试用户".to_string(),
    })
}

#[tauri::command]
pub fn login(email: String, password: String) -> Result<String, String> {
    if email.trim().is_empty() {
        return Err("邮箱不能为空".to_string());
    }

    if password.trim().is_empty() {
        return Err("密码不能为空".to_string());
    }

    let token = format!("fake-token:{}:{}", email, password.len());

    Ok(token)
}
