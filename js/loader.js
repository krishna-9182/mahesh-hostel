// js/loader.js
export function showLoader() {
  const l = document.getElementById("globalLoader");
  if (l) l.classList.remove("hidden");
}
export function hideLoader() {
  const l = document.getElementById("globalLoader");
  if (l) l.classList.add("hidden");
}
