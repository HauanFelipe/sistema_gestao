const AUTH_KEY = "sg_auth_user";
export const API_BASE_URL = "http://localhost:3000";

type AuthUser = {
  name: string;
  token?: string;
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_KEY) ?? window.sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.name ? parsed : null;
  } catch {
    return null;
  }
};

export const setAuthUser = (name: string, remember: boolean, token?: string) => {
  if (typeof window === "undefined") return;
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(AUTH_KEY, JSON.stringify({ name, token }));
};

export const clearAuthUser = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  window.sessionStorage.removeItem(AUTH_KEY);
};
