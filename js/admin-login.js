// js/admin-login.js
import { saveTokens } from "./auth.js";
import { API_BASE } from "./config.js";
import { fetchWithLoader } from "./fetchWithLoader.js";

const LOGIN_URL = `${API_BASE.replace(/\/$/, "")}/login/`;

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");
const submitBtn = document.getElementById("submitBtn");

function showError(msg) {
  errorEl.textContent = msg || "Login failed. Try again.";
}
function clearError() {
  errorEl.textContent = "";
}

async function postLogin(username, password) {
  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg =
      (body && (body.message || body.detail || body.error)) ||
      `Login failed (${res.status})`;
    throw new Error(msg);
  }
  return body || {};
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const username = form.username.value.trim();
  const password = form.password.value;
  const remember = document.getElementById("remember").checked;

  if (!username || !password) {
    showError("Please enter username and password.");
    return;
  }

  submitBtn.disabled = true;
  document.getElementById("globalLoader").classList.remove("hidden");

  try {
    const data = await postLogin(username, password);

    const accessCandidates = ["access", "token", "access_token", "auth_token"];
    const refreshCandidates = ["refresh", "refresh_token"];
    const roleCandidates = ["role", "user_role", "type"];

    let access = null;
    for (const k of accessCandidates)
      if (data[k]) {
        access = data[k];
        break;
      }
    if (!access && data.tokens && data.tokens.access)
      access = data.tokens.access;

    let refresh = null;
    for (const k of refreshCandidates)
      if (data[k]) {
        refresh = data[k];
        break;
      }
    if (!refresh && data.tokens && data.tokens.refresh)
      refresh = data.tokens.refresh;

    let role = null;
    for (const k of roleCandidates)
      if (data[k]) {
        role = data[k];
        break;
      }
    if (!role && data.user && data.user.role) role = data.user.role;
    if (!role && data.user && data.user.is_owner)
      role = data.user.is_owner ? "owner" : "staff";

    if (!access && typeof data === "string") access = data;

    if (!access) {
      const fallbackMsg =
        (data && (data.message || data.detail)) ||
        "Login succeeded but token not returned.";
      showError(fallbackMsg);
      throw new Error("No access token returned");
    }

    saveTokens({ access, refresh, role, persistent: !!remember });

    // verify token quickly by calling owner/dashboard
    try {
      await fetchWithLoader(`${API_BASE.replace(/\/$/, "")}/owner/dashboard/`);
      window.location.href = "./admin.html";
    } catch (verifyErr) {
      console.warn("Token verify failed:", verifyErr);
      window.location.href = "./admin.html";
    }
  } catch (err) {
    console.error("Login error:", err);
    showError(err.message || "Login failed");
  } finally {
    document.getElementById("globalLoader").classList.add("hidden");
    submitBtn.disabled = false;
  }
});
