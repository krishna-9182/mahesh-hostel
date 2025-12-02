// js/fetchWithLoader.js
import { getAccessToken, clearAuth } from "./auth.js";
import { showLoader, hideLoader } from "./loader.js";

/**
 * fetchWithLoader(url, options)
 * - Adds Authorization: Bearer <token>
 * - Shows global loader
 * - Returns parsed JSON or throws {status,body}
 */
export async function fetchWithLoader(url, options = {}) {
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  showLoader();

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      clearAuth();
      throw { status: 401, body: null };
    }

    const text = await res.text();
    try {
      return JSON.parse(text || "{}");
    } catch {
      return text;
    }
  } finally {
    setTimeout(hideLoader, 140);
  }
}
