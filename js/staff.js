// js/staff.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { API_BASE } from "./config.js";
import { fetchWithLoader } from "./fetchWithLoader.js";
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
const staffTableBody = document.querySelector("#staffTable tbody");
const form = document.getElementById("addStaffForm");

logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

async function loadStaff() {
  staffTableBody.innerHTML = `<tr><td colspan="9" style="padding:20px;text-align:center;">Loading...</td></tr>`;

  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  const staff = data.staff || [];

  staffTableBody.innerHTML = "";

  staff.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.role || "-"}</td>
      <td>${s.phone || ""}</td>
      <td>${s.address || ""}</td>
      <td>${s.bank_name || ""}</td>
      <td>${s.ifsc || ""}</td>
      <td>${s.account_no || ""}</td>
      <td>₹${s.salary || 0}</td>
      <td>${s.date_of_joining || ""}</td>
    `;
    staffTableBody.appendChild(tr);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    username: form.username.value.trim(),
    password: form.password.value,
    name: form.name.value.trim(),
    address: form.address.value.trim(),
    phone_number: form.phone_number.value.trim(),
    bank_account_number: form.bank_account_number.value.trim(),
    ifsc_code: form.ifsc_code.value.trim(),
    bank_name: form.bank_name.value.trim(),
    salary: Number(form.salary.value),
    date_of_joining: form.date_of_joining.value,
    role: form.role.value,
  };
  const res = await fetchWithLoader(`${API_BASE}/owner/add-staff/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  alert(res.message || "Staff added");
  loadStaff();
});

document
  .getElementById("exportStaffCSV")
  .addEventListener("click", async () => {
    const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
    exportToCSV(data.staff || [], "staff.csv");
  });
document
  .getElementById("exportStaffExcel")
  .addEventListener("click", async () => {
    const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
    exportToExcel(data.staff || [], "staff.xlsx");
  });

loadStaff();
