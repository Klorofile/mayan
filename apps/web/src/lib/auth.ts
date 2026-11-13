import type { LoginResponse } from "@mayan/shared";
import type { AuthUser } from "@mayan/shared";

export function persistSession(session: LoginResponse) {
  window.localStorage.setItem("mayan.accessToken", session.accessToken);
  window.localStorage.setItem("mayan.refreshToken", session.refreshToken);
  window.localStorage.setItem("mayan.user", JSON.stringify(session.user));
}

export function clearSession() {
  window.localStorage.removeItem("mayan.accessToken");
  window.localStorage.removeItem("mayan.refreshToken");
  window.localStorage.removeItem("mayan.user");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const rawUser = window.localStorage.getItem("mayan.user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}
