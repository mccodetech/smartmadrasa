// ==========================================
// AUTHENTICATION MODULE (auth.js)
// ==========================================
import { db, auth, SUPER_ADMIN_EMAIL } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  doc, setDoc, getDoc, collection, getDocs, query, where, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// പാസ്‌വേഡ് ടോഗിൾ ഫങ്ഷൻ
window.togglePasswordVisibility = (inputId, btn) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    if (icon) icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    if (icon) icon.classList.replace("fa-eye-slash", "fa-eye");
  }
};

// ലോഗിൻ മോഡ് കണ്ടെത്താൻ (ഇമെയിൽ ആണോ സ്റ്റുഡന്റ് റെഗ് നമ്പർ ആണോ എന്ന്)
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

// ലോഗൗട്ട് ഫങ്ഷൻ
window.handleLogout = () => {
  signOut(auth).then(() => {
    sessionStorage.clear();
    window.location.reload();
  }).catch((error) => {
    window.showToast("Logout Error: " + error.message, "error");
  });
};

window.logoutParent = () => {
  sessionStorage.clear();
  window.location.reload();
};

// സൈൻ അപ്പ് ഫോം ടോഗിൾ ചെയ്യൽ
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
  } else {
    document.getElementById("signupOptions").classList.remove("d-none");
    document.getElementById("tabBtnSignup").classList.add("active");
  } 
};

// മദ്റസ അഡ്മിൻ രജിസ്ട്രേഷൻ
window.handleSignUp = async (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const pwd = document.getElementById("regPassword").value;
  const pwdConf = document.getElementById("regPasswordConfirm").value;

  if (pwd !== pwdConf) {
    window.showToast("Passwords do not match!", "warning");
    return;
  }

  try {
    const board = document.getElementById("regBoard").value;
    const code = document.getElementById("regInstCode").value.trim().toUpperCase();
    const instId = board + "_" + code;
    
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: document.getElementById("regUserName").value.trim().toUpperCase(),
      phone: document.getElementById("regPhone").value.trim(),
      email: email,
      institutionId: instId,
      institutionName: document.getElementById("regInstName").value.trim().toUpperCase(),
      role: "admin",
      status: email === SUPER_ADMIN_EMAIL ? "active" : "pending",
      createdAt: serverTimestamp()
    });

    window.showToast("Registration submitted successfully!", "success");
    signOut(auth);
    window.switchAuthTab('login');
  } catch (err) {
    window.showToast("Registration failed: " + err.message, "error");
  }
};

// സ്റ്റാഫ് രജിസ്ട്രേഷൻ
window.handleStaffSignUp = async (e) => {
  e.preventDefault();
  const email = document.getElementById("staffEmail").value.trim().toLowerCase();
  const pwd = document.getElementById("staffPassword").value;
  const pwdConf = document.getElementById("staffPasswordConfirm").value;

  if (pwd !== pwdConf) {
    window.showToast("Passwords do not match!", "warning");
    return;
  }

  try {
    const board = document.getElementById("staffBoard").value;
    const code = document.getElementById("staffInstCode").value.trim().toUpperCase();
    const instId = board + "_" + code;

    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: document.getElementById("staffName").value.trim().toUpperCase(),
      phone: document.getElementById("staffPhone").value.trim(),
      email: email,
      institutionId: instId,
      role: document.getElementById("staffRole").value,
      status: "pending",
      createdAt: serverTimestamp()
    });

    window.showToast("Staff request submitted successfully!", "success");
    signOut(auth);
    window.switchAuthTab('login');
  } catch (err) {
    window.showToast("Registration failed: " + err.message, "error");
  }
};

// ലോഗിൻ പ്രോസസ്സ്
window.handleUnifiedLogin = async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim();

  if (/^\d+$/.test(identifier)) {
    window.showToast("Parent portal login active", "info");
  } else {
    try {
      const email = identifier.toLowerCase();
      const password = document.getElementById("loginPassword").value;
      await signInWithEmailAndPassword(auth, email, password);
      window.showToast("Signed in successfully!", "success");
    } catch (err) {
      window.showToast("Sign-in failed: " + err.message, "error");
    }
  }
};

// ==========================================
// PARENT PORTAL LOGIN & DATA LOADER
// ==========================================
let parentStudentsData = [];

window.handleUnifiedLogin = async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier")?.value.trim();

  if (/^\d+$/.test(identifier)) {
    const reg = Number(identifier);
    const mobile = document.getElementById("loginMobile")?.value.trim().slice(-10);

    if (!mobile) return window.showToast("Please enter the registered mobile number.", "warning");

    try {
      const q = query(collection(db, "students"), where("regNo", "==", reg));
      const snap = await getDocs(q);

      if (snap.empty) return window.showToast("Student record not found.", "error");

      let matchedStudent = null;
      snap.forEach(d => {
        const data = d.data();
        const sPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (sPhone === mobile) matchedStudent = { id: d.id, ...data };
      });

      if (!matchedStudent) return window.showToast("Phone number does not match.", "error");

      const siblingsQ = query(collection(db, "students"), where("institutionId", "==", matchedStudent.institutionId));
      const siblingsSnap = await getDocs(siblingsQ);
      
      parentStudentsData = [];
      siblingsSnap.forEach(d => {
        const data = d.data();
        const sPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (sPhone === mobile) {
          parentStudentsData.push({ id: d.id, ...data });
        }
      });

      sessionStorage.setItem("parentLoggedIn", "true");
      document.getElementById("authSection")?.classList.add("d-none");
      document.getElementById("parentViewSection")?.classList.remove("d-none");

      const studentSelect = document.getElementById("parentStudentSelect");
      if (studentSelect) {
        studentSelect.innerHTML = "";
        parentStudentsData.forEach(student => {
          const option = document.createElement("option");
          option.value = student.regNo;
          option.text = `${student.name} (Reg No: ${student.regNo})`;
          if (student.regNo === reg) option.selected = true;
          studentSelect.appendChild(option);
        });
      }

      loadParentStudentData(matchedStudent);
    } catch (err) {
      window.showToast("Login error: " + err.message, "error");
    }

  } else {
    try {
      const email = identifier.toLowerCase();
      const password = document.getElementById("loginPassword")?.value;
      if (!password) return window.showToast("Please enter your password.", "warning");

      await signInWithEmailAndPassword(auth, email, password);
      window.showToast("Signed in successfully!", "success");
    } catch (err) { 
      window.showToast("Sign-in failed: " + err.message, "error"); 
    }
  }
};

window.switchParentStudent = () => {
  const selectedRegNo = Number(document.getElementById("parentStudentSelect")?.value);
  const selectedStudent = parentStudentsData.find(s => s.regNo === selectedRegNo);
  if (selectedStudent) loadParentStudentData(selectedStudent);
};

async function loadParentStudentData(student) {
  const nameEl = document.getElementById("pvStudentName");
  const classEl = document.getElementById("pvClass");
  const regNoEl = document.getElementById("pvRegNo");
  const fatherEl = document.getElementById("pvFather");

  if (nameEl) nameEl.innerText = student.name;
  if (classEl) classEl.innerText = "Class " + (student.currentClass || '').replace(/Class\s*/i, "");
  if (regNoEl) regNoEl.innerText = student.regNo;
  if (fatherEl) fatherEl.innerText = student.fatherName || student.guardianName || '-';

  try {
    const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
    const feeSnap = await getDocs(feeQ);
    
    let feeHtml = "";
    const paidMonths = new Set();
    const ALL_MONTHS = ["APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"];
    
    feeSnap.forEach(fd => {
      const f = fd.data();
      feeHtml += `<tr><td>#${f.receiptNo}</td><td>${f.date || '-'}</td><td>${f.feeType}</td><td class="fw-bold text-success">₹${f.amount}</td></tr>`;
      ALL_MONTHS.forEach(m => {
        if (f.feeType && f.feeType.includes(m)) paidMonths.add(m);
      });
    });
    
    const feeTableBody = document.getElementById("pvFeeTableBody");
    if (feeTableBody) feeTableBody.innerHTML = feeHtml || `<tr><td colspan="4" class="text-center text-muted">No fee records found</td></tr>`;

    let gridHtml = "";
    ALL_MONTHS.forEach(m => {
      if (paidMonths.has(m)) {
        gridHtml += `<div class="month-badge month-paid">${m}<br><small>PAID</small></div>`;
      } else {
        gridHtml += `<div class="month-badge month-pending">${m}<br><small>DUE</small></div>`;
      }
    });
    const monthGrid = document.getElementById("pvFeeMonthGrid");
    if (monthGrid) monthGrid.innerHTML = gridHtml;
  } catch (e) {
    console.error("Error loading parent fee data:", e);
  }
}
