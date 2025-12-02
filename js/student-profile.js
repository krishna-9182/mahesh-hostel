// js/student-profile.js
import { getAccessToken, getRole, clearAuth } from "./auth.js";
import { API_BASE } from "./config.js";
import { fetchWithLoader } from "./fetchWithLoader.js";

(function () {
  const token = getAccessToken();
  const role = getRole();
  if (!token || (role !== "owner" && role !== "admin")) {
    window.location.href = "/admin-login.html";
  }
})();

const params = new URLSearchParams(window.location.search);
const studentId = Number(params.get("id") || 0);

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearAuth();
  window.location.href = "/admin-login.html";
});
document
  .getElementById("menuBtn")
  .addEventListener("click", () =>
    document.getElementById("sidebar").classList.toggle("active")
  );

const studentImg = document.getElementById("studentImg");
const studentName = document.getElementById("studentName");
const etNumber = document.getElementById("etNumber");
const studentPhone = document.getElementById("studentPhone");
const fatherName = document.getElementById("fatherName");
const fatherPhone = document.getElementById("fatherPhone");
const roomType = document.getElementById("roomType");
const feesPaid = document.getElementById("feesPaid");
const pendingFee = document.getElementById("pendingFee");
const utrNumber = document.getElementById("utrNumber");
const attStatus = document.getElementById("attStatus");
const mealList = document.getElementById("mealList");
const markPresentBtn = document.getElementById("markPresentBtn");

async function loadProfile() {
  const dashboard = await fetchWithLoader(`${API_BASE}/owner/dashboard/`);
  const students = dashboard.students || [];
  const student = students.find((s) => Number(s.id) === studentId);
  if (!student) {
    studentName.textContent = "Student Not Found";
    return;
  }

  studentImg.src = student.student_image || "admin/assets/icons/profile.png";
  studentImg.onerror = () =>
    (studentImg.src = "admin/assets/icons/profile.png");
  studentName.textContent = student.student_name;
  etNumber.textContent = `ET Number: ${student.et_number}`;
  studentPhone.textContent = `📞 ${student.student_phone_number || ""}`;

  fatherName.textContent = student.father_name || "";
  fatherPhone.textContent = student.father_phone_number || "";
  roomType.textContent = student.room_type || "";

  feesPaid.textContent = (student.fees_paid || 0).toLocaleString();
  pendingFee.textContent = (student.pending_fee || 0).toLocaleString();
  utrNumber.textContent = student.utr_number || "";

  const attendance = await fetchWithLoader(`${API_BASE}/attendance/today/`);
  const isPresent = (attendance.present_students || []).some(
    (p) =>
      (p.et_number || "").toLowerCase() ===
      (student.et_number || "").toLowerCase()
  );
  attStatus.textContent = isPresent ? "Present Today" : "Absent Today";
  attStatus.style.color = isPresent ? "green" : "red";

  mealList.innerHTML = "";
  (dashboard.meal_stats_last_7_days || []).forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${m.date}</strong><br>🍳 Breakfast: ${m.breakfast} | 🍛 Lunch: ${m.lunch} | 🍽 Dinner: ${m.dinner}`;
    mealList.appendChild(li);
  });
}

markPresentBtn.addEventListener("click", async () => {
  const et = etNumber.textContent.replace("ET Number:", "").trim();
  if (!et) {
    alert("ET number missing");
    return;
  }
  const res = await fetchWithLoader(`${API_BASE}/attendance/mark-present/`, {
    method: "POST",
    body: JSON.stringify({ et_number: et }),
  });
  alert(res.message || "Marked present");
  loadProfile();
});

loadProfile();
