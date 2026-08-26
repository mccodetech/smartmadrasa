import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, writeBatch, runTransaction, serverTimestamp, orderBy, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhP5-3Ugbhhiz7di7Ca3Gh3N2LolYo2zw",
  authDomain: "smartmadrasa-2315f.firebaseapp.com",
  projectId: "smartmadrasa-2315f",
  storageBucket: "smartmadrasa-2315f.firebasestorage.app",
  messagingSenderId: "141742930772",
  appId: "1:141742930772:web:277a09fe334b57234726c1",
  measurementId: "G-C168MM2PZW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SUPER_ADMIN_EMAIL = "chembrasseri1@gmail.com";

let currentInstitutionId = "";
let currentUserRole = "admin";
let currentUserAssignedClasses = [];
let currentUserName = "";
let isSuperAdmin = false;
let localStudentsCache = [];
let localPerfStudentsCache = [];
let localTeachersCache = [];
let localPrincipalsCache = [];
let localMadrasasCache = [];
let pendingStaffCache = [];
let lastReceiptWhatsAppPayload = null;
let currentPage = 1;
const pageSize = 50;

let sysFeePermission = "all"; 
let sysReqManualReceipt = false;
let instIdToNameMap = {};

const DEFAULT_SUBJECTS = ["Quran", "Tajweed", "Fiqh", "Aqeedah", "Tareekh", "Lisan"];
const ALL_MONTHS = ["APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"];

// In-App Toast Notification
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

  setTimeout(() => {
    toast.style.transition = "all 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};

// Password Toggle Functionality
window.togglePasswordVisibility = (inputId, btn) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }
};

window.toggleCustomDesignation = (val) => {
  const customInput = document.getElementById("spDesignationCustom");
  if (!customInput) return;
  if (val === "Other") {
    customInput.classList.remove("d-none");
    customInput.required = true;
  } else {
    customInput.classList.add("d-none");
    customInput.required = false;
  }
};

window.detectLoginMode = () => {
  const val = document.getElementById("loginIdentifier").value.trim();
  const pwdGrp = document.getElementById("passwordGroup");
  const phoneGrp = document.getElementById("phoneGroup");
  const submitBtn = document.getElementById("btnAuthSubmit");

  if (/^\d+$/.test(val)) {
    pwdGrp.classList.add("d-none");
    phoneGrp.classList.remove("d-none");
    submitBtn.innerText = "View Student Details";
  } else {
    pwdGrp.classList.remove("d-none");
    phoneGrp.classList.add("d-none");
    submitBtn.innerText = "Sign In";
  }
};

window.syncMobileMenu = () => {
  const desktopMenu = document.getElementById("desktopTabMenu");
  const mobileMenu = document.getElementById("mobileTabMenu");
  if (desktopMenu && mobileMenu) {
    mobileMenu.innerHTML = desktopMenu.innerHTML;
  }
};

window.updateDropdownLabel = (type) => {
  const checkboxes = document.querySelectorAll(`.${type}-class-cb:checked`);
  const label = document.getElementById(`${type}ClassDropdownLabel`);
  if (label) {
    if (!checkboxes.length) {
      label.innerText = "Select Class";
    } else {
      const selected = Array.from(checkboxes).map(cb => cb.value);
      label.innerText = selected.map(c => `Class ${c}`).join(', ');
    }
  }
};

window.logoutParent = () => {
  sessionStorage.clear();
  window.location.reload();
};

window.handleLogout = () => {
  signOut(auth).then(() => {
    sessionStorage.clear();
    window.location.reload();
  }).catch((error) => {
    showToast("Logout Error: " + error.message, "error");
  });
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        isSuperAdmin = (user.email === SUPER_ADMIN_EMAIL);
        
        if (!isSuperAdmin && userData.status === "pending") {
          let alertMsg = "Your registration is pending approval.";
          if (userData.role === 'admin') alertMsg = "Your Madrasa registration is pending approval from the Super Admin. Please contact support.";
          else if (userData.role === 'principal') alertMsg = "Your Principal registration is pending approval from your Institution Admin.";
          else alertMsg = "Your Staff registration is pending approval from your Principal.";
          
          showToast(alertMsg, "warning");
          signOut(auth);
          return;
        }

        currentInstitutionId = userData.institutionId;
        currentUserRole = userData.role || (isSuperAdmin ? "superadmin" : "teacher");
        currentUserAssignedClasses = userData.assignedClasses || [];
        currentUserName = userData.name || "Staff";

        const instNameEl = document.getElementById("displayMadrassaName");
        if (instNameEl) instNameEl.innerText = isSuperAdmin ? "Smart Madrasa - Master Control Center" : (userData.institutionName || "Smart Madrasa");

        const userNameEl = document.getElementById("displayUserName");
        if (userNameEl) userNameEl.innerHTML = `<i class="fa-solid fa-user"></i> ${currentUserName}`;
        
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

        if (!isSuperAdmin) {
          const instDoc = await getDoc(doc(db, "settings", currentInstitutionId));
          if (instDoc.exists()) {
            sysFeePermission = instDoc.data().feePermission || "all";
            sysReqManualReceipt = instDoc.data().reqManualReceipt || false;
          }
        }

        if (isSuperAdmin) {
          if (superMasterBtn) superMasterBtn.classList.remove("d-none");
          if (userRoleEl) userRoleEl.innerText = "Super Admin";
          
          if (homeMenuBtn) homeMenuBtn.classList.add("d-none");
          if (studentsMenuBtn) studentsMenuBtn.classList.add("d-none");
          if (attendanceMenuBtn) attendanceMenuBtn.classList.add("d-none");
          if (marksMenuBtn) marksMenuBtn.classList.add("d-none");
          if (performanceMenuBtn) performanceMenuBtn.classList.add("d-none");
          if (feesMenuBtn) feesMenuBtn.classList.add("d-none");
          if (feeSettingsBtn) feeSettingsBtn.classList.add("d-none");
          if (subjectSettingsBtn) subjectSettingsBtn.classList.add("d-none");
          if (pMenuBtn) pMenuBtn.classList.add("d-none");
          if (instAdminStaffBtn) instAdminStaffBtn.classList.add("d-none");
          if (adminActions) adminActions.classList.add("d-none");
          if (actionCol) actionCol.classList.add("d-none");

          showTab('superAdminTab');
          window.loadSuperAdminRequests();

        } else {
          if (superMasterBtn) superMasterBtn.classList.add("d-none");
          if (userRoleEl) {
            if (currentUserRole === "admin") userRoleEl.innerText = "Admin";
            else if (currentUserRole === "principal") userRoleEl.innerText = "Principal";
            else userRoleEl.innerText = `Teacher (${currentUserAssignedClasses.map(c=>'Class '+c).join(', ')})`;
          }
          
          if (pMenuBtn) pMenuBtn.classList.add("d-none");
          if (adminActions) adminActions.classList.add("d-none");
          if (actionCol) actionCol.classList.add("d-none");
          if (instAdminStaffBtn) instAdminStaffBtn.classList.add("d-none");
          if (homeMenuBtn) homeMenuBtn.classList.remove("d-none");
          if (studentsMenuBtn) studentsMenuBtn.classList.remove("d-none");
          if (attendanceMenuBtn) attendanceMenuBtn.classList.remove("d-none");
          if (marksMenuBtn) marksMenuBtn.classList.remove("d-none");
          if (performanceMenuBtn) performanceMenuBtn.classList.remove("d-none");
          if (feesMenuBtn) feesMenuBtn.classList.remove("d-none");
          if (feeSettingsBtn) feeSettingsBtn.classList.add("d-none");
          if (subjectSettingsBtn) subjectSettingsBtn.classList.add("d-none");

          if (currentUserRole === "admin") {
            if (instAdminStaffBtn) instAdminStaffBtn.classList.remove("d-none");
            if (homeMenuBtn) homeMenuBtn.classList.add("d-none");
            if (attendanceMenuBtn) attendanceMenuBtn.classList.add("d-none");
            if (marksMenuBtn) marksMenuBtn.classList.add("d-none");
            if (performanceMenuBtn) performanceMenuBtn.classList.add("d-none");
            
            if (adminActions) adminActions.classList.remove("d-none");
            if (actionCol) actionCol.classList.remove("d-none");
            if (feesMenuBtn) feesMenuBtn.classList.remove("d-none");
            if (feeSettingsBtn) feeSettingsBtn.classList.remove("d-none");
            if (subjectSettingsBtn) subjectSettingsBtn.classList.remove("d-none");

            showTab('instAdminTab'); 
            window.loadPrincipalsList(); 
            
            document.getElementById("reqManualReceipt").checked = sysReqManualReceipt;
            const rBtns = document.getElementsByName("feePermission");
            for (let i = 0; i < rBtns.length; i++) {
              if (rBtns[i].value === sysFeePermission) rBtns[i].checked = true;
            }

          } else if (currentUserRole === "principal") {
            if (pMenuBtn) pMenuBtn.classList.remove("d-none");
            if (adminActions) adminActions.classList.remove("d-none");
            if (actionCol) actionCol.classList.remove("d-none");
            if (subjectSettingsBtn) subjectSettingsBtn.classList.remove("d-none");
            
            showTab('homeDashboardTab');
            loadLeaderboard();
            window.loadPrincipalsList();
          } else if (currentUserRole === "teacher") {
            showTab('homeDashboardTab');
            loadLeaderboard();
          }
        }

        document.getElementById("authSection").classList.add("d-none");
        document.getElementById("appSection").classList.remove("d-none");
        
        const attDateEl = document.getElementById("attDate");
        if (attDateEl) attDateEl.valueAsDate = new Date();

        if (!isSuperAdmin) populateClassDropdowns();
        syncMobileMenu();
      } else {
        showToast("User profile record not found. Please contact Administrator.", "error");
        signOut(auth);
      }
    } catch (e) {
      console.error("Auth Load Error:", e);
    }
  } else {
    if (!sessionStorage.getItem("parentLoggedIn")) {
      document.getElementById("authSection").classList.remove("d-none");
      document.getElementById("appSection").classList.add("d-none");
    }
  }
});

// ==========================================
// SUPER ADMIN MASTER CONTROL (COUNTING ONLY ACTIVE STUDENTS)
// ==========================================

window.loadSuperAdminRequests = async () => {
  const tbody = document.getElementById("superAdminTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-3"><i class="fa-solid fa-spinner fa-spin me-2"></i>Loading registered madrasas...</td></tr>`;

  try {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const snap = await getDocs(q);

    localMadrasasCache = [];
    snap.forEach(d => {
      const data = d.data();
      if (data.email !== SUPER_ADMIN_EMAIL) {
        localMadrasasCache.push({ id: d.id, ...data });
      }
    });

    let html = "";
    for (const u of localMadrasasCache) {
      const isPending = (u.status === "pending");
      const statusBadge = isPending 
        ? `<span class="badge bg-warning text-dark">Pending Approval</span>` 
        : `<span class="badge bg-success">Active</span>`;

      const approveOrManageBtn = isPending 
        ? `<button class="btn btn-sm btn-success me-1" onclick="approveMadrasa('${u.id}', '${u.institutionName}')" title="Approve"><i class="fa-solid fa-check me-1"></i> Approve</button>`
        : `<button class="btn btn-sm btn-primary me-1" onclick="switchMadrasaScope('${u.institutionId}', '${u.institutionName}')" title="Manage Scope"><i class="fa-solid fa-folder-open me-1"></i> Manage</button>`;

      let stuCount = 0;
      let staffCount = 0;

      try {
        // COUNT ONLY ACTIVE STUDENTS
        const stuQ = query(collection(db, "students"), where("institutionId", "==", u.institutionId), where("status", "==", "active"));
        const stuSnap = await getCountFromServer(stuQ);
        stuCount = stuSnap.data().count;

        const staffQ = query(collection(db, "users"), where("institutionId", "==", u.institutionId));
        const staffSnap = await getCountFromServer(staffQ);
        staffCount = Math.max(0, staffSnap.data().count - 1);
      } catch (e) {
        console.log("Count error", e);
      }

      html += `
        <tr>
          <td><b>${u.institutionId || u.institutionCode || '-'}</b></td>
          <td><b>${u.institutionName || '-'}</b></td>
          <td>${u.place || '-'}</td>
          <td>${u.name || '-'}</td>
          <td class="text-center"><span class="badge bg-info text-dark">${staffCount}</span></td>
          <td class="text-center"><span class="badge bg-primary">${stuCount}</span></td>
          <td>${statusBadge}</td>
          <td class="text-center">
            ${approveOrManageBtn}
            <button class="btn btn-sm btn-outline-secondary me-1" onclick="openSuperAdminEditMadrasaModal('${u.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="rejectMadrasa('${u.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }
    tbody.innerHTML = html || `<tr><td colspan="8" class="text-center text-muted py-3">No madrasa accounts found.</td></tr>`;
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-3">Error loading data: ${e.message}</td></tr>`;
  }
};

window.approveMadrasa = async (userId, instName) => {
  if (confirm(`Approve registration for ${instName}?`)) {
    try {
      await updateDoc(doc(db, "users", userId), { status: "active" });
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        showToast("Madrasa approved successfully!", "success");

        if (data.whatsapp || data.phone) {
          const destPhone = data.whatsapp || data.phone;
          let waMsg = `Hello ${data.name},%0A%0AYour institution *${data.institutionName}* has been approved on Smart Madrasa.%0A%0AYour Institution ID is: *${data.institutionId}*.`;
          const cleanPhone = destPhone.replace(/[^0-9]/g, '');
          const waUrl = cleanPhone.length >= 10 ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`;
          window.open(waUrl, "_blank");
        }
      }
      window.loadSuperAdminRequests();
    } catch (e) {
      showToast("Error approving: " + e.message, "error");
    }
  }
};

window.rejectMadrasa = async (userId) => {
  if (confirm(`Delete this madrasa account completely?`)) {
    try {
      await deleteDoc(doc(db, "users", userId));
      showToast("Madrasa account deleted.", "success");
      window.loadSuperAdminRequests();
    } catch (e) {
      showToast("Error deleting: " + e.message, "error");
    }
  }
};

window.openSuperAdminEditMadrasaModal = (docId) => {
  const m = localMadrasasCache.find(x => x.id === docId);
  if (!m) return;
  document.getElementById("saEditDocId").value = docId;
  document.getElementById("saEditBoard").value = m.institutionBoard || 'SKIMVB';
  document.getElementById("saEditInstCode").value = m.institutionCode || '';
  document.getElementById("saEditInstName").value = m.institutionName || '';
  document.getElementById("saEditName").value = m.name || '';
  document.getElementById("saEditEmail").value = m.email || '';
  document.getElementById("saEditPhone").value = m.phone || '';
  document.getElementById("saEditStatus").value = m.status || 'active';
  new bootstrap.Modal(document.getElementById('superAdminEditMadrasaModal')).show();
};

window.saveEditedMadrasaBySuperAdmin = async (e) => {
  e.preventDefault();
  const docId = document.getElementById("saEditDocId").value;
  const board = document.getElementById("saEditBoard").value;
  const code = document.getElementById("saEditInstCode").value.trim().toUpperCase();
  const instName = document.getElementById("saEditInstName").value.trim().toUpperCase();
  const name = document.getElementById("saEditName").value.trim().toUpperCase();
  const email = document.getElementById("saEditEmail").value.trim().toLowerCase();
  const phone = document.getElementById("saEditPhone").value.trim();
  const status = document.getElementById("saEditStatus").value;
  const instId = board + "_" + code;

  try {
    await updateDoc(doc(db, "users", docId), {
      institutionId: instId,
      institutionCode: code,
      institutionBoard: board,
      institutionName: instName,
      name: name,
      email: email,
      phone: phone,
      status: status,
      updatedAt: serverTimestamp()
    });
    showToast("Madrasa details updated successfully!", "success");
    bootstrap.Modal.getInstance(document.getElementById('superAdminEditMadrasaModal')).hide();
    window.loadSuperAdminRequests();
  } catch (err) { showToast("Error: " + err.message, "error"); }
};

window.switchMadrasaScope = (instId, instName) => {
  currentInstitutionId = instId;
  document.getElementById("displayMadrassaName").innerText = instName + " (Super Admin View)";
  document.getElementById("superAdminBackBtn").classList.remove("d-none");
  
  document.getElementById("studentsMenuBtn").classList.remove("d-none");
  document.getElementById("attendanceMenuBtn").classList.remove("d-none");
  document.getElementById("marksMenuBtn").classList.remove("d-none");
  document.getElementById("performanceMenuBtn").classList.remove("d-none");
  document.getElementById("feesMenuBtn").classList.remove("d-none");
  document.getElementById("feeSettingsBtn").classList.remove("d-none");
  document.getElementById("subjectSettingsBtn").classList.remove("d-none");
  document.getElementById("instAdminStaffBtn").classList.remove("d-none");

  showTab('instAdminTab'); 
  window.loadPrincipalsList();
};

window.returnToSuperAdminConsole = () => {
  document.getElementById("displayMadrassaName").innerText = "Smart Madrasa - Master Control Center";
  document.getElementById("superAdminBackBtn").classList.add("d-none");

  document.getElementById("studentsMenuBtn").classList.add("d-none");
  document.getElementById("attendanceMenuBtn").classList.add("d-none");
  document.getElementById("marksMenuBtn").classList.add("d-none");
  document.getElementById("performanceMenuBtn").classList.add("d-none");
  document.getElementById("feesMenuBtn").classList.add("d-none");
  document.getElementById("feeSettingsBtn").classList.add("d-none");
  document.getElementById("subjectSettingsBtn").classList.add("d-none");
  document.getElementById("instAdminStaffBtn").classList.add("d-none");

  showTab('superAdminTab');
};

// ==========================================
// REGISTRATION (SMOOTH RESET WITHOUT STUCKING)
// ==========================================

window.handleSignUp = async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("btnSubmitSignup");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";
  }

  try {
    const board = document.getElementById("regBoard")?.value || "Other";
    const instCode = (document.getElementById("regInstCode")?.value || "").trim().toUpperCase();
    const instName = (document.getElementById("regInstName")?.value || "").trim().toUpperCase();
    const userName = (document.getElementById("regUserName")?.value || "").trim().toUpperCase();
    const phone = (document.getElementById("regPhone")?.value || "").trim();
    const whatsapp = (document.getElementById("regWhatsapp")?.value || "").trim() || phone;
    const email = (document.getElementById("regEmail")?.value || "").trim().toLowerCase();
    
    const pwd = document.getElementById("regPassword")?.value || "";
    const pwdConfirm = document.getElementById("regPasswordConfirm")?.value || "";

    if (pwd !== pwdConfirm) {
      showToast("Passwords do not match! Please check both fields.", "warning");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit for Approval";
      }
      return;
    }

    if (pwd.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit for Approval";
      }
      return;
    }

    const instId = board + "_" + instCode;
    const address = (document.getElementById("regAddress")?.value || "").trim().toUpperCase();
    const place = (document.getElementById("regPlace")?.value || "").trim().toUpperCase();
    const po = (document.getElementById("regPo")?.value || "").trim().toUpperCase();
    const pincode = (document.getElementById("regPincode")?.value || "").trim();
    const district = (document.getElementById("regDistrict")?.value || "").trim().toUpperCase();
    const locationLink = (document.getElementById("regLocationLink")?.value || "").trim();

    const isDev = (email === SUPER_ADMIN_EMAIL);
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: userName,
      phone: phone,
      whatsapp: whatsapp,
      email: email,
      institutionId: instId,
      institutionCode: instCode,
      institutionBoard: board,
      institutionName: instName,
      address: address,
      place: place,
      po: po,
      pincode: pincode,
      district: district,
      locationLink: locationLink,
      role: "admin",
      status: isDev ? "active" : "pending",
      assignedClasses: [],
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "settings", instId), {
      feePermission: "all",
      reqManualReceipt: false
    });

    const form = document.getElementById("signupForm");
    if (form) form.reset();

    if (isDev) {
      showToast("Developer Account registered and activated!", "success");
    } else {
      showToast("Registration submitted! Please wait for Super Admin approval.", "success");
      await signOut(auth);
      window.switchAuthTab('login');
    }
  } catch (err) { 
    showToast("Registration failed: " + err.message, "error"); 
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit for Approval";
    }
  }
};

window.handleStaffSignUp = async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("btnStaffSubmitSignup");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";
  }

  try {
    const role = document.getElementById("staffRole")?.value || "teacher";
    const board = document.getElementById("staffBoard")?.value || "SKIMVB";
    const instCode = (document.getElementById("staffInstCode")?.value || "").trim().toUpperCase();
    const instId = board + "_" + instCode; 
    
    const userName = (document.getElementById("staffName")?.value || "").trim().toUpperCase();
    const phone = (document.getElementById("staffPhone")?.value || "").trim();
    const whatsapp = (document.getElementById("staffWhatsapp")?.value || "").trim() || phone;
    const email = (document.getElementById("staffEmail")?.value || "").trim().toLowerCase();
    
    const pwd = document.getElementById("staffPassword")?.value || "";
    const pwdConfirm = document.getElementById("staffPasswordConfirm")?.value || "";

    // 1. Password Confirmation Check
    if (pwd !== pwdConfirm) {
      showToast("Passwords do not match! Please check both fields.", "warning");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Request";
      }
      return;
    }

    if (pwd.length < 6) {
      showToast("Password must be at least 6 characters long.", "warning");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Request";
      }
      return;
    }

    // 2. Check if Madrasa exists
    const instQuery = query(collection(db, "users"), where("institutionId", "==", instId), where("role", "==", "admin"));
    const instSnap = await getDocs(instQuery);

    if (instSnap.empty) {
      showToast("Madrasa Code not found. Please check Board & Code with your Admin.", "warning");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Request";
      }
      return;
    }
    
    let instName = "";
    instSnap.forEach(d => instName = d.data().institutionName);

    // Map Malayalam role to system designation
    let desigTitle = "മുഅല്ലിം";
    let systemRole = "teacher";
    if (role === "principal") {
      desigTitle = "സദർ മുഅല്ലിം";
      systemRole = "principal";
    } else if (role === "vice_principal") {
      desigTitle = "വൈസ് സദർ";
      systemRole = "teacher";
    } else if (role === "in_charge") {
      desigTitle = "സദർ ഇൻ-ചാർജ്";
      systemRole = "teacher";
    }

    // 3. Create Firebase User
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    
    // 4. Save to Firestore Database
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: userName,
      phone: phone,
      whatsapp: whatsapp,
      email: email,
      institutionId: instId,
      institutionName: instName,
      role: systemRole,
      designation: desigTitle,
      status: "pending", 
      assignedClasses: [],
      createdAt: serverTimestamp()
    });

    // 5. Clean Reset Form & Switch Tab
    const form = document.getElementById("staffSignupForm");
    if (form) form.reset();

    showToast("Request submitted successfully! Please wait for approval.", "success");
    
    // Sign out immediately so state stays clean
    await signOut(auth);
    window.switchAuthTab('login');

  } catch (err) { 
    showToast("Registration failed: " + err.message, "error"); 
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Request";
    }
  }
};
// ==========================================
// UNIFIED LOGIN
// ==========================================

let parentStudentsData = [];
window.handleUnifiedLogin = async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim();

  if (/^\d+$/.test(identifier)) {
    const reg = Number(identifier);
    const mobile = document.getElementById("loginMobile").value.trim().slice(-10);

    if (!mobile) return showToast("Please enter the registered mobile number.", "warning");

    const q = query(collection(db, "students"), where("regNo", "==", reg));
    const snap = await getDocs(q);

    if (snap.empty) return showToast("Student record not found.", "error");

    let matchedStudent = null;
    snap.forEach(d => {
      const data = d.data();
      const sPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (sPhone === mobile) matchedStudent = {id: d.id, ...data};
    });

    if (!matchedStudent) return showToast("Phone number does not match.", "error");

    const siblingsQ = query(collection(db, "students"), where("institutionId", "==", matchedStudent.institutionId));
    const siblingsSnap = await getDocs(siblingsQ);
    
    parentStudentsData = [];
    siblingsSnap.forEach(d => {
      const data = d.data();
      const sPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (sPhone === mobile) {
        parentStudentsData.push({id: d.id, ...data});
      }
    });

    sessionStorage.setItem("parentLoggedIn", "true");
    document.getElementById("authSection").classList.add("d-none");
    document.getElementById("parentViewSection").classList.remove("d-none");

    const studentSelect = document.getElementById("parentStudentSelect");
    studentSelect.innerHTML = "";
    parentStudentsData.forEach(student => {
      const option = document.createElement("option");
      option.value = student.regNo;
      option.text = `${student.name} (Reg No: ${student.regNo})`;
      if (student.regNo === reg) option.selected = true;
      studentSelect.appendChild(option);
    });

    loadParentStudentData(matchedStudent);

  } else {
    const email = identifier.toLowerCase();
    const password = document.getElementById("loginPassword").value;
    if (!password) return showToast("Please enter your password.", "warning");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Signed in successfully!", "success");
    } catch (err) { showToast("Sign-in failed: " + err.message, "error"); }
  }
};

window.switchParentStudent = () => {
  const selectedRegNo = Number(document.getElementById("parentStudentSelect").value);
  const selectedStudent = parentStudentsData.find(s => s.regNo === selectedRegNo);
  if (selectedStudent) loadParentStudentData(selectedStudent);
};

async function loadParentStudentData(student) {
  document.getElementById("pvStudentName").innerText = student.name;
  document.getElementById("pvClass").innerText = "Class " + (student.currentClass || '').replace(/Class\s*/i, "");
  document.getElementById("pvRegNo").innerText = student.regNo;
  document.getElementById("pvFather").innerText = student.fatherName || student.guardianName || '-';

  const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
  const feeSnap = await getDocs(feeQ);
  
  let feeHtml = "";
  const paidMonths = new Set();
  feeSnap.forEach(fd => {
    const f = fd.data();
    feeHtml += `<tr><td>#${f.receiptNo}</td><td>${f.date || '-'}</td><td>${f.feeType}</td><td class="fw-bold text-success">₹${f.amount}</td></tr>`;
    ALL_MONTHS.forEach(m => {
      if (f.feeType && f.feeType.includes(m)) paidMonths.add(m);
    });
  });
  document.getElementById("pvFeeTableBody").innerHTML = feeHtml || `<tr><td colspan="4" class="text-center text-muted">No fee records found</td></tr>`;

  let gridHtml = "";
  ALL_MONTHS.forEach(m => {
    if (paidMonths.has(m)) {
      gridHtml += `<div class="month-badge month-paid">${m}<br><small>PAID</small></div>`;
    } else {
      gridHtml += `<div class="month-badge month-pending">${m}<br><small>DUE</small></div>`;
    }
  });
  document.getElementById("pvFeeMonthGrid").innerHTML = gridHtml;

  const perfQ = query(collection(db, "performancePoints"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
  const perfSnap = await getDocs(perfQ);
  let totalPts = 0;
  let perfHtml = "";
  perfSnap.forEach(pd => {
    const p = pd.data();
    totalPts += (Number(p.points) || 0);
    perfHtml += `<tr><td>${p.date || '-'}</td><td>${p.task}</td><td class="fw-bold ${p.points >= 0 ? 'text-success' : 'text-danger'}">${p.points > 0 ? '+' : ''}${p.points} Pts</td></tr>`;
  });
  document.getElementById("pvTotalPoints").innerText = totalPts + " Pts";
  document.getElementById("pvPointsTableBody").innerHTML = perfHtml || `<tr><td colspan="3" class="text-center text-muted">No points awarded yet</td></tr>`;
}

// ==========================================
// SUBJECT SETTINGS & MARKS ENTRY
// ==========================================

window.loadClassSubjectSettings = async () => {
  const selClass = document.getElementById("subjectClassSelect").value;
  try {
    const docRef = doc(db, "subjectSettings", `${currentInstitutionId}_Class_${selClass}`);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().subjects) {
      document.getElementById("customSubjectsInput").value = snap.data().subjects.join(", ");
    } else {
      document.getElementById("customSubjectsInput").value = DEFAULT_SUBJECTS.join(", ");
    }
  } catch (e) {
    document.getElementById("customSubjectsInput").value = DEFAULT_SUBJECTS.join(", ");
  }
};

window.saveClassSubjects = async () => {
  const selClass = document.getElementById("subjectClassSelect").value;
  const rawInput = document.getElementById("customSubjectsInput").value;
  const subjectsArray = rawInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

  if (subjectsArray.length === 0) return showToast("Please enter at least one subject.", "warning");

  try {
    await setDoc(doc(db, "subjectSettings", `${currentInstitutionId}_Class_${selClass}`), {
      institutionId: currentInstitutionId,
      class: selClass,
      subjects: subjectsArray,
      updatedAt: serverTimestamp()
    });
    showToast(`Subjects for Class ${selClass} updated successfully!`, "success");
  } catch (e) {
    showToast("Error saving subjects: " + e.message, "error");
  }
};

window.resetMarksButton = () => {
  const btn = document.getElementById("btnSaveMarks");
  if (btn) {
    btn.disabled = false;
    btn.className = "btn btn-primary-custom px-4 mt-2";
    btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Marks`;
  }
};

window.loadMarksEntrySheet = async () => {
  window.resetMarksButton();
  const selClass = document.getElementById("markClassSelect").value;
  if (!selClass) { document.getElementById("marksSheetArea").classList.add("d-none"); return; }

  const cleanClass = selClass.replace(/Class\s*/i, "").trim();
  const area = document.getElementById("marksSheetArea");
  const thead = document.getElementById("marksTableHead");
  const tbody = document.getElementById("marksTableBody");

  tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading subjects and students...</td></tr>`;
  area.classList.remove("d-none");

  let currentSubjects = DEFAULT_SUBJECTS;
  try {
    const subDoc = await getDoc(doc(db, "subjectSettings", `${currentInstitutionId}_Class_${cleanClass}`));
    if (subDoc.exists() && subDoc.data().subjects && subDoc.data().subjects.length > 0) {
      currentSubjects = subDoc.data().subjects;
    }
  } catch (e) {
    console.log("Using default subjects");
  }

  let headHtml = `<tr><th>Reg No</th><th>Name</th>`;
  currentSubjects.forEach(sub => {
    headHtml += `<th>${sub}</th>`;
  });
  headHtml += `</tr>`;
  thead.innerHTML = headHtml;

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", cleanClass), where("status", "==", "active"));
  const snap = await getDocs(q);

  let students = [];
  snap.forEach(d => students.push({ id: d.id, ...d.data() }));
  students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  let bodyHtml = "";
  students.forEach(s => {
    bodyHtml += `<tr data-sid="${s.id}" data-reg="${s.regNo}" data-name="${s.name}">
      <td><b>${s.regNo || '-'}</b></td>
      <td>${s.name}</td>`;
    currentSubjects.forEach((sub) => {
      bodyHtml += `<td><input type="number" class="form-control form-control-sm text-center sub-mark-input" data-subject="${sub}" style="max-width:80px; margin:auto;" oninput="resetMarksButton()"></td>`;
    });
    bodyHtml += `</tr>`;
  });

  tbody.innerHTML = bodyHtml || `<tr><td colspan="${currentSubjects.length + 2}" class="text-center text-muted">No students in this class.</td></tr>`;
};

window.saveClassMarks = async () => {
  const exam = document.getElementById("markExamSelect").value;
  const selClass = document.getElementById("markClassSelect").value;
  if (!exam || !selClass) return showToast("Select exam and class.", "warning");

  const btn = document.getElementById("btnSaveMarks");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving...`;
  }

  const cleanClass = selClass.replace(/Class\s*/i, "").trim();
  const rows = document.querySelectorAll("#marksTableBody tr[data-sid]");
  const batch = writeBatch(db);

  rows.forEach(r => {
    const sid = r.getAttribute("data-sid");
    const reg = r.getAttribute("data-reg");
    const name = r.getAttribute("data-name");

    const scores = {};
    r.querySelectorAll(".sub-mark-input").forEach(input => {
      const subName = input.getAttribute("data-subject");
      scores[subName] = Number(input.value) || 0;
    });

    const markRef = doc(collection(db, "marks"));
    batch.set(markRef, {
      institutionId: currentInstitutionId,
      examName: exam,
      class: cleanClass,
      studentId: sid,
      regNo: Number(reg),
      studentName: name,
      scores: scores,
      timestamp: serverTimestamp()
    });
  });

  try {
    await batch.commit();
    if (btn) {
      btn.className = "btn btn-secondary px-4 mt-2"; 
      btn.innerHTML = `<i class="fa-solid fa-check me-1"></i> Saved Successfully`;
    }
    showToast("Marks saved successfully!", "success");
  } catch (err) { 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Marks`;
    }
    showToast("Error: " + err.message, "error"); 
  }
};

// ==========================================
// FEES MODULE
// ==========================================

window.loadStudentsForFees = async () => {
  const selClass = document.getElementById("feeClassSelect").value;
  const tableArea = document.getElementById("feesTableArea");
  const tbody = document.getElementById("feesTableBody");
  const alertArea = document.getElementById("feeCollectionAlert");
  const collectionArea = document.getElementById("feeCollectionArea");

  let canCollect = false;
  if (currentUserRole === "admin") canCollect = true;
  else if (currentUserRole === "principal" && (sysFeePermission === "principal" || sysFeePermission === "all")) canCollect = true;
  else if (currentUserRole === "teacher" && sysFeePermission === "all") canCollect = true;

  if (!canCollect) {
    alertArea.classList.remove("d-none");
    collectionArea.classList.add("d-none");
    return;
  } else {
    alertArea.classList.add("d-none");
    collectionArea.classList.remove("d-none");
  }

  if (!selClass) { tableArea.classList.add("d-none"); return; }
  
  tableArea.classList.remove("d-none");
  tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading student fee status...</td></tr>`;

  const cleanClass = selClass.replace(/Class\s*/i, "").trim();
  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", cleanClass), where("status", "==", "active"));
  const snap = await getDocs(q);

  let students = [];
  snap.forEach(d => students.push({ id: d.id, ...d.data() }));
  students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No students in this class.</td></tr>`;
    return;
  }

  const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", currentInstitutionId), where("class", "==", cleanClass));
  const feeSnap = await getDocs(feeQ);
  
  const studentPaidMonths = {};
  feeSnap.forEach(d => {
    const f = d.data();
    if (!studentPaidMonths[f.regNo]) studentPaidMonths[f.regNo] = new Set();
    ALL_MONTHS.forEach(m => {
      if (f.feeType && f.feeType.includes(m)) {
        studentPaidMonths[f.regNo].add(m);
      }
    });
  });

  let html = "";
  students.forEach(s => {
    const defaultFee = s.monthlyFeeAmount || 0;
    const paidSet = studentPaidMonths[s.regNo] || new Set();

    let monthBadges = `<div class="d-flex flex-wrap gap-1">`;
    ALL_MONTHS.forEach(m => {
      if (paidSet.has(m)) {
        monthBadges += `<span class="badge bg-success" style="font-size:0.7rem;">${m}</span>`;
      } else {
        monthBadges += `<span class="badge bg-light text-danger border border-danger" style="font-size:0.7rem;">${m}</span>`;
      }
    });
    monthBadges += `</div>`;

    const sDataStr = encodeURIComponent(JSON.stringify({
      id: s.id,
      regNo: s.regNo,
      name: s.name,
      class: s.currentClass,
      phone: s.phone || '',
      fee: defaultFee
    }));

    html += `
      <tr>
        <td><b>${s.regNo || '-'}</b></td>
        <td><b>${s.name}</b></td>
        <td class="text-primary fw-bold">₹${defaultFee}</td>
        <td>${monthBadges}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-success w-100" onclick="openFeeModal('${sDataStr}')">Pay Fee</button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
};

window.calculateFeeAmount = () => {
  const category = document.getElementById("payFeeCategory").value;
  const baseFee = Number(document.getElementById("payBaseFee").value) || 0;
  const monthDiv = document.getElementById("monthSelectionDiv");
  let total = 0;

  if (category === "Monthly Fee") {
    monthDiv.classList.remove("d-none");
    const checkedCount = document.querySelectorAll(".month-cb:checked").length;
    total = baseFee * checkedCount;
  } else {
    monthDiv.classList.add("d-none");
    total = baseFee;
  }
  
  document.getElementById("payAmount").value = total;
};

window.openFeeModal = (studentDataStr) => {
  const s = JSON.parse(decodeURIComponent(studentDataStr));
  
  document.getElementById("feePaymentForm").reset();

  document.getElementById("payStudentId").value = s.id;
  document.getElementById("payStudentReg").value = s.regNo;
  document.getElementById("payStudentName").value = s.name;
  document.getElementById("payStudentClass").value = s.class;
  document.getElementById("payStudentPhone").value = s.phone;
  document.getElementById("payBaseFee").value = s.fee;

  document.getElementById("payStudentNameDisplay").innerText = `${s.name} (Reg: ${s.regNo})`;
  document.getElementById("payFeeCategory").value = "Monthly Fee";
  document.getElementById("monthSelectionDiv").classList.remove("d-none");
  
  const manualInput = document.getElementById("payManualReceiptInput");
  if (sysReqManualReceipt) {
    manualInput.required = true;
    manualInput.placeholder = "Required";
  } else {
    manualInput.required = false;
    manualInput.placeholder = "Optional";
  }

  calculateFeeAmount();
  new bootstrap.Modal(document.getElementById('feePaymentModal')).show();
};

window.saveFeePayment = async (e) => {
  e.preventDefault();
  
  const sId = document.getElementById("payStudentId").value;
  const reg = document.getElementById("payStudentReg").value;
  const name = document.getElementById("payStudentName").value;
  const sClass = document.getElementById("payStudentClass").value;
  const phone = document.getElementById("payStudentPhone").value;
  
  const amount = document.getElementById("payAmount").value;
  const academicYear = document.getElementById("payAcademicYear").value;
  const category = document.getElementById("payFeeCategory").value;
  const manual = document.getElementById("payManualReceiptInput").value.trim().toUpperCase();
  const today = new Date().toLocaleDateString();

  let finalFeeTypeStr = category;
  
  if (category === "Monthly Fee") {
    const checkedMonths = Array.from(document.querySelectorAll(".month-cb:checked")).map(cb => cb.value);
    if (checkedMonths.length === 0) {
      return showToast("Please select at least one month.", "warning");
    }
    finalFeeTypeStr = `Monthly Fee (${academicYear}): ${checkedMonths.join(', ')}`;
  } else {
    finalFeeTypeStr = `${category} (${academicYear})`;
  }

  try {
    const counterRef = doc(db, "counters", currentInstitutionId + "_receipts");
    let nextReceiptNo = 1;

    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (counterDoc.exists()) {
        nextReceiptNo = (counterDoc.data().lastNo || 0) + 1;
        transaction.update(counterRef, { lastNo: nextReceiptNo });
      } else {
        transaction.set(counterRef, { lastNo: 1 });
      }
    });

    await addDoc(collection(db, "feeCollections"), {
      institutionId: currentInstitutionId,
      receiptNo: nextReceiptNo,
      studentId: sId,
      regNo: Number(reg),
      studentName: name,
      class: sClass,
      amount: Number(amount),
      feeType: finalFeeTypeStr,
      manualReceiptNo: manual,
      date: today,
      collectedBy: auth.currentUser.uid,
      collectedByName: currentUserName,
      timestamp: serverTimestamp()
    });

    document.getElementById("recMadrassaName").innerText = document.getElementById("displayMadrassaName").innerText;
    document.getElementById("recNo").innerText = "#" + nextReceiptNo;
    document.getElementById("recDate").innerText = today;
    document.getElementById("recStudentName").innerText = name;
    document.getElementById("recAdmNo").innerText = reg;
    document.getElementById("recClass").innerText = "Class " + sClass;
    document.getElementById("recFeeType").innerText = finalFeeTypeStr;
    document.getElementById("recAmount").innerText = "₹" + amount;
    document.getElementById("recCollector").innerText = currentUserName;

    if (manual) {
      document.getElementById("recManualNo").innerText = manual;
      document.getElementById("recManualBox").classList.remove("d-none");
    } else {
      document.getElementById("recManualBox").classList.add("d-none");
    }

    lastReceiptWhatsAppPayload = {
      phone: phone,
      madrassa: document.getElementById("displayMadrassaName").innerText,
      receiptNo: nextReceiptNo,
      name: name,
      reg: reg,
      class: sClass,
      amount: amount,
      type: finalFeeTypeStr,
      manual: manual,
      date: today
    };

    if (phone) {
      document.getElementById("whatsappShareBtn").classList.remove("d-none");
    } else {
      document.getElementById("whatsappShareBtn").classList.add("d-none");
    }

    bootstrap.Modal.getInstance(document.getElementById('feePaymentModal')).hide();
    
    document.getElementById("appSection").classList.add("d-none");
    document.getElementById("printableReceipt").classList.remove("d-none");
    
    loadStudentsForFees();

  } catch (err) { showToast("Error: " + err.message, "error"); }
};

window.shareToWhatsApp = () => {
  if (!lastReceiptWhatsAppPayload) return;
  const p = lastReceiptWhatsAppPayload;

  let msg = `*${p.madrassa} - Fee Receipt*%0A%0A`;
  msg += `Receipt No: #${p.receiptNo}%0A`;
  msg += `Date: ${p.date}%0A`;
  msg += `Student: *${p.name}* (Reg No: ${p.reg})%0A`;
  msg += `Class: ${p.class}%0A`;
  msg += `Month/Type: ${p.type}%0A`;
  if (p.manual) msg += `Book Receipt No: ${p.manual}%0A`;
  msg += `Amount Received: *₹${p.amount}*%0A%0A`;
  msg += `_May Allah bless you_`;

  const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone.length >= 10 
    ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${msg}`
    : `https://wa.me/?text=${msg}`;

  window.open(waUrl, "_blank");
};

window.generateFeeReport = async () => {
  const fromStr = document.getElementById("feeReportFrom").value;
  const toStr = document.getElementById("feeReportTo").value;
  
  if (!fromStr || !toStr) return showToast("Please select both From and To dates.", "warning");
  
  const fromDate = new Date(fromStr);
  fromDate.setHours(0,0,0,0);
  const toDate = new Date(toStr);
  toDate.setHours(23,59,59,999);

  const tbody = document.getElementById("feeReportTableBody");
  const tfoot = document.getElementById("feeReportFooter");
  tbody.innerHTML = `<tr><td colspan="7" class="text-center">Generating report...</td></tr>`;
  tfoot.classList.add("d-none");

  try {
    const q = query(
      collection(db, "feeCollections"), 
      where("institutionId", "==", currentInstitutionId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    
    let html = "";
    let total = 0;

    snap.forEach(d => {
      const data = d.data();
      if (data.timestamp) {
        const docDate = data.timestamp.toDate();
        if (docDate >= fromDate && docDate <= toDate) {
          total += Number(data.amount);
          html += `
            <tr>
              <td>${docDate.toLocaleDateString()}</td>
              <td>#${data.receiptNo} ${data.manualReceiptNo ? `<br><small class="text-muted">(${data.manualReceiptNo})</small>` : ''}</td>
              <td><b>${data.studentName}</b><br><small class="text-muted">Reg: ${data.regNo}</small></td>
              <td>${data.class}</td>
              <td>${data.feeType}</td>
              <td class="fw-bold text-success">₹${data.amount}</td>
              <td>${data.collectedByName || 'Admin'}</td>
            </tr>
          `;
        }
      }
    });

    if (html === "") {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No collections found for the selected dates.</td></tr>`;
    } else {
      tbody.innerHTML = html;
      document.getElementById("feeReportTotal").innerText = `₹${total}`;
      tfoot.classList.remove("d-none");
    }
  } catch (err) {
    showToast("Error generating report: " + err.message, "error");
  }
};

window.saveFeeSettings = async () => {
  const perm = document.querySelector('input[name="feePermission"]:checked').value;
  const reqManual = document.getElementById("reqManualReceipt").checked;

  try {
    await setDoc(doc(db, "settings", currentInstitutionId), {
      feePermission: perm,
      reqManualReceipt: reqManual,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    sysFeePermission = perm;
    sysReqManualReceipt = reqManual;
    
    showToast("Fee settings saved successfully!", "success");
  } catch (err) { showToast("Error: " + err.message, "error"); }
};

// ==========================================
// ATTENDANCE MODULE
// ==========================================

window.resetAttendanceButton = () => {
  const btn = document.getElementById("btnSaveAttendance");
  if (btn) {
    btn.disabled = false;
    btn.className = "btn btn-primary-custom px-4 mt-2";
    btn.innerHTML = `<i class="fa-solid fa-check-double me-1"></i> Save Attendance`;
  }
};

window.loadAttendanceSheet = async () => {
  window.resetAttendanceButton();
  const selClass = document.getElementById("attClassSelect").value;
  if (!selClass) { document.getElementById("attendanceSheetArea").classList.add("d-none"); return; }

  const area = document.getElementById("attendanceSheetArea");
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = `<tr><td colspan="3" class="text-center">Loading students...</td></tr>`;
  area.classList.remove("d-none");

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()), where("status", "==", "active"));
  const snap = await getDocs(q);

  let students = [];
  snap.forEach(d => students.push({ id: d.id, ...d.data() }));
  students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  let html = "";
  students.forEach(s => {
    html += `
      <tr data-sid="${s.id}">
        <td style="white-space: nowrap;"><b>${s.regNo || '-'}</b></td>
        <td><b>${s.name}</b></td>
        <td class="text-center">
          <input type="checkbox" class="form-check-input form-check-input-lg att-checkbox" id="att_${s.id}" checked onchange="updateAttendanceCount()">
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html || `<tr><td colspan="3" class="text-center">No active students in this class.</td></tr>`;
  document.getElementById("selectAllAtt").checked = true;
  updateAttendanceCount();
};

window.toggleSelectAllAttendance = () => {
  const isChecked = document.getElementById("selectAllAtt").checked;
  document.querySelectorAll(".att-checkbox").forEach(cb => cb.checked = isChecked);
  updateAttendanceCount();
};

window.updateAttendanceCount = () => {
  const total = document.querySelectorAll(".att-checkbox").length;
  const present = document.querySelectorAll(".att-checkbox:checked").length;
  document.getElementById("attCountInfo").innerText = `Total: ${total} | Present: ${present} | Absent: ${total - present}`;
  resetAttendanceButton();
};

window.saveClassAttendance = async () => {
  const date = document.getElementById("attDate").value;
  const selClass = document.getElementById("attClassSelect").value;
  if (!date || !selClass) return alert("Select date and class.");

  const btn = document.getElementById("btnSaveAttendance");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving...`;
  }

  const rows = document.querySelectorAll("#attendanceTableBody tr[data-sid]");
  const records = {};
  rows.forEach(r => {
    const sid = r.getAttribute("data-sid");
    const isPresent = r.querySelector(".att-checkbox").checked;
    records[sid] = isPresent ? "P" : "A";
  });

  try {
    await addDoc(collection(db, "attendance"), {
      institutionId: currentInstitutionId,
      date: date,
      class: selClass.replace(/Class\s*/i, "").trim(),
      records: records,
      recordedBy: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    
    if (btn) {
      btn.className = "btn btn-secondary px-4 mt-2"; 
      btn.innerHTML = `<i class="fa-solid fa-check me-1"></i> Saved Successfully`;
    }
    showToast("Attendance recorded successfully!", "success");
  } catch (err) { 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-check-double me-1"></i> Save Attendance`;
    }
    showToast("Error: " + err.message, "error"); 
  }
};

// ==========================================
// PERFORMANCE TASKS
// ==========================================

window.resetPerfButton = () => {
  const btn = document.getElementById("btnSavePerf");
  if (btn) {
    btn.disabled = false;
    btn.className = "btn btn-primary-custom px-4 mt-2";
    btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Points`;
  }
};

window.loadStudentsForPerfSheet = async () => {
  window.resetPerfButton();
  const selClass = document.getElementById("perfClassSelect").value;
  if (!selClass) { document.getElementById("perfSheetArea").classList.add("d-none"); return; }

  const area = document.getElementById("perfSheetArea");
  const tbody = document.getElementById("perfTableBody");
  tbody.innerHTML = `<tr><td colspan="3" class="text-center">Loading students...</td></tr>`;
  area.classList.remove("d-none");

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()), where("status", "==", "active"));
  const snap = await getDocs(q);

  localPerfStudentsCache = [];
  snap.forEach(d => localPerfStudentsCache.push({ id: d.id, ...d.data() }));
  localPerfStudentsCache.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  renderPerfStudentsTable(localPerfStudentsCache);
};

function renderPerfStudentsTable(students) {
  const tbody = document.getElementById("perfTableBody");
  let html = "";
  students.forEach(s => {
    html += `
      <tr data-sid="${s.id}" data-reg="${s.regNo}" data-name="${s.name}" data-class="${s.currentClass}">
        <td style="white-space: nowrap;"><b>${s.regNo || '-'}</b></td>
        <td><b>${s.name}</b></td>
        <td class="text-center">
          <input type="checkbox" class="form-check-input form-check-input-lg perf-checkbox" id="perf_${s.id}" checked>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html || `<tr><td colspan="3" class="text-center">No students in this class.</td></tr>`;
  const selectAll = document.getElementById("selectAllPerf");
  if (selectAll) selectAll.checked = true;
}

window.toggleSelectAllPerf = () => {
  const isChecked = document.getElementById("selectAllPerf").checked;
  document.querySelectorAll(".perf-checkbox").forEach(cb => cb.checked = isChecked);
};

window.filterPerfStudents = () => {
  const term = document.getElementById("perfStudentSearch").value.toLowerCase();
  const filtered = localPerfStudentsCache.filter(s => 
    (s.name && s.name.toLowerCase().includes(term)) || 
    (s.regNo && s.regNo.toString().includes(term))
  );
  renderPerfStudentsTable(filtered);
};

window.saveBulkPerformancePoints = async () => {
  const taskRaw = document.getElementById("perfTaskSelect").value;
  const [taskTitle, pointsStr] = taskRaw.split('|');
  const points = Number(pointsStr) || 10;
  const today = new Date().toLocaleDateString();

  const btn = document.getElementById("btnSavePerf");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving...`;
  }

  const checkedRows = document.querySelectorAll("#perfTableBody tr");
  const batch = writeBatch(db);
  let count = 0;

  checkedRows.forEach(r => {
    const cb = r.querySelector(".perf-checkbox");
    if (cb && cb.checked) {
      const sid = r.getAttribute("data-sid");
      const reg = r.getAttribute("data-reg");
      const name = r.getAttribute("data-name");
      const sClass = r.getAttribute("data-class");

      const pRef = doc(collection(db, "performancePoints"));
      batch.set(pRef, {
        institutionId: currentInstitutionId,
        studentId: sid,
        regNo: Number(reg),
        studentName: name,
        class: sClass,
        task: taskTitle,
        points: points,
        date: today,
        timestamp: serverTimestamp()
      });
      count++;
    }
  });

  if (!count) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Points`;
    }
    return showToast("Please select at least one student.", "warning");
  }

  try {
    await batch.commit();
    if (btn) {
      btn.className = "btn btn-secondary px-4 mt-2"; 
      btn.innerHTML = `<i class="fa-solid fa-check me-1"></i> Saved Successfully`;
    }
    showToast(`Awarded '${taskTitle}' points to ${count} students.`, "success");
    
    document.getElementById("perfSheetArea").classList.add("d-none");
    document.getElementById("perfTableBody").innerHTML = "";
    document.getElementById("perfClassSelect").value = "";
    const searchInput = document.getElementById("perfStudentSearch");
    if (searchInput) searchInput.value = "";
    
    loadLeaderboard();
  } catch (err) { 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Points`;
    }
    showToast("Error: " + err.message, "error"); 
  }
};

window.addNewCustomTask = (e) => {
  e.preventDefault();
  const name = document.getElementById("newTaskName").value.trim().toUpperCase();
  const pts = document.getElementById("newTaskPoints").value.trim();
  const sign = Number(pts) > 0 ? `+${pts}` : pts;
  const formattedValue = `${name} (${sign} Pts)|${pts}`;

  const select = document.getElementById("perfTaskSelect");
  const newOption = new Option(`${name} (${sign} Pts)`, formattedValue, true, true);
  select.add(newOption, 0);

  bootstrap.Modal.getInstance(document.getElementById('customTaskModal')).hide();
  e.target.reset();
  showToast("New task added.", "success");
};

async function loadLeaderboard() {
  const q = query(collection(db, "performancePoints"), where("institutionId", "==", currentInstitutionId));
  const snap = await getDocs(q);

  const totals = {};
  snap.forEach(d => {
    const p = d.data();
    if (!totals[p.regNo]) totals[p.regNo] = { name: p.studentName, class: p.class, points: 0 };
    totals[p.regNo].points += (Number(p.points) || 0);
  });

  const sorted = Object.values(totals).sort((a, b) => b.points - a.points);

  if (sorted.length > 0) {
    document.getElementById("starTodayName").innerText = sorted[0].name;
    document.getElementById("starTodayClass").innerText = `Class ${sorted[0].class} (${sorted[0].points} Pts)`;
  }
  if (sorted.length > 1) {
    document.getElementById("starWeekName").innerText = sorted[1].name;
    document.getElementById("starWeekClass").innerText = `Class ${sorted[1].class} (${sorted[1].points} Pts)`;
  } else if (sorted.length === 1) {
    document.getElementById("starWeekName").innerText = sorted[0].name;
    document.getElementById("starWeekClass").innerText = `Class ${sorted[0].class} (${sorted[0].points} Pts)`;
  }
  if (sorted.length > 0) {
    document.getElementById("starMonthName").innerText = sorted[0].name;
    document.getElementById("starMonthClass").innerText = `Class ${sorted[0].class} (${sorted[0].points} Pts)`;
  }
}

// ==========================================
// STUDENT PROFILE / STATUS UPDATE
// ==========================================

window.openStudentProfileModal = (docId) => {
  document.getElementById("studentProfileForm").reset();

  if (docId) {
    const s = localStudentsCache.find(x => x.id === docId);
    if (!s) return;

    document.getElementById("stuModalTitle").innerText = `Edit Student: ${s.name}`;
    document.getElementById("stuDocId").value = docId;

    document.getElementById("stuRegNo").value = s.regNo || '';
    document.getElementById("stuIdNo").value = s.idNo || '';
    document.getElementById("stuAadhaar").value = s.aadhaar || '';
    document.getElementById("stuName").value = s.name || '';
    document.getElementById("stuGender").value = s.gender || 'Male';
    document.getElementById("stuDob").value = s.dob || '';
    document.getElementById("stuBlood").value = s.bloodGroup || '';

    document.getElementById("stuCurrentClass").value = (s.currentClass || '1').replace(/Class\s*/i, "").trim();
    document.getElementById("stuJoinedClass").value = s.joinedClass || '';
    document.getElementById("stuDoj").value = s.joinedDate || '';
    document.getElementById("stuPresence").value = s.presence || '';
    document.getElementById("stuMonthlyFee").value = s.monthlyFeeAmount || '';

    document.getElementById("stuFatherName").value = s.fatherName || '';
    document.getElementById("stuMotherName").value = s.motherName || '';
    document.getElementById("stuGuardianName").value = s.guardianName || '';
    document.getElementById("stuRelation").value = s.relation || '';
    document.getElementById("stuGuardianJob").value = s.guardianOccupation || '';
    document.getElementById("stuPhone").value = s.phone || '';
    document.getElementById("stuEmergency").value = s.emergencyPhone || '';

    document.getElementById("stuHouse").value = s.houseName || s.address || '';
    document.getElementById("stuPlace").value = s.place || '';
    document.getElementById("stuPo").value = s.postOffice || '';
    document.getElementById("stuPin").value = s.pincode || '';
    document.getElementById("stuDistrict").value = s.district || '';
    document.getElementById("stuState").value = s.state || 'KERALA';

    document.getElementById("stuTransTo").value = s.transferredTo || '';
    document.getElementById("stuReason").value = s.reasonLeaving || '';
    document.getElementById("stuDol").value = s.dateOfLeaving || '';
    document.getElementById("stuTcIssued").value = s.tcIssued || 'No';
    document.getElementById("stuTcDetails").value = s.tcDetails || '';

    document.getElementById("stuMarks").value = s.identificationMarks || '';
    document.getElementById("stuSpecialInfo").value = s.specialInfo || '';

  } else {
    document.getElementById("stuModalTitle").innerText = "New Student Admission";
    document.getElementById("stuDocId").value = "";
  }

  const triggerEl = document.querySelector('#studentTabs button[data-bs-target="#tab-stu-personal"]');
  bootstrap.Tab.getOrCreateInstance(triggerEl).show();
  new bootstrap.Modal(document.getElementById('studentProfileModal')).show();
};

window.saveStudentProfile = async (e) => {
  if (e) e.preventDefault(); 
  
  const regNoInput = document.getElementById("stuRegNo").value;
  const nameInput = document.getElementById("stuName").value.trim();
  
  if (!regNoInput || !nameInput) {
    showToast("Registration Number and Student Name are required!", "warning");
    const triggerEl = document.querySelector('#studentTabs button[data-bs-target="#tab-stu-personal"]');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();
    return;
  }

  const docId = document.getElementById("stuDocId").value;
  const dateOfLeaving = document.getElementById("stuDol").value;
  const tcIssued = document.getElementById("stuTcIssued").value;
  
  let currentStatus = "active";
  if (tcIssued === "Yes" || dateOfLeaving) {
    currentStatus = "transferred";
  }

  const studentData = {
    institutionId: currentInstitutionId,
    regNo: Number(regNoInput) || 0,
    idNo: document.getElementById("stuIdNo").value.trim().toUpperCase(),
    aadhaar: document.getElementById("stuAadhaar").value.trim(),
    name: nameInput.toUpperCase(),
    gender: document.getElementById("stuGender").value,
    dob: document.getElementById("stuDob").value,
    bloodGroup: document.getElementById("stuBlood").value,

    currentClass: (document.getElementById("stuCurrentClass").value || "1").replace(/Class\s*/i, "").trim(),
    joinedClass: document.getElementById("stuJoinedClass").value.trim().toUpperCase(),
    joinedDate: document.getElementById("stuDoj").value,
    presence: document.getElementById("stuPresence").value.trim().toUpperCase(),
    monthlyFeeAmount: Number(document.getElementById("stuMonthlyFee").value) || 0,

    fatherName: document.getElementById("stuFatherName").value.trim().toUpperCase(),
    motherName: document.getElementById("stuMotherName").value.trim().toUpperCase(),
    guardianName: document.getElementById("stuGuardianName").value.trim().toUpperCase(),
    relation: document.getElementById("stuRelation").value.trim().toUpperCase(),
    guardianOccupation: document.getElementById("stuGuardianJob").value.trim().toUpperCase(),
    phone: document.getElementById("stuPhone").value.trim(),
    emergencyPhone: document.getElementById("stuEmergency").value.trim(),

    houseName: document.getElementById("stuHouse").value.trim().toUpperCase(),
    place: document.getElementById("stuPlace").value.trim().toUpperCase(),
    postOffice: document.getElementById("stuPo").value.trim().toUpperCase(),
    pincode: document.getElementById("stuPin").value.trim(),
    district: document.getElementById("stuDistrict").value.trim().toUpperCase(),
    state: document.getElementById("stuState").value.trim().toUpperCase(),

    transferredTo: document.getElementById("stuTransTo").value.trim().toUpperCase(),
    reasonLeaving: document.getElementById("stuReason").value.trim().toUpperCase(),
    dateOfLeaving: dateOfLeaving,
    tcIssued: tcIssued,
    tcDetails: document.getElementById("stuTcDetails").value.trim().toUpperCase(),

    identificationMarks: document.getElementById("stuMarks").value.trim().toUpperCase(),
    specialInfo: document.getElementById("stuSpecialInfo").value.trim().toUpperCase(),
    
    status: currentStatus
  };

  try {
    if (docId) {
      studentData.updatedAt = serverTimestamp();
      await updateDoc(doc(db, "students", docId), studentData);
      showToast("Student details updated successfully.", "success");
    } else {
      studentData.createdAt = serverTimestamp();
      await addDoc(collection(db, "students"), studentData);
      showToast("New student admitted successfully.", "success");
    }
    
    bootstrap.Modal.getInstance(document.getElementById('studentProfileModal')).hide();
    loadStudentsByClass(true);
  } catch (err) { showToast("Error: " + err.message, "error"); }
};

window.deleteStudent = async (docId, name) => {
  if (confirm(`Are you sure you want to delete ${name}?`)) {
    try {
      await deleteDoc(doc(db, "students", docId));
      showToast("Student removed.", "success");
      loadStudentsByClass(true);
    } catch (err) { showToast("Error: " + err.message); }
  }
};

window.loadStudentsByClass = async (forceRefresh = false) => {
  let selectedClass = document.getElementById("filterClassSelect").value;
  if (currentUserRole !== "principal" && currentUserRole !== "admin" && !isSuperAdmin && (!selectedClass || selectedClass === "ALL")) {
    selectedClass = currentUserAssignedClasses[0] || "1";
    document.getElementById("filterClassSelect").value = selectedClass;
  }

  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading data...</td></tr>`;

  let q;
  if (selectedClass === "ALL" && (currentUserRole === "principal" || currentUserRole === "admin" || isSuperAdmin)) {
    q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId));
  } else {
    q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selectedClass.replace(/Class\s*/i, "").trim()));
  }

  const snap = await getDocs(q);
  localStudentsCache = [];
  snap.forEach(d => localStudentsCache.push({ id: d.id, ...d.data() }));

  localStudentsCache.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));
  currentPage = 1;
  renderPaginatedTable();
};

function renderPaginatedTable() {
  const tbody = document.getElementById("studentsTableBody");
  const total = localStudentsCache.length;

  if (!total) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No student records found.</td></tr>`;
    document.getElementById("paginationInfo").innerText = `Showing 0-0 of 0`;
    document.getElementById("paginationControls").innerHTML = "";
    return;
  }

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageData = localStudentsCache.slice(startIndex, endIndex);

  let html = "";
  pageData.forEach(s => {
    const cleanClass = (s.currentClass || '-').replace(/Class\s*/i, "").trim();
    const actionCol = (currentUserRole === "principal" || currentUserRole === "admin" || isSuperAdmin) ? `
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openStudentProfileModal('${s.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s.id}', '${s.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </td>` : ``;

    let statusBadge = s.status === 'active' ? '' : `<span class="badge bg-secondary ms-1">${s.status}</span>`;

    html += `
      <tr>
        <td><b class="text-success">${s.regNo || '-'}</b></td>
        <td><b>${s.name || '-'}</b> ${statusBadge}</td>
        <td><span class="badge bg-success">Class ${cleanClass}</span></td>
        <td>${s.fatherName || s.guardianName || '-'}</td>
        <td>${s.place || '-'}</td>
        <td>${s.phone || '-'}</td>
        ${actionCol}
      </tr>
    `;
  });
  tbody.innerHTML = html;
  document.getElementById("paginationInfo").innerText = `Showing ${startIndex + 1}-${endIndex} of ${total} students`;
  renderPaginationControls(Math.ceil(total / pageSize));
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById("paginationControls");
  let html = "";
  if (totalPages <= 1) { container.innerHTML = ""; return; }
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
  }
  container.innerHTML = html;
}

window.changePage = (page) => {
  currentPage = page;
  renderPaginatedTable();
};

window.filterStudentsLocal = () => {
  const term = document.getElementById("searchBox").value.toLowerCase();
  const filtered = localStudentsCache.filter(s => 
    (s.name && s.name.toLowerCase().includes(term)) || 
    (s.regNo && s.regNo.toString().includes(term)) ||
    (s.place && s.place.toLowerCase().includes(term))
  );
  const tbody = document.getElementById("studentsTableBody");
  let html = "";
  filtered.slice(0, 50).forEach(s => {
    const cleanClass = (s.currentClass || '-').replace(/Class\s*/i, "").trim();
    const actionCol = (currentUserRole === "principal" || currentUserRole === "admin" || isSuperAdmin) ? `
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openStudentProfileModal('${s.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s.id}', '${s.name}')"><i class="fa-solid fa-trash"></i></button>
      </td>` : ``;

    html += `
      <tr>
        <td><b class="text-success">${s.regNo || '-'}</b></td>
        <td><b>${s.name || '-'}</b></td>
        <td><span class="badge bg-success">Class ${cleanClass}</span></td>
        <td>${s.fatherName || s.guardianName || '-'}</td>
        <td>${s.place || '-'}</td>
        <td>${s.phone || '-'}</td>
        ${actionCol}
      </tr>
    `;
  });
  tbody.innerHTML = html || `<tr><td colspan="7" class="text-center text-muted">No matching results found.</td></tr>`;
};

// ==========================================
// STAFF MANAGEMENT WITH MADRASA DESIGNATIONS
// ==========================================

window.loadPrincipalsList = async () => {
  const tbody = document.getElementById("principalsTableBody");
  const pendingTbody = document.getElementById("instPendingStaffTableBody");
  const pendingSection = document.getElementById("instPendingStaffSection");

  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading...</td></tr>`;
  if (pendingTbody) pendingTbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading...</td></tr>`;

  const qActive = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId), where("status", "==", "active"));
  const snapActive = await getDocs(qActive);

  localPrincipalsCache = [];
  snapActive.forEach(d => {
    if (d.data().role !== 'admin') {
      localPrincipalsCache.push({ id: d.id, ...d.data() });
    }
  });

  let htmlActive = "";
  localPrincipalsCache.forEach(p => {
    const roleBadge = `<span class="badge bg-success">${p.designation || p.role}</span>`;
    htmlActive += `
      <tr>
        <td><b>${p.name}</b></td>
        <td>${roleBadge}</td>
        <td>${p.email}</td>
        <td>${p.phone}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-primary me-1" onclick="openStaffProfileModal('${p.id}')" title="Edit Profile"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${p.id}', '${p.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = htmlActive || `<tr><td colspan="5" class="text-center text-muted">No staff assigned yet.</td></tr>`;

  const qPending = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId), where("status", "==", "pending"));
  const snapPending = await getDocs(qPending);

  pendingStaffCache = [];
  snapPending.forEach(d => {
    if (d.data().role !== 'admin') {
      pendingStaffCache.push({ id: d.id, ...d.data() });
    }
  });

  if (pendingStaffCache.length > 0 && pendingSection && pendingTbody) {
    pendingSection.classList.remove("d-none");
    let htmlPending = "";
    pendingStaffCache.forEach((t) => {
      htmlPending += `
        <tr>
          <td><b>${t.name}</b></td>
          <td><span class="badge bg-warning text-dark">${t.designation || t.role}</span></td>
          <td>${t.email}</td>
          <td>${t.phone}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-success me-1" onclick="openInstAssignClassesForm('${t.id}')" title="Approve"><i class="fa-solid fa-check"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteUser('${t.id}', '${t.name}')" title="Reject"><i class="fa-solid fa-xmark"></i></button>
          </td>
        </tr>
      `;
    });
    pendingTbody.innerHTML = htmlPending;
  } else if (pendingSection) {
    pendingSection.classList.add("d-none");
  }
};

window.openStaffProfileModal = (docId) => {
  document.getElementById("staffProfileForm").reset();
  const authSec = document.getElementById("spAuthSection");

  if (docId) {
    const p = localPrincipalsCache.find(x => x.id === docId);
    if (!p) return;

    document.getElementById("staffModalTitle").innerText = `Edit Staff Profile: ${p.name}`;
    document.getElementById("spDocId").value = docId;
    if (authSec) authSec.classList.add("d-none");

    document.getElementById("spName").value = p.name || '';
    document.getElementById("spGender").value = p.gender || 'Male';
    document.getElementById("spDob").value = p.dob || '';
    document.getElementById("spBlood").value = p.bloodGroup || '';
    document.getElementById("spGuardian").value = p.guardianName || '';
    document.getElementById("spMarital").value = p.maritalStatus || 'Single';
    document.getElementById("spAadhaar").value = p.aadhaar || '';

    document.getElementById("spPhone").value = p.phone || '';
    document.getElementById("spWhatsapp").value = p.whatsapp || '';
    document.getElementById("spEmergency").value = p.emergencyPhone || '';
    document.getElementById("spHouse").value = p.houseName || '';
    document.getElementById("spPo").value = p.postOffice || '';
    document.getElementById("spPin").value = p.pincode || '';
    document.getElementById("spDistrict").value = p.district || '';
    document.getElementById("spState").value = p.state || 'KERALA';

    document.getElementById("spRelEdu").value = p.relEdu || '';
    document.getElementById("spGenEdu").value = p.genEdu || '';
    document.getElementById("spLanguages").value = p.languages || '';
    document.getElementById("spSkills").value = p.skills || '';
    document.getElementById("spAwards").value = p.awards || '';

    document.getElementById("spRole").value = p.role || 'teacher';
    
    // Designation mapping
    const desigSelect = document.getElementById("spDesignationSelect");
    const desigCustom = document.getElementById("spDesignationCustom");
    if (["സദർ മുഅല്ലിം", "വൈസ് സദർ", "സദർ ഇൻ-ചാർജ്", "മുഅല്ലിം"].includes(p.designation)) {
      desigSelect.value = p.designation;
      desigCustom.classList.add("d-none");
    } else if (p.designation) {
      desigSelect.value = "Other";
      desigCustom.classList.remove("d-none");
      desigCustom.value = p.designation;
    } else {
      desigSelect.value = "മുഅല്ലിം";
      desigCustom.classList.add("d-none");
    }

    document.getElementById("spMsr").value = p.msrNo || '';
    document.getElementById("spEmpType").value = p.employmentType || 'Full Time';
    document.getElementById("spExp").value = p.experience || '';
    document.getElementById("spDoj").value = p.doj || '';

    const assigned = p.assignedClasses || [];
    document.querySelectorAll(".sp-class-cb").forEach(cb => {
      cb.checked = assigned.includes(cb.value);
    });

    document.getElementById("spAccName").value = p.accName || '';
    document.getElementById("spAccNo").value = p.accNo || '';
    document.getElementById("spIfsc").value = p.ifsc || '';
    document.getElementById("spBank").value = p.bankName || '';
    document.getElementById("spBranch").value = p.branch || '';

    document.getElementById("spTransFrom").value = p.transFrom || '';
    document.getElementById("spTransTo").value = p.transTo || '';
    document.getElementById("spDol").value = p.dol || '';
    document.getElementById("spReason").value = p.reasonLeaving || '';

  } else {
    document.getElementById("staffModalTitle").innerText = "Add New Staff Profile";
    document.getElementById("spDocId").value = "";
    if (authSec) authSec.classList.remove("d-none");
    document.querySelectorAll(".sp-class-cb").forEach(cb => cb.checked = false);
  }

  const triggerEl = document.querySelector('#staffTabs button[data-bs-target="#tab-personal"]');
  bootstrap.Tab.getOrCreateInstance(triggerEl).show();
  new bootstrap.Modal(document.getElementById('staffProfileModal')).show();
};

window.saveStaffProfile = async (e) => {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("spName").value.trim();
  const phoneInput = document.getElementById("spPhone").value.trim();

  if (!nameInput || !phoneInput) {
    showToast("Name and Phone number are required!", "warning");
    const triggerEl = document.querySelector('#staffTabs button[data-bs-target="#tab-personal"]');
    bootstrap.Tab.getOrCreateInstance(triggerEl).show();
    return;
  }

  const docId = document.getElementById("spDocId").value;
  const role = document.getElementById("spRole").value;
  
  const desigSelect = document.getElementById("spDesignationSelect").value;
  const designation = desigSelect === "Other" 
    ? (document.getElementById("spDesignationCustom").value.trim().toUpperCase() || "മുഅല്ലിം")
    : desigSelect;

  const assignedClasses = [];
  document.querySelectorAll(".sp-class-cb:checked").forEach(cb => assignedClasses.push(cb.value));

  const staffData = {
    institutionId: currentInstitutionId,
    institutionName: document.getElementById("displayMadrassaName").innerText,
    name: nameInput.toUpperCase(),
    gender: document.getElementById("spGender").value,
    dob: document.getElementById("spDob").value,
    bloodGroup: document.getElementById("spBlood").value,
    guardianName: document.getElementById("spGuardian").value.trim().toUpperCase(),
    maritalStatus: document.getElementById("spMarital").value,
    aadhaar: document.getElementById("spAadhaar").value.trim(),

    phone: phoneInput,
    whatsapp: document.getElementById("spWhatsapp").value.trim() || phoneInput,
    emergencyPhone: document.getElementById("spEmergency").value.trim(),
    houseName: document.getElementById("spHouse").value.trim().toUpperCase(),
    postOffice: document.getElementById("spPo").value.trim().toUpperCase(),
    pincode: document.getElementById("spPin").value.trim(),
    district: document.getElementById("spDistrict").value.trim().toUpperCase(),
    state: document.getElementById("spState").value.trim().toUpperCase(),

    relEdu: document.getElementById("spRelEdu").value.trim().toUpperCase(),
    genEdu: document.getElementById("spGenEdu").value.trim().toUpperCase(),
    languages: document.getElementById("spLanguages").value.trim().toUpperCase(),
    skills: document.getElementById("spSkills").value.trim().toUpperCase(),
    awards: document.getElementById("spAwards").value.trim().toUpperCase(),

    role: role,
    designation: designation,
    msrNo: document.getElementById("spMsr").value.trim().toUpperCase(),
    employmentType: document.getElementById("spEmpType").value,
    experience: Number(document.getElementById("spExp").value) || 0,
    doj: document.getElementById("spDoj").value,
    assignedClasses: role === 'principal' ? ["1","2","3","4","5","6","7","8","9","10","11","12"] : assignedClasses,

    accName: document.getElementById("spAccName").value.trim().toUpperCase(),
    accNo: document.getElementById("spAccNo").value.trim(),
    ifsc: document.getElementById("spIfsc").value.trim().toUpperCase(),
    bankName: document.getElementById("spBank").value.trim().toUpperCase(),
    branch: document.getElementById("spBranch").value.trim().toUpperCase(),

    transFrom: document.getElementById("spTransFrom").value.trim().toUpperCase(),
    transTo: document.getElementById("spTransTo").value.trim().toUpperCase(),
    dol: document.getElementById("spDol").value,
    reasonLeaving: document.getElementById("spReason").value.trim().toUpperCase(),

    status: "active"
  };

  try {
    if (docId) {
      staffData.updatedAt = serverTimestamp();
      await updateDoc(doc(db, "users", docId), staffData);
      showToast("Staff profile updated successfully.", "success");
    } else {
      const email = document.getElementById("spAuthEmail").value.trim().toLowerCase();
      const pwd = document.getElementById("spAuthPassword").value;

      if (!email || !pwd) {
        return showToast("Please provide Email and Password for new staff account setup.", "warning");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      staffData.uid = cred.user.uid;
      staffData.email = email;
      staffData.createdAt = serverTimestamp();

      await setDoc(doc(db, "users", cred.user.uid), staffData);
      showToast("New staff registered and profile created successfully.", "success");
    }

    bootstrap.Modal.getInstance(document.getElementById('staffProfileModal')).hide();
    loadPrincipalsList();
  } catch (err) {
    showToast("Error saving profile: " + err.message, "error");
  }
};

window.deleteUser = async (docId, name) => {
  if (confirm(`Are you sure you want to remove ${name}?`)) {
    try {
      await deleteDoc(doc(db, "users", docId));
      showToast("User removed.", "success");
      loadPrincipalsList();
    } catch (err) { showToast("Error: " + err.message, "error"); }
  }
};

window.openInstAssignClassesForm = (staffId) => {
  const staff = pendingStaffCache.find(s => s.id === staffId);
  if (staff) {
    if (staff.role === 'principal') {
      if (confirm(`Approve ${staff.name} as Principal (സദർ മുഅല്ലിം)?`)) {
        updateDoc(doc(db, "users", staffId), { 
          status: "active",
          assignedClasses: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
        }).then(() => {
          showToast("Principal approved successfully!", "success");
          window.loadPrincipalsList();
        }).catch(err => showToast("Error: " + err.message, "error"));
      }
      return;
    }

    const formEl = document.getElementById("instAssignClassesForm");
    const idEl = document.getElementById("instAssignStaffId");
    const nameEl = document.getElementById("instAssignStaffNameDisplay");
    const roleEl = document.getElementById("instAssignStaffRole");

    if (idEl) idEl.value = staffId;
    if (nameEl) nameEl.innerText = staff.name;
    if (roleEl) roleEl.value = staff.role;

    if (formEl) {
      formEl.classList.remove("d-none");
      document.querySelectorAll('.inst-approve-class-cb').forEach(cb => cb.checked = false);
    }
  }
};

window.instAssignClassesToStaff = async (e) => {
  e.preventDefault();
  const staffId = document.getElementById("instAssignStaffId")?.value;
  const role = document.getElementById("instAssignStaffRole")?.value || 'teacher';
  
  let assignedClasses = [];

  if (role === 'teacher') {
    const checkboxes = document.querySelectorAll('.inst-approve-class-cb:checked');
    assignedClasses = Array.from(checkboxes).map(cb => cb.value);
    if (assignedClasses.length === 0) return showToast("Please select at least one class.", "warning");
  } else if (role === 'principal') {
    assignedClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  }

  try {
    await updateDoc(doc(db, "users", staffId), { 
      status: "active",
      assignedClasses: assignedClasses
    });
    
    showToast("Staff approved successfully!", "success");
    const formEl = document.getElementById("instAssignClassesForm");
    if (formEl) formEl.classList.add("d-none");
    loadPrincipalsList(); 
  } catch (err) { showToast("Error: " + err.message, "error"); }
};

// ==========================================
// BULK CSV & CLASS PROMOTION
// ==========================================

window.downloadCSVFormat = () => {
  const headers = "REG NO.,ID NO.,AADHAAR NUMBER,STUDENT NAME,GENDER,D.O.B,BLOOD GROUP,CURRENT CLASS,JOINED CLASS,JOINED DATE,PRESENCE,MONTHLY FEE,FATHER NAME,MOTHER NAME,GUARDIAN NAME,RELATION,GUARDIAN OCCUPATION,MOBILE NUMBER,EMERGENCY NUMBER,HOUSE NAME,PLACE,PO,PINCODE,DISTRICT,STATE,TRANSFERRED TO,REASON FOR LEAVING,DATE OF LEAVING,TC ISSUED,TC DETAILS,IDENTIFICATION MARKS,SPECIAL INFO\n";
  const sampleData = "101,A123,[Aadhaar Redacted],MUHAMMED,Male,2015-05-12,O+,1,1,2021-06-01,Regular,200,ABDULLA,FATHIMA,ABDULLA,Father,Business,9876543210,9876543211,HOUSE NAME,CALICUT,CALICUT PO,673001,KOZHIKODE,KERALA,,,,,,,,None,\n";
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sampleData);
  
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "student_bulk_import_format.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.handleBulkUpload = () => {
  const fileInput = document.getElementById("csvFileInput");
  const statusDiv = document.getElementById("bulkStatus");
  if (!fileInput.files.length) return showToast("Please select a CSV file.", "warning");

  statusDiv.classList.remove("d-none");
  statusDiv.className = "alert alert-info";
  statusDiv.innerText = "Analyzing file...";

  Papa.parse(fileInput.files[0], {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data;
      try {
        const batch = writeBatch(db);
        rows.forEach((row) => {
          const newStudentRef = doc(collection(db, "students"));
          const regNum = parseInt(row["REG NO."] || 0, 10);
          
          batch.set(newStudentRef, {
            institutionId: currentInstitutionId,
            regNo: isNaN(regNum) ? 0 : regNum,
            idNo: (row["ID NO."] || "").toUpperCase(),
            aadhaar: row["AADHAAR NUMBER"] || row["AADHAAR"] || "",
            name: (row["STUDENT NAME"] || row["NAME"] || "").toUpperCase(),
            gender: row["GENDER"] || "Male",
            dob: row["D.O.B"] || "",
            bloodGroup: row["BLOOD GROUP"] || "",
            
            currentClass: (row["CURRENT CLASS"] || "1").replace(/Class\s*/i, "").trim(),
            joinedClass: (row["JOINED CLASS"] || "").toUpperCase(),
            joinedDate: row["JOINED DATE"] || "",
            presence: (row["PRESENCE"] || "").toUpperCase(),
            monthlyFeeAmount: Number(row["MONTHLY FEE"]) || 0,

            fatherName: (row["FATHER NAME"] || "").toUpperCase(),
            motherName: (row["MOTHER NAME"] || "").toUpperCase(),
            guardianName: (row["GUARDIAN NAME"] || "").toUpperCase(),
            relation: (row["RELATION"] || "").toUpperCase(),
            guardianOccupation: (row["GUARDIAN OCCUPATION"] || "").toUpperCase(),
            phone: row["MOBILE NUMBER"] || row["MOBILE NO"] || row["PHONE"] || "",
            emergencyPhone: row["EMERGENCY NUMBER"] || row["EMERGENCY NO"] || "",

            houseName: (row["HOUSE NAME"] || row["ADDRESS"] || "").toUpperCase(),
            place: (row["PLACE"] || "").toUpperCase(),
            postOffice: (row["PO"] || "").toUpperCase(),
            pincode: row["PINCODE"] || "",
            district: (row["DISTRICT"] || "").toUpperCase(),
            state: (row["STATE"] || "KERALA").toUpperCase(),

            transferredTo: (row["TRANSFERRED TO"] || "").toUpperCase(),
            reasonLeaving: (row["REASON FOR LEAVING"] || "").toUpperCase(),
            dateOfLeaving: row["DATE OF LEAVING"] || "",
            tcIssued: row["TC ISSUED"] || row["TC ISSUED(Yes/No)"] || "No",
            tcDetails: (row["TC DETAILS"] || "").toUpperCase(),

            identificationMarks: (row["IDENTIFICATION MARKS"] || "").toUpperCase(),
            specialInfo: (row["SPECIAL INFO"] || "").toUpperCase(),
            
            status: "active",
            createdAt: serverTimestamp()
          });
        });

        await batch.commit();
        statusDiv.className = "alert alert-success";
        statusDiv.innerText = `Successfully imported ${rows.length} students!`;
        
        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('bulkImportModal')).hide();
          loadStudentsByClass(true);
          fileInput.value = "";
          statusDiv.classList.add("d-none");
        }, 1500);

      } catch (err) {
        statusDiv.className = "alert alert-danger";
        statusDiv.innerText = "Error: " + err.message;
        showToast("Error importing data", "error");
      }
    }
  });
};

window.promoteStudents = async () => {
  const from = document.getElementById("fromClass").value;
  const to = document.getElementById("toClass").value;
  if (confirm(`Promote all active students from Class ${from} to Class ${to}?`)) {
    const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", from), where("status", "==", "active"));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach(d => batch.update(doc(db, "students", d.id), { currentClass: to }));
    await batch.commit();
    showToast(`Students promoted to Class ${to}.`, "success");
    loadStudentsByClass(true);
  }
};

// ==========================================
// UI NAVIGATION & TAB ROUTING
// ==========================================

window.showSignupForm = (type) => {
  document.getElementById("signupOptions").classList.add("d-none");
  if (type === 'madrasa') document.getElementById("signupForm").classList.remove("d-none");
  else document.getElementById("staffSignupForm").classList.remove("d-none");
};

window.switchAuthTab = (type) => {
  document.getElementById("loginForm").classList.add("d-none");
  document.getElementById("signupForm").classList.add("d-none");
  document.getElementById("staffSignupForm").classList.add("d-none");
  document.getElementById("signupOptions").classList.add("d-none");

  document.getElementById("tabBtnLogin").classList.remove("active");
  document.getElementById("tabBtnSignup").classList.remove("active");

  if (type === 'login') {
    document.getElementById("loginForm").classList.remove("d-none");
    document.getElementById("tabBtnLogin").classList.add("active");
  } else if (type === 'signup') {
    document.getElementById("signupOptions").classList.remove("d-none");
    document.getElementById("tabBtnSignup").classList.add("active");
  } 
};

window.showTab = (tabId) => {
  document.querySelectorAll(".content-tab").forEach(t => t.classList.add("d-none"));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove("d-none");

  document.querySelectorAll("#desktopTabMenu .nav-link, #mobileTabMenu .nav-link").forEach(b => b.classList.remove("active"));
  
  const activeBtns = document.querySelectorAll(`button[onclick="showTab('${tabId}')"]`);
  activeBtns.forEach(btn => btn.classList.add("active"));

  const offcanvasEl = document.getElementById('sidebarOffcanvas');
  const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
  if (offcanvasInstance) offcanvasInstance.hide();

  if (tabId === 'studentsListTab') loadStudentsByClass();
  if (tabId === 'instAdminTab') window.loadPrincipalsList();
  if (tabId === 'homeDashboardTab') loadLeaderboard();
  if (tabId === 'superAdminTab') window.loadSuperAdminRequests();
  if (tabId === 'subjectSettingsTab') window.loadClassSubjectSettings();
};
