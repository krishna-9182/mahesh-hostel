// js/students.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { fetchWithLoader } from "./fetchWithLoader.js";
import { API_BASE } from "./config.js";
import { exportToCSV, exportToExcel } from "./export.js";

/* Protect */
(function () {
  const token = getAccessToken();
  const role = getRole();
  if (!token || (role !== "owner" && role !== "admin")) {
    window.location.href = "/admin-login.html";
  }
})();

const logoutBtn = document.getElementById("logoutBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const studentsTableBody = document.querySelector("#studentsTable tbody");
const searchInput = document.getElementById("searchInput");
const roomFilter = document.getElementById("roomFilter");

let allStudents = [];

logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

async function loadStudents() {
  studentsTableBody.innerHTML = `<tr><td colspan="6" style="padding:20px;text-align:center;">Loading...</td></tr>`;
  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  allStudents = data.students || [];
  renderStudents(allStudents);
}

function renderStudents(list) {
  studentsTableBody.innerHTML = "";
  if (!list || list.length === 0) {
    studentsTableBody.innerHTML = `<tr><td colspan="6" style="padding:20px;text-align:center;">No students found</td></tr>`;
    return;
  }
  list.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${
        s.student_image || "admin/assets/icons/profile.png"
      }" onerror="this.src='admin/assets/icons/profile.png'"></td>
      <td><a href="/student-profile.html?id=${s.id}">${s.student_name}</a></td>
      <td>${s.et_number}</td>
      <td>${s.student_phone_number || ""}</td>
      <td>${s.room_type || ""}</td>
      <td style="color:${
        (s.pending_fee || 0) > 0 ? "red" : "green"
      };font-weight:600;">₹${(s.pending_fee || 0).toLocaleString()}</td>
    `;
    studentsTableBody.appendChild(tr);
  });
}

function applyFilters() {
  const search = (searchInput.value || "").toLowerCase();
  const room = roomFilter.value;
  let filtered = allStudents.filter(
    (s) =>
      (s.student_name || "").toLowerCase().includes(search) ||
      (s.et_number || "").toLowerCase().includes(search)
  );
  if (room !== "all")
    filtered = filtered.filter(
      (s) => (s.room_type || "").toLowerCase() === room.toLowerCase()
    );
  renderStudents(filtered);
}

searchInput.addEventListener("input", applyFilters);
roomFilter.addEventListener("change", applyFilters);

document
  .getElementById("exportStudentsCSV")
  .addEventListener("click", () => exportToCSV(allStudents, "students.csv"));
document
  .getElementById("exportStudentsExcel")
  .addEventListener("click", () => exportToExcel(allStudents, "students.xlsx"));

loadStudents();
