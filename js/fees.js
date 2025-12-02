// js/fees.js
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

const logoutBtn = document.getElementById("logoutBtn"),
  menuBtn = document.getElementById("menuBtn"),
  sidebar = document.getElementById("sidebar");
const feesTableBody = document.querySelector("#feesTable tbody"),
  searchInput = document.getElementById("searchInput"),
  roomFilter = document.getElementById("roomFilter"),
  feeFilter = document.getElementById("feeFilter");
let allStudents = [];

logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

async function loadFees() {
  feesTableBody.innerHTML = `<tr><td colspan="5" style="padding:20px;text-align:center;">Loading...</td></tr>`;
  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  allStudents = data.students || [];
  applyFilters();
}

function renderTable(list) {
  feesTableBody.innerHTML = "";
  if (!list.length) {
    feesTableBody.innerHTML = `<tr><td colspan="5" style="padding:20px;text-align:center;">No students found</td></tr>`;
    return;
  }
  list.forEach((s) => {
    let color = "green";
    if ((s.pending_fee || 0) > 20000) color = "red";
    else if ((s.pending_fee || 0) > 0) color = "orange";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><img src="${
      s.student_image || "admin/assets/icons/profile.png"
    }" onerror="this.src='admin/assets/icons/profile.png'"></td><td>${
      s.student_name
    }</td><td>${s.et_number}</td><td>${
      s.room_type || ""
    }</td><td style="font-weight:600;color:${color};">₹${(
      s.pending_fee || 0
    ).toLocaleString()}</td>`;
    feesTableBody.appendChild(tr);
  });
}

function applyFilters() {
  const search = (searchInput.value || "").toLowerCase();
  const room = roomFilter.value;
  const fee = feeFilter.value;
  let filtered = allStudents.filter(
    (s) =>
      (s.student_name || "").toLowerCase().includes(search) ||
      (s.et_number || "").toLowerCase().includes(search)
  );
  if (room !== "all")
    filtered = filtered.filter(
      (s) => (s.room_type || "").toLowerCase() === room.toLowerCase()
    );
  if (fee === "pending")
    filtered = filtered.filter((s) => (s.pending_fee || 0) > 0);
  if (fee === "clear")
    filtered = filtered.filter((s) => (s.pending_fee || 0) === 0);
  renderTable(filtered);
}

searchInput.addEventListener("input", applyFilters);
roomFilter.addEventListener("change", applyFilters);
feeFilter.addEventListener("change", applyFilters);

document
  .getElementById("exportFeesCSV")
  .addEventListener("click", () => exportToCSV(allStudents, "fees.csv"));
document
  .getElementById("exportFeesExcel")
  .addEventListener("click", () => exportToExcel(allStudents, "fees.xlsx"));

loadFees();
