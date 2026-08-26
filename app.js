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
    alert("Logout Error: " + error.message);
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
           if(userData.role === 'admin') alertMsg = "Your Madrasa registration is pending approval from the Super Admin. Please contact support.";
           else if(userData.role === 'principal') alertMsg = "Your Principal registration is pending approval from your Institution Admin.";
           else alertMsg = "Your Staff registration is pending approval from your Principal.";
           
          alert(alertMsg);
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

        if(!isSuperAdmin) {
            const instDoc = await getDoc(doc(db, "settings", currentInstitutionId));
            if(instDoc.exists()) {
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
              loadPrincipalsList(); 
              
              document.getElementById("reqManualReceipt").checked = sysReqManualReceipt;
              const rBtns = document.getElementsByName("feePermission");
              for(let i=0; i<rBtns.length; i++){
                  if(rBtns[i].value === sysFeePermission) rBtns[i].checked = true;
              }

          } else if (currentUserRole === "principal") {
            if (pMenuBtn) pMenuBtn.classList.remove("d-none");
            if (adminActions) adminActions.classList.remove("d-none");
            if (actionCol) actionCol.classList.remove("d-none");
            if (subjectSettingsBtn) subjectSettingsBtn.classList.remove("d-none");
            
            showTab('homeDashboardTab');
            loadLeaderboard();
            loadPrincipalsList();
          } else if (currentUserRole === "teacher") {
            showTab('homeDashboardTab');
            loadLeaderboard();
          }
        }

        document.getElementById("authSection").classList.add("d-none");
        document.getElementById("appSection").classList.remove("d-none");
        
        const attDateEl = document.getElementById("attDate");
        if (attDateEl) attDateEl.valueAsDate = new Date();

        if(!isSuperAdmin) populateClassDropdowns();
        syncMobileMenu();
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

function populateClassDropdowns() {
  const allClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const allowedClasses = (currentUserRole === "principal" || currentUserRole === "admin" || isSuperAdmin) ? allClasses : currentUserAssignedClasses;

  const filterSelect = document.getElementById("filterClassSelect");
  if (filterSelect) {
    filterSelect.innerHTML = "";
    if (currentUserRole === "principal" || currentUserRole === "admin" || isSuperAdmin) filterSelect.innerHTML += `<option value="ALL">All Classes</option>`;
    allowedClasses.forEach(c => filterSelect.innerHTML += `<option value="${c}">Class ${c}</option>`);
    if (currentUserRole !== "principal" && currentUserRole !== "admin" && !isSuperAdmin && allowedClasses.length === 1) filterSelect.value = allowedClasses[0];
  }

  const dropdowns = ["attClassSelect", "markClassSelect", "perfClassSelect", "feeClassSelect"];
  dropdowns.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = "";
      if (allowedClasses.length > 1 || currentUserRole === "principal" || currentUserRole === "admin" || isSuperAdmin) {
        select.innerHTML = `<option value="">-- Select Class --</option>`;
      }
      allowedClasses.forEach(c => select.innerHTML += `<option value="${c}">Class ${c}</option>`);

      if (currentUserRole !== "principal" && currentUserRole !== "admin" && !isSuperAdmin && allowedClasses.length === 1) {
        select.value = allowedClasses[0];
        if (id === "attClassSelect") loadAttendanceSheet();
        if (id === "markClassSelect") loadMarksEntrySheet();
        if (id === "perfClassSelect") loadStudentsForPerfSheet();
        if (id === "feeClassSelect") loadStudentsForFees();
      }
    }
  });
}

let parentStudentsData = [];
window.handleUnifiedLogin = async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim();

  if (/^\d+$/.test(identifier)) {
    const reg = Number(identifier);
    const mobile = document.getElementById("loginMobile").value.trim().slice(-10);

    if (!mobile) return alert("Please enter the registered mobile number.");

    const q = query(collection(db, "students"), where("regNo", "==", reg));
    const snap = await getDocs(q);

    if (snap.empty) return alert("Student record not found. Please check Reg No.");

    let matchedStudent = null;
    snap.forEach(d => {
      const data = d.data();
      const sPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (sPhone === mobile) matchedStudent = {id: d.id, ...data};
    });

    if (!matchedStudent) return alert("Provided phone number does not match student's records.");

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
    if (!password) return alert("Please enter your password.");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) { alert("Sign-in failed: " + err.message); }
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
        if(f.feeType && f.feeType.includes(m)) paidMonths.add(m);
      });
    });
    document.getElementById("pvFeeTableBody").innerHTML = feeHtml || `<tr><td colspan="4" class="text-center text-muted">No fee records found</td></tr>`;

    let gridHtml = "";
    ALL_MONTHS.forEach(m => {
      if(paidMonths.has(m)) {
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

window.handleSignUp = async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("btnSubmitSignup");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const board = document.getElementById("regBoard").value;
    const instCode = document.getElementById("regInstCode").value.trim().toUpperCase();
    const instName = document.getElementById("regInstName").value.trim().toUpperCase();
    const userName = document.getElementById("regUserName").value.trim().toUpperCase();
    const phone = document.getElementById("regPhone").value.trim();
    const whatsapp = document.getElementById("regWhatsapp").value.trim() || phone;
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const pwd = document.getElementById("regPassword").value;
    const instId = board + "_" + instCode;
    
    const address = document.getElementById("regAddress") ? document.getElementById("regAddress").value.trim().toUpperCase() : "";
    const place = document.getElementById("regPlace") ? document.getElementById("regPlace").value.trim().toUpperCase() : "";
    const po = document.getElementById("regPo") ? document.getElementById("regPo").value.trim().toUpperCase() : "";
    const pincode = document.getElementById("regPincode") ? document.getElementById("regPincode").value.trim() : "";
    const district = document.getElementById("regDistrict") ? document.getElementById("regDistrict").value.trim().toUpperCase() : "";
    const locationLink = document.getElementById("regLocationLink") ? document.getElementById("regLocationLink").value.trim() : "";

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

    document.getElementById("signupForm").reset();

    if (isDev) {
      alert("Developer Account registered and activated!");
    } else {
      alert("Registration submitted successfully! Please wait for Super Admin approval before signing in.");
      signOut(auth);
      switchAuthTab('login');
    }
  } catch (err) { 
    alert("Registration failed: " + err.message); 
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

window.handleStaffSignUp = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("btnStaffSubmitSignup");
    if (submitBtn) submitBtn.disabled = true;
  
    try {
      const role = document.getElementById("staffRole").value;
      const board = document.getElementById("staffBoard").value;
      const instCode = document.getElementById("staffInstCode").value.trim().toUpperCase();
      const instId = board + "_" + instCode; 
      
      const userName = document.getElementById("staffName").value.trim().toUpperCase();
      const phone = document.getElementById("staffPhone").value.trim();
      const whatsapp = document.getElementById("staffWhatsapp").value.trim() || phone;
      const email = document.getElementById("staffEmail").value.trim().toLowerCase();
      const pwd = document.getElementById("staffPassword").value;
  
      const instQuery = query(collection(db, "users"), where("institutionId", "==", instId), where("role", "==", "admin"));
      const instSnap = await getDocs(instQuery);
  
      if (instSnap.empty) {
          alert("Madrasa Code/Board combination not found. Please check with your Institution Admin.");
          submitBtn.disabled = false;
          return;
      }
      
      let instName = "";
      instSnap.forEach(d=> instName = d.data().institutionName);
  
      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: userName,
        phone: phone,
        whatsapp: whatsapp,
        email: email,
        institutionId: instId,
        institutionName: instName,
        role: role, 
        status: "pending", 
        assignedClasses: [],
        createdAt: serverTimestamp()
      });
  
      document.getElementById("staffSignupForm").reset();
      alert("Registration submitted successfully! Please wait for approval.");
      signOut(auth);
      switchAuthTab('login');
  
    } catch (err) { 
      alert("Registration failed: " + err.message); 
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
};

window.loadSuperAdminRequests = async () => {
  const tbody = document.getElementById("superAdminTableBody");
  tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading registered madrasas...</td></tr>`;

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
      ? `<span class="badge bg-warning text-dark">Pending</span>` 
      : `<span class="badge bg-success">Active</span>`;

    const approveOrManageBtn = isPending 
      ? `<button class="btn btn-sm btn-success me-1" onclick="approveMadrasa('${u.id}', '${u.institutionName}')" title="Approve"><i class="fa-solid fa-check"></i> Approve</button>`
      : `<button class="btn btn-sm btn-primary me-1" onclick="switchMadrasaScope('${u.institutionId}', '${u.institutionName}')" title="Manage Scope"><i class="fa-solid fa-folder-open"></i> Manage</button>`;

    let stuCount = 0;
    let staffCount = 0;

    try {
        const stuQ = query(collection(db, "students"), where("institutionId", "==", u.institutionId));
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
        <td><b>${u.institutionId || '-'}</b></td>
        <td><b>${u.institutionName || '-'}</b></td>
        <td>${u.place || '-'}</td>
        <td>${u.name || '-'}</td>
        <td class="text-center"><span class="badge bg-info text-dark">${staffCount}</span></td>
        <td class="text-center"><span class="badge bg-primary">${stuCount}</span></td>
        <td>${statusBadge}</td>
        <td class="text-center">
          ${approveOrManageBtn}
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="openSuperAdminEditMadrasaModal('${u.id}')" title="Edit Details"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="rejectMadrasa('${u.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  }
  tbody.innerHTML = html || `<tr><td colspan="8" class="text-center text-muted">No madrasa accounts found.</td></tr>`;
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
  loadPrincipalsList();
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

  if (subjectsArray.length === 0) return alert("Please enter at least one subject.");

  try {
    await setDoc(doc(db, "subjectSettings", `${currentInstitutionId}_Class_${selClass}`), {
      institutionId: currentInstitutionId,
      class: selClass,
      subjects: subjectsArray,
      updatedAt: serverTimestamp()
    });
    alert(`Subjects for Class ${selClass} updated successfully!`);
  } catch (e) {
    alert("Error saving subjects: " + e.message);
  }
};

window.loadMarksEntrySheet = async () => {
  resetMarksButton();
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

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", cleanClass));
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
  if (!exam || !selClass) return alert("Select exam and class.");

  const btn = document.getElementById("btnSaveMarks");
  if(btn) {
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
    if(btn) {
        btn.className = "btn btn-secondary px-4 mt-2"; 
        btn.innerHTML = `<i class="fa-solid fa-check me-1"></i> Saved Successfully`;
    }
    alert("Marks saved successfully.");
  } catch (err) { 
      if(btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Marks`;
      }
      alert("Error: " + err.message); 
  }
};

window.loadStudentsForFees = async () => {
  const selClass = document.getElementById("feeClassSelect").value;
  const tableArea = document.getElementById("feesTableArea");
  const tbody = document.getElementById("feesTableBody");
  const alertArea = document.getElementById("feeCollectionAlert");
  const collectionArea = document.getElementById("feeCollectionArea");

  let canCollect = false;
  if(currentUserRole === "admin") canCollect = true;
  else if(currentUserRole === "principal" && (sysFeePermission === "principal" || sysFeePermission === "all")) canCollect = true;
  else if(currentUserRole === "teacher" && sysFeePermission === "all") canCollect = true;

  if(!canCollect) {
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
  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", cleanClass));
  const snap = await getDocs(q);

  let students = [];
  snap.forEach(d => students.push({ id: d.id, ...d.data() }));
  students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  if(students.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No students in this class.</td></tr>`;
      return;
  }

  const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", currentInstitutionId), where("class", "==", cleanClass));
  const feeSnap = await getDocs(feeQ);
  
  const studentPaidMonths = {};
  feeSnap.forEach(d => {
      const f = d.data();
      if(!studentPaidMonths[f.regNo]) studentPaidMonths[f.regNo] = new Set();
      ALL_MONTHS.forEach(m => {
        if(f.feeType && f.feeType.includes(m)) {
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
      if(paidSet.has(m)) {
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

    if(category === "Monthly Fee") {
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
    if(sysReqManualReceipt) {
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
  
  if(category === "Monthly Fee") {
      const checkedMonths = Array.from(document.querySelectorAll(".month-cb:checked")).map(cb => cb.value);
      if(checkedMonths.length === 0) {
          return alert("Please select at least one month for Monthly Fee.");
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

    if(phone) {
         document.getElementById("whatsappShareBtn").classList.remove("d-none");
    } else {
         document.getElementById("whatsappShareBtn").classList.add("d-none");
    }

    bootstrap.Modal.getInstance(document.getElementById('feePaymentModal')).hide();
    
    document.getElementById("appSection").classList.add("d-none");
    document.getElementById("printableReceipt").classList.remove("d-none");
    
    loadStudentsForFees();

  } catch (err) { alert("Error: " + err.message); }
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
    
    if(!fromStr || !toStr) return alert("Please select both From and To dates.");
    
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
            if(data.timestamp) {
                const docDate = data.timestamp.toDate();
                if(docDate >= fromDate && docDate <= toDate) {
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

        if(html === "") {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No collections found for the selected dates.</td></tr>`;
        } else {
            tbody.innerHTML = html;
            document.getElementById("feeReportTotal").innerText = `₹${total}`;
            tfoot.classList.remove("d-none");
        }
    } catch(err) {
        alert("Error generating report: " + err.message);
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
        
        alert("Fee settings saved successfully!");
    } catch (err) { alert("Error: " + err.message); }
};

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
  if (!fileInput.files.length) return alert("Please select a CSV file.");

  statusDiv.classList.remove("d-none");
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
      }
    }
  });
};

window.showSignupForm = (type) => {
  document.getElementById("signupOptions").classList.add("d-none");
  if(type === 'madrasa') document.getElementById("signupForm").classList.remove("d-none");
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
