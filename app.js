// ==========================================
// MAIN ENTRY POINT (app.js)
// ==========================================
import { db, auth, SUPER_ADMIN_EMAIL } from "./firebase-config.js";
import "./auth.js";
import "./students.js";
import "./fees.js";
import "./academics.js";
import "./main-dashboard.js";

import { 
  doc, getDoc, collection, getDocs, query, where, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.currentInstitutionId = "";
window.currentUserRole = "admin";
window.currentUserAssignedClasses = [];
window.currentUserName = "";
window.isSuperAdmin = false;
window.sysFeePermission = "all";
window.sysReqManualReceipt = false;
window.customSpecialFunds = [];

// ടോസ്റ്റ് നോട്ടിഫിക്കേഷൻ
window.showToast = (message, type = "success") => {
  const container = document.getElementById("appToastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `modern-toast ${type}`;
  let icon = "fa-circle-check";
  if (type === "error") icon = "fa-circle-xmark";
  if (type === "warning") icon = "fa-triangle-exclamation";
  toast.innerHTML = `<i class="fa-solid ${icon} fs-5"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.transition = "all 0.4s ease"; toast.style.opacity = "0"; setTimeout(() => toast.remove(), 400); }, 4000);
};

// മൊബൈൽ മെനു സിങ്ക് ചെയ്യാനുള്ള ഫങ്ഷൻ ഇവിടെ ആഡ് ചെയ്തിരിക്കുന്നു
window.syncMobileMenu = () => {
  const desktopMenu = document.getElementById("desktopTabMenu");
  const mobileMenu = document.getElementById("mobileTabMenu");
  if (desktopMenu && mobileMenu) {
    mobileMenu.innerHTML = desktopMenu.innerHTML;
  }
};

window.populateClassDropdowns = function() {
  const allClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const allowedClasses = (window.currentUserRole === "principal" || window.currentUserRole === "admin" || window.isSuperAdmin) ? allClasses : window.currentUserAssignedClasses;

  const filterSelect = document.getElementById("filterClassSelect");
  if (filterSelect) {
    filterSelect.innerHTML = "";
    if (window.currentUserRole === "principal" || window.currentUserRole === "admin" || window.isSuperAdmin) filterSelect.innerHTML += `<option value="ALL">All Classes</option>`;
    allowedClasses.forEach(c => filterSelect.innerHTML += `<option value="${c}">Class ${c}</option>`);
  }

  ["attClassSelect", "markClassSelect", "perfClassSelect", "feeClassSelect"].forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = `<option value="">-- Select Class --</option>`;
      allowedClasses.forEach(c => select.innerHTML += `<option value="${c}">Class ${c}</option>`);
    }
  });
};

// സെഷൻ പരിശോധന (Auth State Listener & Role Based Menu Visibility)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        window.isSuperAdmin = (user.email === SUPER_ADMIN_EMAIL);
        
        if (!window.isSuperAdmin && userData.status === "pending") {
          window.showToast("Registration pending approval.", "warning");
          signOut(auth);
          return;
        }

        window.currentInstitutionId = userData.institutionId;
        window.currentUserRole = userData.role || (window.isSuperAdmin ? "superadmin" : "teacher");
        window.currentUserAssignedClasses = userData.assignedClasses || [];
        window.currentUserName = userData.name || "Staff";

        const instNameEl = document.getElementById("displayMadrassaName");
        if (instNameEl) instNameEl.innerText = window.isSuperAdmin ? "Smart Madrasa - Master Control Center" : (userData.institutionName || "Smart Madrasa");

        const userRoleEl = document.getElementById("displayUserRole");
        const pMenuBtn = document.getElementById("promotionMenuBtn");
        const adminActions = document.getElementById("adminStudentActions");
        const actionCol = document.getElementById("actionHeaderCol");
        const superMasterBtn = document.getElementById("superAdminMasterBtn");
        const instAdminStaffBtn = document.getElementById("instAdminStaffBtn");
        const homeMenuBtn = document.getElementById("homeMenuBtn");
        const studentsMenuBtn = document.getElementById("studentsMenuBtn");
        const attendanceMenuBtn = document.getElementById("attendanceMenuBtn");
        const marksMenuBtn = document.getElementById("marksMenuBtn");
        const performanceMenuBtn = document.getElementById("performanceMenuBtn");
        const feesMenuBtn = document.getElementById("feesMenuBtn");
        const feeSettingsBtn = document.getElementById("feeSettingsBtn");
        const subjectSettingsBtn = document.getElementById("subjectSettingsBtn");

        if (!window.isSuperAdmin) {
          const instDoc = await getDoc(doc(db, "settings", window.currentInstitutionId));
          if (instDoc.exists()) {
            window.sysFeePermission = instDoc.data().feePermission || "all";
            window.sysReqManualReceipt = instDoc.data().reqManualReceipt || false;
            window.customSpecialFunds = instDoc.data().specialFeeCategories || [];
          }
        }

        if (window.isSuperAdmin) {
          if (superMasterBtn) superMasterBtn.classList.remove("d-none");
          if (userRoleEl) userRoleEl.innerText = "Super Admin";
          window.showTab('superAdminTab');
          if (typeof window.loadSuperAdminRequests === 'function') window.loadSuperAdminRequests();
        } else {
          if (superMasterBtn) superMasterBtn.classList.add("d-none");
          if (userRoleEl) userRoleEl.innerText = window.currentUserRole === "admin" ? "Admin" : (window.currentUserRole === "principal" ? "Principal" : "Teacher");
          
          if (studentsMenuBtn) studentsMenuBtn.classList.remove("d-none");
          if (feesMenuBtn) feesMenuBtn.classList.remove("d-none");

          if (window.currentUserRole === "admin") {
            if (instAdminStaffBtn) instAdminStaffBtn.classList.remove("d-none");
            if (homeMenuBtn) homeMenuBtn.classList.remove("d-none");
            if (attendanceMenuBtn) attendanceMenuBtn.classList.remove("d-none");
            if (marksMenuBtn) marksMenuBtn.classList.remove("d-none");
            if (performanceMenuBtn) performanceMenuBtn.classList.remove("d-none");
            if (feeSettingsBtn) feeSettingsBtn.classList.remove("d-none");
            if (subjectSettingsBtn) subjectSettingsBtn.classList.remove("d-none");
            if (adminActions) adminActions.classList.remove("d-none");
            if (actionCol) actionCol.classList.remove("d-none");

            window.showTab('instAdminTab'); 
            if (typeof window.loadPrincipalsList === 'function') window.loadPrincipalsList();
          } else {
            if (homeMenuBtn) homeMenuBtn.classList.remove("d-none");
            if (attendanceMenuBtn) attendanceMenuBtn.classList.remove("d-none");
            if (marksMenuBtn) marksMenuBtn.classList.remove("d-none");
            if (performanceMenuBtn) performanceMenuBtn.classList.remove("d-none");
            window.showTab('homeDashboardTab');
            if (typeof window.loadLeaderboard === 'function') window.loadLeaderboard();
          }
        }

        document.getElementById("authSection").classList.add("d-none");
        document.getElementById("appSection").classList.remove("d-none");
        
        const attDateEl = document.getElementById("attDate");
        if (attDateEl) attDateEl.valueAsDate = new Date();

        if (!window.isSuperAdmin) window.populateClassDropdowns();
        window.syncMobileMenu();
      }
    } catch (e) {
      console.error("Auth initialization error:", e);
    }
  } else {
    if (!sessionStorage.getItem("parentLoggedIn")) {
      document.getElementById("authSection").classList.remove("d-none");
      document.getElementById("appSection").classList.add("d-none");
    }
  }
});
