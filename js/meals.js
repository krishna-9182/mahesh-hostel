// js/meals.js
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
  menuBtn = document.getElementById("menuBtn"),
  sidebar = document.getElementById("sidebar");
const canvas = document.getElementById("mealChart"),
  ctx = canvas.getContext("2d"),
  mealList = document.getElementById("mealList");

logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

async function loadMeals() {
  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  const meals = data.meal_stats_last_7_days || [];
  drawMealChart(meals);
  renderMealList(meals);
}

function drawMealChart(meals) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!meals || meals.length === 0) return;
  const maxVal = Math.max(
    ...meals.flatMap((m) => [m.breakfast, m.lunch, m.dinner]),
    1
  );
  const barWidth = 14,
    spacing = 18,
    offsetX = 40,
    baseY = canvas.height - 40;
  meals.forEach((m, i) => {
    const x = offsetX + i * (barWidth * 3 + spacing);
    const bh = (m.breakfast / maxVal) * 140;
    ctx.fillStyle = "#4285f4";
    ctx.fillRect(x, baseY - bh, barWidth, bh);
    const lh = (m.lunch / maxVal) * 140;
    ctx.fillStyle = "#fbbc04";
    ctx.fillRect(x + barWidth, baseY - lh, barWidth, lh);
    const dh = (m.dinner / maxVal) * 140;
    ctx.fillStyle = "#34a853";
    ctx.fillRect(x + barWidth * 2, baseY - dh, barWidth, dh);
    ctx.fillStyle = "#111";
    ctx.font = "10px Arial";
    ctx.fillText(m.date.slice(5), x, baseY + 16);
  });
}

function renderMealList(meals) {
  mealList.innerHTML = "";
  if (!meals.length) mealList.innerHTML = "<li>No meal logs</li>";
  meals.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${m.date}</strong><br>🍳 Breakfast: ${m.breakfast} | 🍛 Lunch: ${m.lunch} | 🍽 Dinner: ${m.dinner}`;
    mealList.appendChild(li);
  });
}

loadMeals();
