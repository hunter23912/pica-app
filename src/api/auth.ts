import { invoke } from "@tauri-apps/api/core";

export function login(email: string, password: string) {
  return invoke<string>("login", {
    email,
    password,
  });
}
