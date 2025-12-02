// js/attendance.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { fetchWithLoader } from "./fetchWithLoader.js";
import { API_BASE } from "./config.js";
import { exportToCSV, exportToExcel } from "./export.js";

(function () {
  const token = getAccessToken();
  const role = getRole();
  if (!token || (role !== "owner" && role !== "admin"))
    window.location.href = "/admin-login.html";
})();

const logoutBtn = document.getElementById("logoutBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const presentCountEl = document.getElementById("presentCount");
const absentCountEl = document.getElementById("absentCount");
const presentList = document.getElementById("presentList");
const absentList = document.getElementById("absentList");

logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

async function loadAttendance() {
  presentList.innerHTML = "<li>Loading...</li>";
  absentList.innerHTML = "<li>Loading...</li>";
  const data = await fetchWithLoader(`${API_BASE}/attendance/today/`);
  presentCountEl.textContent = data.present_count || 0;
  absentCountEl.textContent = data.absent_count || 0;

  presentList.innerHTML = "";
  (data.present_students || []).forEach((s) => {
    const li = document.createElement("li");
    li.className = "student-item present-item";
    li.innerHTML = `<div><strong>${
      s.student_name || s.et_number
    }</strong><div style="font-size:0.85rem;">${s.et_number || ""}</div></div>`;
    presentList.appendChild(li);
  });

  absentList.innerHTML = "";
  (data.absent_students || []).forEach((s) => {
    const li = document.createElement("li");
    li.className = "student-item absent-item";
    li.innerHTML = `<img src="${
      s.student_image || "admin/assets/icons/profile.png"
    }" onerror="this.src='admin/assets/icons/profile.png'"><div><strong>${
      s.student_name
    }</strong><div>${s.et_number}</div><div style="font-size:0.85rem;">📞 ${
      s.mobile_number || ""
    }</div></div><div style="margin-left:auto;"><button data-et="${
      s.et_number
    }" class="save-btn mark-present-small">Mark Present</button></div>`;
    absentList.appendChild(li);
  });

  document.querySelectorAll(".mark-present-small").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const et = e.currentTarget.dataset.et;
      if (!confirm(`Mark ${et} as present?`)) return;
      const res = await fetchWithLoader(
        `${API_BASE}/attendance/mark-present/`,
        { method: "POST", body: JSON.stringify({ et_number: et }) }
      );
      alert(res.message || "Marked present");
      loadAttendance();
    });
  });

  document.getElementById("exportAttendanceCSV").onclick = () => {
    const rows = (data.present_students || [])
      .map((s) => ({
        status: "present",
        name: s.student_name,
        et: s.et_number,
      }))
      .concat(
        (data.absent_students || []).map((s) => ({
          status: "absent",
          name: s.student_name,
          et: s.et_number,
        }))
      );
    exportToCSV(rows, "attendance_today.csv");
  };
  document.getElementById("exportAttendanceExcel").onclick = () => {
    const rows = (data.present_students || [])
      .map((s) => ({
        status: "present",
        name: s.student_name,
        et: s.et_number,
      }))
      .concat(
        (data.absent_students || []).map((s) => ({
          status: "absent",
          name: s.student_name,
          et: s.et_number,
        }))
      );
    exportToExcel(rows, "attendance_today.xlsx");
  };
}

loadAttendance();
