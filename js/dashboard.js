// js/dashboard.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { fetchWithLoader } from "./fetchWithLoader.js";
import { API_BASE } from "./config.js";

/* Protect page */
(function () {
  const token = getAccessToken();
  const role = getRole();
  if (!token || (role !== "owner" && role !== "admin")) {
    window.location.href = "/admin-login.html";
  }
})();

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
document
  .getElementById("menuBtn")
  .addEventListener("click", () =>
    document.getElementById("sidebar").classList.toggle("active")
  );

const attCanvas = document.getElementById("attChart");
const attCtx = attCanvas.getContext("2d");
const feesCanvas = document.getElementById("feesChart");
const feesCtx = feesCanvas.getContext("2d");
const roomCanvas = document.getElementById("roomChart");
const roomCtx = roomCanvas.getContext("2d");

async function loadDashboard() {
  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  if (!data) return;
  drawAttendanceTrend(data.meal_stats_last_7_days || []);
  drawFeesChart(data.students || []);
  drawRoomChart(data.students || []);
}

function drawAttendanceTrend(meals) {
  attCtx.clearRect(0, 0, attCanvas.width, attCanvas.height);
  if (!meals || meals.length === 0) return;
  const values = meals.map((m) => m.lunch || 0),
    dates = meals.map((m) => m.date.slice(5));
  const maxVal = Math.max(...values, 1);
  const barWidth = 18,
    spacing = 26,
    baseY = attCanvas.height - 30,
    scale = (attCanvas.height - 80) / maxVal;
  values.forEach((v, i) => {
    const x = 40 + i * (barWidth + spacing);
    const h = v * scale;
    attCtx.fillStyle = "#1a73e8";
    attCtx.fillRect(x, baseY - h, barWidth, h);
    attCtx.fillStyle = "#111";
    attCtx.font = "11px Arial";
    attCtx.fillText(dates[i], x, baseY + 14);
  });
}

function drawFeesChart(students) {
  feesCtx.clearRect(0, 0, feesCanvas.width, feesCanvas.height);
  if (!students || students.length === 0) return;
  const totalPending = students.reduce((s, x) => s + (x.pending_fee || 0), 0);
  const totalPaid = students.reduce((s, x) => s + (x.fees_paid || 0), 0);
  const total = Math.max(totalPending + totalPaid, 1);
  const pPercent = totalPending / total,
    paidPercent = totalPaid / total;
  const cx = feesCanvas.width / 2,
    cy = feesCanvas.height / 2 - 10,
    r = Math.min(feesCanvas.width, feesCanvas.height) / 4;
  drawDoughnutSlice(feesCtx, cx, cy, r, 0, pPercent * Math.PI * 2, "#df1a1a");
  drawDoughnutSlice(
    feesCtx,
    cx,
    cy,
    r,
    pPercent * Math.PI * 2,
    Math.PI * 2,
    "#28a745"
  );
  feesCtx.beginPath();
  feesCtx.fillStyle = "#fff";
  feesCtx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  feesCtx.fill();
  feesCtx.fillStyle = "#111";
  feesCtx.font = "14px Arial";
  feesCtx.fillText(`Paid ${(paidPercent * 100).toFixed(1)}%`, cx - 50, cy - 6);
  feesCtx.fillText(`Pending ${(pPercent * 100).toFixed(1)}%`, cx - 60, cy + 16);
}
function drawDoughnutSlice(ctx, cx, cy, r, start, end, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, start, end);
  ctx.closePath();
  ctx.fill();
}

function drawRoomChart(students) {
  roomCtx.clearRect(0, 0, roomCanvas.width, roomCanvas.height);
  if (!students || students.length === 0) return;
  const counts = {};
  students.forEach(
    (s) => (counts[s.room_type] = (counts[s.room_type] || 0) + 1)
  );
  const entries = Object.entries(counts);
  const total = students.length;
  const cx = roomCanvas.width / 2,
    cy = roomCanvas.height / 2 - 10,
    r = Math.min(roomCanvas.width, roomCanvas.height) / 4;
  let start = 0;
  const colors = ["#1a73e8", "#34a853", "#fbbc04", "#ea4335", "#9c27b0"];
  entries.forEach(([k, count], i) => {
    const end = start + (count / total) * Math.PI * 2;
    roomCtx.beginPath();
    roomCtx.fillStyle = colors[i % colors.length];
    roomCtx.moveTo(cx, cy);
    roomCtx.arc(cx, cy, r, start, end);
    roomCtx.closePath();
    roomCtx.fill();
    start = end;
  });
}

loadDashboard();
