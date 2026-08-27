// ==========================================
// MAIN ENTRY POINT (app.js) - Updated with Principal Staff & Settings Access
// ==========================================
import { db, auth, SUPER_ADMIN_EMAIL } from "./firebase-config.js";
import "./auth.js";
import "./students.js";
import "./fees.js";
import "./academics.js";
import "./main-dashboard.js";

import { 
  doc, getDoc, collection, getDocs, query, where, serverTimestamp, setDoc, updateDoc, deleteDoc 
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

// മൊബൈൽ മെനു സിങ്ക് ചെയ്യാനുള്ള ഫങ്ഷൻ
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

// സെറ്റിങ്സ് ലോഡ് ചെയ്യാൻ
window.loadInstitutionSettings = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!currentInstitutionId) return;

  try {
    const docRef = doc(db, "settings", currentInstitutionId);
    const snap = await getDoc(docRef);
    const inputEl = document.getElementById("settingSpecialFundsInput");
    if (snap.exists() && inputEl) {
      const data = snap.data();
      if (data.specialFeeCategories) {
        inputEl.value = data.specialFeeCategories.join(", ");
        window.customSpecialFunds = data.specialFeeCategories;
      }
    }
  } catch (e) {
    console.error("Error loading settings:", e);
  }
};

// സെറ്റിങ്സ് സേവ് ചെയ്യാൻ
window.saveInstitutionSettings = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const rawInput = document.getElementById("settingSpecialFundsInput")?.value || "";
  const fundsArray = rawInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

  try {
    await setDoc(doc(db, "settings", currentInstitutionId), {
      institutionId: currentInstitutionId,
      specialFeeCategories: fundsArray,
      updatedAt: serverTimestamp()
    }, { merge: true });

    window.customSpecialFunds = fundsArray;
    window.showToast("Settings updated successfully!", "success");
  } catch (e) {
    window.showToast("Error saving settings: " + e.message, "error");
  }
};

// സ്റ്റാഫിന്റെ സ്റ്റാറ്റസ് ആക്ടീവ് ആക്കാൻ
window.approveStaffAccount = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      status: "active"
    });
    window.showToast("Staff account activated successfully!", "success");
    if (typeof window.loadPrincipalsList === 'function') window.loadPrincipalsList();
  } catch (e) {
    window.showToast("Error activating staff: " + e.message, "error");
  }
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
        const superMasterBtn = document.getElementById("superAdminMasterBtn");
        const instAdminStaffBtn = document.getElementById("instAdminStaffBtn");
        const settingsMenuBtn = document.getElementById("settingsMenuBtn");
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

          // അഡ്മിൻ അല്ലെങ്കിൽ പ്രിൻസിപ്പൽ ആണെങ്കിൽ സ്റ്റാഫ് മാനേജ്‌മെന്റും സെറ്റിങ്സും കാണിക്കാൻ
          if (window.currentUserRole === "admin" || window.currentUserRole === "principal") {
            if (instAdminStaffBtn) instAdminStaffBtn.classList.remove("d-none");
            if (settingsMenuBtn) settingsMenuBtn.classList.remove("d-none");
          } else {
            if (instAdminStaffBtn) instAdminStaffBtn.classList.add("d-none");
            if (settingsMenuBtn) settingsMenuBtn.classList.add("d-none");
          }

          if (window.currentUserRole === "admin") {
            if (homeMenuBtn) homeMenuBtn.classList.remove("d-none");
            if (attendanceMenuBtn) attendanceMenuBtn.classList.remove("d-none");
            if (marksMenuBtn) marksMenuBtn.classList.remove("d-none");
            if (performanceMenuBtn) performanceMenuBtn.classList.remove("d-none");
            if (feeSettingsBtn) feeSettingsBtn.classList.remove("d-none");
            if (subjectSettingsBtn) subjectSettingsBtn.classList.remove("d-none");

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

        if (!window.isSuperAdmin) {
          window.populateClassDropdowns();
          window.loadInstitutionSettings();
        }
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

// ==========================================
// MANAGE PRINCIPALS & STAFF MODULE
window.loadPrincipalsList = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!currentInstitutionId) return;

  try {
    const q = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId));
    const snap = await getDocs(q);

    let html = "";
    let pendingHtml = "";
    let hasPending = false;

    snap.forEach(d => {
      const user = d.data();
      if (user.role === "admin" && user.email === "mccodetech@gmail.com") return; 

      const isPending = user.status === "pending";

      const rowHtml = `
        <tr>
          <td><b>${user.name || '-'}</b></td>
          <td><span class="badge bg-secondary">${user.role || 'staff'}</span></td>
          <td>${user.email || '-'}</td>
          <td>${user.phone || '-'}</td>
          <td class="text-center">
            ${isPending 
              ? `<button class="btn btn-sm btn-success px-3" onclick="approveStaffAccount('${d.id}')"><i class="fa-solid fa-check me-1"></i> Approve</button>` 
              : `<span class="badge bg-success">Active</span>`
            }
            <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteStaffAccount('${d.id}', '${user.name}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;

      if (isPending) {
        hasPending = true;
        pendingHtml += rowHtml;
      } else {
        html += rowHtml;
      }
    });

    // പെൻഡിങ് സെക്ഷൻ കാണിക്കാനും മറയ്ക്കാനുമുള്ള കോഡ്
    const pendingSection = document.getElementById("instPendingStaffSection");
    const pendingTableBody = document.getElementById("instPendingStaffTableBody");
    
    if (pendingSection && pendingTableBody) {
      if (hasPending) {
        pendingSection.classList.remove("d-none");
        pendingTableBody.innerHTML = pendingHtml;
      } else {
        pendingSection.classList.add("d-none");
        pendingTableBody.innerHTML = "";
      }
    }

    // മെയിൻ സ്റ്റാഫ് ലിങ്ക് ടേബിൾ
    const tableBody = document.getElementById("staffTableBody") || document.querySelector("table tbody");
    if (tableBody) {
      tableBody.innerHTML = html || `<tr><td colspan="5" class="text-center text-muted">No active staff found.</td></tr>`;
    }
  } catch (e) {
    console.error("Error loading staff list:", e);
    window.showToast("Error loading staff list: " + e.message, "error");
  }
};

// സ്റ്റാഫ് അക്കൗണ്ട് അപ്പ്രൂവ് ചെയ്യാൻ
window.approveStaffAccount = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      status: "active"
    });
    window.showToast("Staff account approved successfully!", "success");
    window.loadPrincipalsList(); // ലിസ്റ്റ് റിഫ്രഷ് ചെയ്യാൻ
  } catch (e) {
    window.showToast("Error approving staff: " + e.message, "error");
  }
};

// സ്റ്റാഫ് അക്കൗണ്ട് ഡിലീറ്റ് ചെയ്യാൻ (ആവശ്യമെങ്കിൽ)
window.deleteStaffAccount = async (userId, name) => {
  if (!confirm(`Are you sure you want to remove ${name}?`)) return;
  try {
    await deleteDoc(doc(db, "users", userId));
    window.showToast("Staff removed successfully!", "success");
    window.loadPrincipalsList();
  } catch (e) {
    window.showToast("Error deleting staff: " + e.message, "error");
  }
};
