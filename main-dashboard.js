// ==========================================
// MAIN DASHBOARD & LEADERBOARD MODULE (main-dashboard.js)
// ==========================================
import { db } from "./firebase-config.js";
import { 
  collection, doc, setDoc, getDocs, query, where, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let customSpecialFunds = [];

// ടോപ്പ് പെർഫോമർ ലീഡർബോർഡ് ലോഡ് ചെയ്യാൻ
window.loadLeaderboard = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const q = query(collection(db, "performancePoints"), where("institutionId", "==", currentInstitutionId));
  
  try {
    const snap = await getDocs(q);
    const totals = {};
    
    snap.forEach(d => {
      const p = d.data();
      if (!totals[p.regNo]) {
        totals[p.regNo] = { name: p.studentName, class: p.class, points: 0 };
      }
      totals[p.regNo].points += (Number(p.points) || 0);
    });

    const sorted = Object.values(totals).sort((a, b) => b.points - a.points);

    const todayEl = document.getElementById("starTodayName");
    const todayClassEl = document.getElementById("starTodayClass");
    if (sorted.length > 0 && todayEl) {
      todayEl.innerText = sorted[0].name;
      if (todayClassEl) todayClassEl.innerText = `Class ${sorted[0].class} (${sorted[0].points} Pts)`;
    }

    const weekEl = document.getElementById("starWeekName");
    const weekClassEl = document.getElementById("starWeekClass");
    if (sorted.length > 1 && weekEl) {
      weekEl.innerText = sorted[1].name;
      if (weekClassEl) weekClassEl.innerText = `Class ${sorted[1].class} (${sorted[1].points} Pts)`;
    } else if (sorted.length === 1 && weekEl) {
      weekEl.innerText = sorted[0].name;
      if (weekClassEl) weekClassEl.innerText = `Class ${sorted[0].class} (${sorted[0].points} Pts)`;
    }

    const monthEl = document.getElementById("starMonthName");
    const monthClassEl = document.getElementById("starMonthClass");
    if (sorted.length > 0 && monthEl) {
      monthEl.innerText = sorted[0].name;
      if (monthClassEl) monthClassEl.innerText = `Class ${sorted[0].class} (${sorted[0].points} Pts)`;
    }

    // പബ്ലിക് സ്പെഷ്യൽ ഫണ്ട് ബോർഡ് കൂടി ലോഡ് ചെയ്യുക
    loadPublicFundBoard();
  } catch (err) {
    console.error("Leaderboard load error:", err);
  }
};

// പബ്ലിക് സ്പെഷ്യൽ ഫണ്ട് ബോർഡ് ലോഡ് ചെയ്യാൻ (ഹോം പേജിൽ കാണിക്കാൻ)
async function loadPublicFundBoard() {
  const tbody = document.getElementById("publicFundDisplayTableBody");
  if (!tbody) return;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");

  try {
    const q = query(collection(db, "specialFunds"), where("institutionId", "==", currentInstitutionId));
    const snap = await getDocs(q);

    let html = "";
    snap.forEach(d => {
      const f = d.data();
      html += `<tr>
        <td>${f.date || '-'}</td>
        <td><b>${f.donorName || 'Anonymous'}</b></td>
        <td><span class="badge bg-info text-dark">${f.fundCategory || 'GENERAL'}</span></td>
        <td class="fw-bold text-success">₹${f.amount || 0}</td>
      </tr>`;
    });
    tbody.innerHTML = html || `<tr><td colspan="4" class="text-center text-muted">No contributions recorded yet.</td></tr>`;
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No records found.</td></tr>`;
  }
}

// ടാബ് നാവിഗേഷൻ റൂട്ടിംഗ്
window.showTab = (tabId) => {
  document.querySelectorAll(".content-tab").forEach(t => t.classList.add("d-none"));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove("d-none");

  document.querySelectorAll("#desktopTabMenu .nav-link, #mobileTabMenu .nav-link").forEach(b => b.classList.remove("active"));
  
  const activeBtns = document.querySelectorAll(`button[onclick="showTab('${tabId}')"]`);
  activeBtns.forEach(btn => btn.classList.add("active"));

  const offcanvasEl = document.getElementById('sidebarOffcanvas');
  if (offcanvasEl) {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (offcanvasInstance) offcanvasInstance.hide();
  }

  if (tabId === 'studentsListTab' && typeof window.loadStudentsByClass === 'function') window.loadStudentsByClass();
  if (tabId === 'instAdminTab' && typeof window.loadPrincipalsList === 'function') window.loadPrincipalsList();
  if (tabId === 'homeDashboardTab') loadLeaderboard();
  if (tabId === 'superAdminTab' && typeof window.loadSuperAdminRequests === 'function') window.loadSuperAdminRequests();
  if (tabId === 'subjectSettingsTab' && typeof window.loadClassSubjectSettings === 'function') window.loadClassSubjectSettings();
};
