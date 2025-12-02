// js/settings.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { fetchWithLoader } from "./fetchWithLoader.js";
import { API_BASE } from "./config.js";

(function () {
  const token = getAccessToken();
  const role = getRole();
  if (!token || (role !== "owner" && role !== "admin"))
    window.location.href = "/admin-login.html";
})();

const logoutBtn = document.getElementById("logoutBtn"),
  menuBtn = document.getElementById("menuBtn");
logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
menuBtn.addEventListener("click", () =>
  document.getElementById("sidebar").classList.toggle("active")
);

const usernameEl = document.getElementById("username"),
  updateName = document.getElementById("updateName"),
  updatePhone = document.getElementById("updatePhone"),
  updatePhoto = document.getElementById("updatePhoto"),
  photoPreview = document.getElementById("photoPreview");

usernameEl.textContent = getRole() === "owner" ? "owner" : "admin";
updateName.value = "";
updatePhone.value = "";

updatePhoto.addEventListener("change", () => {
  const f = updatePhoto.files[0];
  if (f) {
    photoPreview.src = URL.createObjectURL(f);
    photoPreview.style.display = "block";
  }
});

document.getElementById("saveProfileBtn").addEventListener("click", () => {
  alert(
    "Profile saved (UI only). Integrate backend endpoint to persist changes."
  );
});

document.getElementById("changePasswordBtn").addEventListener("click", () => {
  const oldPass = document.getElementById("oldPassword").value;
  const newPass = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;
  if (!oldPass || !newPass || !confirm) {
    alert("All fields required");
    return;
  }
  if (newPass !== confirm) {
    alert("Passwords do not match");
    return;
  }
  alert("Password change requested (backend endpoint required).");
});
