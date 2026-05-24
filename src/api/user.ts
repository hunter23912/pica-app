import { invoke } from "@tauri-apps/api/core";
import { UserProfile } from "../types";

export function getUserProfile() {
  return invoke<UserProfile>("get_user_profile");
}
