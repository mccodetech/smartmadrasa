// ==========================================
// MAIN ENTRY POINT (app.js) - Complete Clean Code
// ==========================================
import { db, auth, SUPER_ADMIN_EMAIL } from "./firebase-config.js";
import "./auth.js";
import "./students.js";
import "./fees.js";
import "./academics.js";
import "./main-dashboard.js";
import "./committee.js";
import "./ledger.js";

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

// Toast Notification
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

// Sync Mobile Menu
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

// Load Institution Settings & Photo from Firestore
window.loadInstitutionSettings = async () => {
  let currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!currentInstitutionId) {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        currentInstitutionId = userDoc.data().institutionId;
        window.currentInstitutionId = currentInstitutionId;
      }
    }
  }
  if (!currentInstitutionId) return;

  try {
    const docRef = doc(db, "settings", currentInstitutionId);
    const snap = await getDoc(docRef);
    const inputEl = document.getElementById("settingSpecialFundsInput");
    const workingDaysEl = document.getElementById("settingTotalWorkingDays");

    if (snap.exists()) {
      const data = snap.data();
      
      if (data.specialFeeCategories && inputEl) {
        inputEl.value = data.specialFeeCategories.join(", ");
        window.customSpecialFunds = data.specialFeeCategories;
      }
      if (data.totalWorkingDays !== undefined && workingDaysEl) {
        workingDaysEl.value = data.totalWorkingDays;
      }
      
      // Caption field
      if (data.photo1 && document.getElementById('instCaption1')) {
        document.getElementById('instCaption1').value = data.photo1.caption || '';
      }
      
      // Photo Preview & Home Photo Load
      if (data.photo1 && data.photo1.url) {
        const previewArea = document.getElementById('instPhotoPreviewArea');
        const previewImg = document.getElementById('instPhotoPreviewImg');
        if (previewImg) previewImg.src = data.photo1.url;
        if (previewArea) previewArea.classList.remove('d-none');
        
        localStorage.setItem('cachedGalleryPhotos_' + currentInstitutionId, JSON.stringify([data.photo1]));
        if (typeof window.loadHomeInstitutionPhotos === 'function') {
          window.loadHomeInstitutionPhotos([data.photo1]);
        }
      }
    }
  } catch (e) {
    console.error("Error loading settings:", e);
  }
};

// ==========================================
// SINGLE PHOTO SAVE & LOAD SYSTEM
// ==========================================

window.saveSinglePhotoSetting = async function() {
    const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
    if (!currentInstitutionId) {
        window.showToast("Institution ID not found.", "error");
        return;
    }

    try {
        const fileInput = document.getElementById('instPhoto1File');
        const captionInput = document.getElementById('instCaption1');

        const file1 = (fileInput && fileInput.files && fileInput.files.length > 0) ? fileInput.files[0] : null;
        const caption1 = captionInput ? captionInput.value.trim() : '';

        const compressImage = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxWidth = 800;
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                    img.onerror = (error) => reject(error);
                };
                reader.onerror = (error) => reject(error);
            });
        };

        let photo1Data = null;

        if (file1) {
            let compressedUrl = await compressImage(file1);
            photo1Data = { url: compressedUrl, caption: caption1 };
        } else {
            const docRef = doc(db, "settings", currentInstitutionId);
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().photo1) {
                photo1Data = { url: snap.data().photo1.url, caption: caption1 };
            }
        }

        if (!photo1Data) {
            window.showToast("Please choose a photo to upload.", "warning");
            return;
        }

        await setDoc(doc(db, "settings", currentInstitutionId), {
            photo1: photo1Data,
            updatedAt: serverTimestamp()
        }, { merge: true });

        localStorage.setItem('cachedGalleryPhotos_' + currentInstitutionId, JSON.stringify([photo1Data]));

        const previewArea = document.getElementById('instPhotoPreviewArea');
        const previewImg = document.getElementById('instPhotoPreviewImg');
        if (previewImg) previewImg.src = photo1Data.url;
        if (previewArea) previewArea.classList.remove('d-none');

        if (typeof window.loadHomeInstitutionPhotos === 'function') {
            window.loadHomeInstitutionPhotos([photo1Data]);
        }

        window.showToast("Institution photo saved successfully!", "success");
    } catch (error) {
        console.error('Error saving photo:', error);
        window.showToast("Failed to save photo: " + error.message, "error");
    }
};

// Aliasing for safety
window.saveInstitutionPhotosSetting = window.saveSinglePhotoSetting;

window.loadHomeInstitutionPhotos = function(photosList = null) {
    const container = document.getElementById('homeGalleryContainer');
    const cardContainer = document.getElementById('homeGalleryCard');
    if (!container || !cardContainer) return;
    
    container.innerHTML = '';
    
    let validPhotos = [];
    if (photosList) {
        validPhotos = photosList.filter(p => p && p.url);
    } else {
        const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
        let cached = localStorage.getItem('cachedGalleryPhotos_' + currentInstitutionId);
        if (cached) {
            try {
                validPhotos = JSON.parse(cached).filter(p => p && p.url);
            } catch(e) {
                validPhotos = [];
            }
        }
    }

    if (validPhotos.length > 0) {
        cardContainer.style.display = 'block';
        
        let photo = validPhotos[0]; 
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="card p-2 border-0 shadow-sm bg-transparent">
                    <img src="${photo.url}" alt="${photo.caption || 'Institution Photo'}" class="img-fluid rounded shadow-sm w-100 gallery-img" style="max-height: 320px; object-fit: contain; background: #000;">
                    ${photo.caption ? `<h6 class="fw-bold text-dark mt-2">${photo.caption}</h6>` : ''}
                </div>
            </div>
        `;
    } else {
        cardContainer.style.display = 'none';
    }
};

window.saveSpecialFundsSetting = async () => {
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
    window.showToast("Special funds updated successfully!", "success");
  } catch (e) {
    window.showToast("Error saving special funds: " + e.message, "error");
  }
};

window.saveWorkingDaysSetting = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const totalWorkingDays = Number(document.getElementById("settingTotalWorkingDays")?.value) || 0;

  try {
    await setDoc(doc(db, "settings", currentInstitutionId), {
      institutionId: currentInstitutionId,
      totalWorkingDays: totalWorkingDays,
      updatedAt: serverTimestamp()
    }, { merge: true });

    window.showToast("Total working days updated successfully!", "success");
  } catch (e) {
    window.showToast("Error saving working days: " + e.message, "error");
  }
};

// ==========================================
// STAFF MANAGEMENT & CLASS ASSIGNMENT MODULE
// ==========================================

window.openStaffProfileModal = (staffId = null) => {
  const modalEl = document.getElementById("staffProfileModal");
  if (!modalEl) {
    window.showToast("Staff profile modal not found in HTML.", "error");
    return;
  }
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

window.prepareApproveStaff = (userId, name, role) => {
  const form = document.getElementById("instAssignClassesForm");
  const idInput = document.getElementById("instAssignStaffId") || document.getElementById("instAssignStaffid");
  const nameDisplay = document.getElementById("instAssignStaffNameDisplay");
  
  if (idInput) idInput.value = userId;
  if (nameDisplay) nameDisplay.innerText = `${name} (${role})`;
  if (form) form.classList.remove("d-none");

  getDoc(doc(db, "users", userId)).then(docSnap => {
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const assigned = userData.assignedClasses || [];
      
      document.querySelectorAll(".inst-approve-class-cb, .staff-class-cb").forEach(cb => {
        cb.checked = assigned.includes(cb.value);
      });
    }
  }).catch(err => {
    console.error("Error fetching staff classes:", err);
  });
};

window.instAssignClassesToStaff = async (e) => {
  if (e) e.preventDefault();
  
  const userId = document.getElementById("instAssignStaffId")?.value || document.getElementById("instAssignStaffid")?.value;
  if (!userId) {
    window.showToast("No staff selected for approval.", "error");
    return;
  }

  const selectedClasses = Array.from(document.querySelectorAll(".inst-approve-class-cb:checked, .staff-class-cb:checked"))
    .map(cb => cb.value);

  try {
    await updateDoc(doc(db, "users", userId), {
      status: "active",
      assignedClasses: selectedClasses,
      updatedAt: serverTimestamp()
    });

    window.showToast("Staff approved and classes assigned successfully!", "success");
    const form = document.getElementById("instAssignClassesForm");
    if (form) form.classList.add("d-none");
    
    if (typeof window.loadPrincipalsList === 'function') {
      window.loadPrincipalsList();
    }
  } catch (err) {
    window.showToast("Error approving staff: " + err.message, "error");
  }
};

window.loadPrincipalsList = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!currentInstitutionId) {
    console.warn("Institution ID not found.");
    return;
  }

  try {
    const q = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId));
    const snap = await getDocs(q);

    let html = "";
    let pendingHtml = "";
    let hasPending = false;

    snap.forEach(d => {
      const user = d.data();
      if (user.email === SUPER_ADMIN_EMAIL) return; 

      const isPending = user.status === "pending";
      const userRoleDisplay = user.role ? user.role.toUpperCase() : 'STAFF';

      const rowHtml = `
        <tr>
          <td><b>${user.name || '-'}</b></td>
          <td><span class="badge bg-secondary">${userRoleDisplay}</span></td>
          <td>${user.email || '-'}</td>
          <td>${user.phone || '-'}</td>
          <td class="text-center">
            ${isPending 
              ? `<button class="btn btn-sm btn-success px-3" onclick="prepareApproveStaff('${d.id}', '${user.name}', '${user.role}')"><i class="fa-solid fa-check me-1"></i> Approve</button>` 
              : `<button class="btn btn-sm btn-outline-primary me-1" onclick="prepareApproveStaff('${d.id}', '${user.name}', '${user.role}')" title="Edit Classes/Role"><i class="fa-solid fa-pen"></i> Edit</button> <span class="badge bg-success">Active</span>`
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

    const tableBody = document.getElementById("staffTableBody") || document.getElementById("principalsTableBody") || document.querySelector("table tbody");
    if (tableBody) {
      tableBody.innerHTML = html || `<tr><td colspan="5" class="text-center text-muted">No staff or principals found for this institution.</td></tr>`;
    }
  } catch (e) {
    console.error("Error loading staff list:", e);
    window.showToast("Error loading staff list: " + e.message, "error");
  }
};

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

// Super Admin List Load Function with Custom Short Code Support
window.loadSuperAdminRequests = async () => {
  const tableBody = document.getElementById("superAdminTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Loading institutions...</td></tr>`;

  try {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);
    let html = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No Madrasa Registrations Found.</td></tr>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const isPending = user.status === "pending";
      const shortCode = user.shortCode || "-";

      html += `
        <tr>
          <td><span class="badge bg-primary fs-6">${shortCode}</span></td>
          <td><b>${user.institutionId || '-'}</b></td>
          <td>${user.institutionName || 'Smart Madrasa'}</td>
          <td>${user.email || '-'}</td>
          <td>${user.name || '-'}</td>
          <td class="text-center">${user.phone || '-'}</td>
          <td>
            <span class="badge ${isPending ? 'bg-warning text-dark' : 'bg-success'}">
              ${isPending ? 'Pending' : 'Active'}
            </span>
          </td>
          <td class="text-center">
            <div class="d-flex align-items-center justify-content-center gap-1">
              ${isPending 
                ? `<button class="btn btn-sm btn-success px-2" onclick="approveMadrasaAdmin('${docSnap.id}')" title="Approve"><i class="fa-solid fa-check"></i></button>`
                : `<span class="badge bg-light text-dark border me-1">Approved</span>`
              }
              <button class="btn btn-sm btn-outline-primary px-2" onclick="editMadrasaDetails('${docSnap.id}', '${user.institutionName || ''}', '${user.name || ''}', '${user.phone || ''}', '${shortCode}')" title="Edit Madrasa">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger px-2" onclick="deleteMadrasaAdmin('${docSnap.id}', '${user.institutionName || 'this institution'}')" title="Delete Madrasa">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  } catch (e) {
    console.error("Error loading super admin data:", e);
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading data: ${e.message}</td></tr>`;
  }
};

// Edit Function to assign/update Short Code (e.g., MD01)
window.editMadrasaDetails = async (userId, currentInstName, currentAdminName, currentPhone, currentShortCode) => {
  const newShortCode = prompt("Enter Custom Short Code (e.g., MD01, MD02):", currentShortCode !== '-' ? currentShortCode : "MD01");
  if (newShortCode === null) return;

  const newInstName = prompt("Edit Madrasa Name:", currentInstName);
  if (newInstName === null) return;

  const newAdminName = prompt("Edit Admin Name:", currentAdminName);
  if (newAdminName === null) return;

  const newPhone = prompt("Edit Phone Number:", currentPhone);
  if (newPhone === null) return;

  try {
    await updateDoc(doc(db, "users", userId), {
      shortCode: newShortCode.trim().toUpperCase(),
      institutionName: newInstName.trim().toUpperCase(),
      name: newAdminName.trim().toUpperCase(),
      phone: newPhone.trim(),
      updatedAt: serverTimestamp()
    });

    window.showToast("Madrasa details & Short Code updated successfully!", "success");
    window.loadSuperAdminRequests();
  } catch (e) {
    console.error("Error updating madrasa:", e);
    window.showToast("Error updating details: " + e.message, "error");
  }
};

// Super Admin സ്ഥാപനങ്ങൾ അപ്രൂവ് ചെയ്യാനുള്ള പുതിയ ഫങ്ഷൻ
window.approveMadrasaAdmin = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      status: "active",
      updatedAt: serverTimestamp()
    });
    window.showToast("Madrasa registration approved successfully!", "success");
    window.loadSuperAdminRequests(); // ലിസ്റ്റ് റീഫ്രഷ് ചെയ്യുക
  } catch (e) {
    window.showToast("Error approving Madrasa: " + e.message, "error");
  }
};
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Strict Super Admin Check
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

        if (window.currentInstitutionId) {
          sessionStorage.setItem("currentInstitutionId", window.currentInstitutionId);
        }

        const instNameEl = document.getElementById("displayMadrassaName");
        if (instNameEl) {
          instNameEl.innerText = window.isSuperAdmin 
            ? "Smart Madrasa - Master Control Center" 
            : (userData.institutionName || "Smart Madrasa");
        }

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

        // Load Settings Data
        if (!window.isSuperAdmin) {
          const instDoc = await getDoc(doc(db, "settings", window.currentInstitutionId));
          if (instDoc.exists()) {
            window.sysFeePermission = instDoc.data().feePermission || "all";
            window.sysReqManualReceipt = instDoc.data().reqManualReceipt || false;
            window.customSpecialFunds = instDoc.data().specialFeeCategories || [];
            
            let data = instDoc.data();
            if (data.photo1) {
              localStorage.setItem('cachedGalleryPhotos_' + window.currentInstitutionId, JSON.stringify([data.photo1]));
              if (typeof window.loadHomeInstitutionPhotos === 'function') {
                window.loadHomeInstitutionPhotos([data.photo1]);
              }
            }
          }
        }

        // ==========================================
        // STRICT ROLE BASED UI VISIBILITY
        // ==========================================
        if (window.isSuperAdmin) {
          // Unhide for Super Admin ONLY
          if (superMasterBtn) superMasterBtn.classList.remove("d-none");
          if (userRoleEl) userRoleEl.innerText = "Super Admin";
          
          window.showTab('superAdminTab');
          if (typeof window.loadSuperAdminRequests === 'function') {
            window.loadSuperAdminRequests();
          }
        } else {
          // Strictly HIDE "All Madrasas" for Institution Admins & Teachers
          if (superMasterBtn) {
            superMasterBtn.classList.add("d-none");
            superMasterBtn.style.display = "none"; // Hard hide fallback
          }
          
          if (userRoleEl) {
            userRoleEl.innerText = window.currentUserRole === "admin" 
              ? "Admin" 
              : (window.currentUserRole === "principal" ? "Principal" : "Teacher");
          }
          
          if (studentsMenuBtn) studentsMenuBtn.classList.remove("d-none");
          if (feesMenuBtn) feesMenuBtn.classList.remove("d-none");
          if (homeMenuBtn) homeMenuBtn.classList.remove("d-none");
          if (attendanceMenuBtn) attendanceMenuBtn.classList.remove("d-none");
          if (marksMenuBtn) marksMenuBtn.classList.remove("d-none");
          if (performanceMenuBtn) performanceMenuBtn.classList.remove("d-none");

          if (window.currentUserRole === "admin" || window.currentUserRole === "principal") {
            if (instAdminStaffBtn) instAdminStaffBtn.classList.remove("d-none");
            if (settingsMenuBtn) settingsMenuBtn.classList.remove("d-none");
          } else {
            if (instAdminStaffBtn) instAdminStaffBtn.classList.add("d-none");
            if (settingsMenuBtn) settingsMenuBtn.classList.add("d-none");
          }

          if (window.currentUserRole === "admin") {
            if (feeSettingsBtn) feeSettingsBtn.classList.remove("d-none");
            if (subjectSettingsBtn) subjectSettingsBtn.classList.remove("d-none");
          }

          // Force Home tab for Non-Super Admins
          window.showTab('homeDashboardTab');
          if (typeof window.loadLeaderboard === 'function') {
            window.loadLeaderboard();
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
        
        // Sync mobile menu AFTER applying visibility classes
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

document.addEventListener('DOMContentLoaded', () => {
    window.loadInstitutionSettings();
});

// Super Admin - View Institution Details Function
window.viewInstitution = async function(instDocId) {
  try {
    const docRef = doc(db, "settings", instDocId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      
      // വിവരങ്ങൾ കാണിക്കുന്ന വിൻഡോ (Alert / Toast)
      alert(
        `📌 MASJID / MADRASA DETAILS\n\n` +
        `• Name: ${data.institutionName || '-'}\n` +
        `• ID: ${data.institutionId || instDocId}\n` +
        `• Admin: ${data.adminName || '-'}\n` +
        `• Email: ${data.email || '-'}\n` +
        `• Phone: ${data.phone || '-'}\n` +
        `• Place: ${data.place || '-'}`
      );
    } else {
      window.showToast("Institution details not found.", "warning");
    }
  } catch (error) {
    console.error("Error viewing institution:", error);
    window.showToast("Error loading details: " + error.message, "error");
  }
};
// മദ്രസ അഡ്മിൻ എഡിറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
window.editMadrasaDetails = async (userId, currentInstName, currentAdminName, currentPhone) => {
  const newInstName = prompt("Edit Madrasa Name:", currentInstName);
  if (newInstName === null) return; // Cancel ചെയ്തു

  const newAdminName = prompt("Edit Admin Name:", currentAdminName);
  if (newAdminName === null) return;

  const newPhone = prompt("Edit Phone Number:", currentPhone);
  if (newPhone === null) return;

  try {
    // Users കളക്ഷനിൽ അപ്ഡേറ്റ് ചെയ്യുന്നു
    await updateDoc(doc(db, "users", userId), {
      institutionName: newInstName.trim().toUpperCase(),
      name: newAdminName.trim().toUpperCase(),
      phone: newPhone.trim(),
      updatedAt: serverTimestamp()
    });

    window.showToast("Madrasa details updated successfully!", "success");
    window.loadSuperAdminRequests(); // ലിസ്റ്റ് റീഫ്രഷ് ചെയ്യുന്നു
  } catch (e) {
    console.error("Error updating madrasa:", e);
    window.showToast("Error updating details: " + e.message, "error");
  }
};

// മദ്രസ അക്കൗണ്ട് ഡിലീറ്റ് ചെയ്യാനുള്ള ഫങ്ഷൻ
window.deleteMadrasaAdmin = async (userId, instName) => {
  if (!confirm(`Are you sure you want to delete ${instName}? This action cannot be undone.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, "users", userId));
    window.showToast("Madrasa account removed successfully!", "success");
    window.loadSuperAdminRequests(); // ലിസ്റ്റ് റീഫ്രഷ് ചെയ്യുന്നു
  } catch (e) {
    console.error("Error deleting madrasa:", e);
    window.showToast("Error deleting account: " + e.message, "error");
  }
};

// 1. എഡിറ്റ് മോഡൽ ഓപ്പൺ ചെയ്യാനുള്ള ഫങ്ഷൻ
window.editMadrasaDetails = function(userId, currentInstName, currentAdminName, currentPhone, currentShortCode, currentEmail) {
  document.getElementById("editMadrasaDocId").value = userId;
  document.getElementById("editMadrasaShortCode").value = currentShortCode !== '-' ? currentShortCode : '';
  document.getElementById("editMadrasaName").value = currentInstName || '';
  document.getElementById("editMadrasaAdminName").value = currentAdminName || '';
  document.getElementById("editMadrasaPhone").value = currentPhone || '';
  document.getElementById("editMadrasaEmail").value = (currentEmail && currentEmail !== '-') ? currentEmail : '';

  const modalEl = document.getElementById("editMadrasaModal");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
};

// 2. മോഡലിൽ നിന്ന് മാറ്റി എഴുതിയ വിവരങ്ങൾ ഫയർസ്റ്റോറിൽ സേവ് ചെയ്യാനുള്ള ഫങ്ഷൻ
window.saveEditedMadrasaDetails = async function() {
  const userId = document.getElementById("editMadrasaDocId").value;
  const shortCode = document.getElementById("editMadrasaShortCode").value.trim().toUpperCase();
  const instName = document.getElementById("editMadrasaName").value.trim().toUpperCase();
  const adminName = document.getElementById("editMadrasaAdminName").value.trim().toUpperCase();
  const phone = document.getElementById("editMadrasaPhone").value.trim();
  const email = document.getElementById("editMadrasaEmail").value.trim().toLowerCase();

  if (!userId) {
    window.showToast("Invalid record ID", "error");
    return;
  }

  try {
    // Users കളക്ഷനിൽ ഡാറ്റ അപ്‌ഡേറ്റ് ചെയ്യുന്നു
    await updateDoc(doc(db, "users", userId), {
      shortCode: shortCode || "-",
      institutionName: instName,
      name: adminName,
      phone: phone,
      email: email,
      updatedAt: serverTimestamp()
    });

    window.showToast("Madrasa details updated successfully!", "success");

    // Modal ക്ലോസ് ചെയ്യുന്നു
    const modalEl = document.getElementById("editMadrasaModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    // Table റീഫ്രഷ് ചെയ്യുന്നു
    window.loadSuperAdminRequests();
  } catch (e) {
    console.error("Error updating madrasa:", e);
    window.showToast("Error updating details: " + e.message, "error");
  }
};

// 3. Table Render ചെയ്യുമ്പോൾ ഈ ഫങ്ഷൻ വിളിക്കുന്ന രീതി:
window.loadSuperAdminRequests = async () => {
  const tableBody = document.getElementById("superAdminTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Loading institutions...</td></tr>`;

  try {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);
    let html = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No Madrasa Registrations Found.</td></tr>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const isPending = user.status === "pending";
      const shortCode = user.shortCode || "-";

      html += `
        <tr>
          <td><span class="badge bg-primary fs-6">${shortCode}</span></td>
          <td><b>${user.institutionId || '-'}</b></td>
          <td>${user.institutionName || 'Smart Madrasa'}</td>
          <td>${user.email || '-'}</td>
          <td>${user.name || '-'}</td>
          <td class="text-center">${user.phone || '-'}</td>
          <td>
            <span class="badge ${isPending ? 'bg-warning text-dark' : 'bg-success'}">
              ${isPending ? 'Pending' : 'Active'}
            </span>
          </td>
          <td class="text-center">
            <div class="d-flex align-items-center justify-content-center gap-1">
              ${isPending 
                ? `<button class="btn btn-sm btn-success px-2" onclick="approveMadrasaAdmin('${docSnap.id}')" title="Approve"><i class="fa-solid fa-check"></i></button>`
                : `<span class="badge bg-light text-dark border me-1">Approved</span>`
              }
              <button class="btn btn-sm btn-outline-primary px-2" onclick="editMadrasaDetails('${docSnap.id}', '${(user.institutionName || '').replace(/'/g, "\\'")}', '${(user.name || '').replace(/'/g, "\\'")}', '${user.phone || ''}', '${shortCode}', '${user.email || ''}')" title="Edit Madrasa">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger px-2" onclick="deleteMadrasaAdmin('${docSnap.id}', '${(user.institutionName || 'this institution').replace(/'/g, "\\'")}')" title="Delete Madrasa">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  } catch (e) {
    console.error("Error loading super admin data:", e);
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading data: ${e.message}</td></tr>`;
  }
};
