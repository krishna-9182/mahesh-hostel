// js/staff.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { API_BASE } from "./config.js";
import { fetchWithLoader } from "./fetchWithLoader.js";
import { exportToCSV, exportToExcel } from "./export.js";

// Redirect if not authorized
(function () {
  const token = getAccessToken();
  const role = getRole();
  if (!token || (role !== "owner" && role !== "admin"))
    window.location.href = "/admin-login.html";
})();

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const staffTableBody = document.querySelector("#staffTable tbody");
const form = document.getElementById("addStaffForm");

// Modals
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editStaffForm");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");
let staffToDeleteId = null;

// Event Listeners
logoutBtn.addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});

menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));

// Load staff list
async function loadStaff() {
  staffTableBody.innerHTML = `<tr><td colspan="11" style="padding:20px;text-align:center;">Loading...</td></tr>`;

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
     
      <td>
        <button class="edit-btn" data-id="${s.id}">Edit</button>
        <button class="delete-btn" data-id="${s.id}">Delete</button>
      </td>
    `;
    staffTableBody.appendChild(tr);
  });

  // Add click events for dynamically created edit/delete buttons
  document.querySelectorAll(".edit-btn").forEach((btn) =>
  btn.addEventListener("click", async () => {
    const id = btn.dataset.id;
    const staffData = staff.find((st) => st.id == id);
    if (!staffData) return;

    // Populate all modal fields
    editForm.edit_id.value = staffData.id;

    editForm.edit_name.value = staffData.name || "";
    editForm.edit_phone.value = staffData.phone || "";
    editForm.edit_address.value = staffData.address || "";
    editForm.edit_account.value = staffData.account_no || "";
    editForm.edit_ifsc.value = staffData.ifsc || "";
    editForm.edit_bank.value = staffData.bank_name || "";
    editForm.edit_salary.value = staffData.salary || "";
    editForm.edit_role.value = staffData.role || "warden";

    editModal.classList.remove("hidden");
  })
);


  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      staffToDeleteId = btn.dataset.id;
      deleteModal.classList.remove("hidden");
    })
  );
}

// Add new staff
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
  form.reset();
  loadStaff();
});

// Edit staff
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editForm.edit_id.value;

  const payload = {

    name: editForm.edit_name.value.trim(),
    phone_number: editForm.edit_phone.value.trim(),
    address: editForm.edit_address.value.trim(),
    bank_account_number: editForm.edit_account.value.trim(),
    ifsc_code: editForm.edit_ifsc.value.trim(),
    bank_name: editForm.edit_bank.value.trim(),
    salary: Number(editForm.edit_salary.value),
    role: editForm.edit_role.value,
  };

  const res = await fetchWithLoader(`${API_BASE}/staff/edit/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });


  editModal.classList.add("hidden");
  loadStaff();
});


document.getElementById("closeEdit").addEventListener("click", () => {
  editModal.classList.add("hidden");
});

// Delete staff
confirmDeleteBtn.addEventListener("click", async () => {
  if (!staffToDeleteId) return;
  const res = await fetchWithLoader(`${API_BASE}/staff/delete/${staffToDeleteId}/`, {
    method: "DELETE",
  });

  staffToDeleteId = null;
  deleteModal.classList.add("hidden");
  loadStaff();
});

cancelDeleteBtn.addEventListener("click", () => {
  staffToDeleteId = null;
  deleteModal.classList.add("hidden");
});

// Export buttons
document.getElementById("exportStaffCSV").addEventListener("click", async () => {
  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  exportToCSV(data.staff || [], "staff.csv");
});

document.getElementById("exportStaffExcel").addEventListener("click", async () => {
  const data = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  exportToExcel(data.staff || [], "staff.xlsx");
});

// Initial load
loadStaff();
