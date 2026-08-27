// ==========================================
// SECTION 1: INITIALIZATION & IMPORTS
// ==========================================
import { db, auth, SUPER_ADMIN_EMAIL } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  doc, setDoc, collection, getDocs, query, where, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// SECTION 2: PASSWORD & UI UTILITIES
// ==========================================
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

window.detectLoginMode = () => {
  const val = document.getElementById("loginIdentifier")?.value.trim() || "";
  const pwdGrp = document.getElementById("passwordGroup");
  const phoneGrp = document.getElementById("phoneGroup");
  const submitBtn = document.getElementById("btnAuthSubmit");

  if (/^\d+$/.test(val)) {
    if (pwdGrp) pwdGrp.classList.add("d-none");
    if (phoneGrp) phoneGrp.classList.remove("d-none");
    if (submitBtn) submitBtn.innerText = "View Student Details";
  } else {
    if (pwdGrp) pwdGrp.classList.remove("d-none");
    if (phoneGrp) phoneGrp.classList.add("d-none");
    if (submitBtn) submitBtn.innerText = "Sign In";
  }
};

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

// ==========================================
// SECTION 3: STAFF & ADMIN REGISTRATION
// ==========================================
window.handleSignUp = async (e) => {
  e.preventDefault();
  // (രജിസ്ട്രേഷൻ കോഡ്)
};

// ==========================================
// SECTION 4: UNIFIED LOGIN & PARENT PORTAL
// ==========================================
let parentStudentsData = [];

window.handleUnifiedLogin = async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier")?.value.trim() || "";

  // രക്ഷിതാക്കളുടെ ലോഗിൻ (റീജസ്ട്രേഷൻ നമ്പർ വഴി)
  if (/^\d+$/.test(identifier)) {
    const reg = Number(identifier);
    const mobile = document.getElementById("loginMobile")?.value.trim().slice(-10);

    if (!mobile) {
      window.showToast("Please enter the registered mobile number.", "warning");
      return;
    }

    try {
      const q = query(collection(db, "students"), where("regNo", "==", reg));
      const snap = await getDocs(q);

      if (snap.empty) {
        window.showToast("Student record not found with this Reg No.", "error");
        return;
      }

      let matchedStudent = null;
      snap.forEach(d => {
        const data = d.data();
        const sPhone = (data.phone || '').replace(/[^0-9]/g, '').slice(-10);
        if (sPhone === mobile) {
          matchedStudent = { id: d.id, ...data };
        }
      });

      if (!matchedStudent) {
        window.showToast("Mobile number does not match our records.", "error");
        return;
      }

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
      window.showToast("Welcome to Parent Portal!", "success");

    } catch (err) {
      window.showToast("Login error: " + err.message, "error");
    }

  } else {
    try {
      const email = identifier.toLowerCase();
      const password = document.getElementById("loginPassword")?.value;
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

// പാരന്റ് പോർട്ടലിൽ കുട്ടിയുടെ ഫീസ്, മാർക്ക്, പെർഫോമൻസ് എന്നിവ ലോഡ് ചെയ്യുന്ന ഫംഗ്ഷൻ
async function loadParentStudentData(student) {
  const nameEl = document.getElementById("pvStudentName");
  const classEl = document.getElementById("pvClass");
  const regNoEl = document.getElementById("pvRegNo");
  const fatherEl = document.getElementById("pvFather");
  const totalPtsEl = document.getElementById("pvTotalPoints");

  if (nameEl) nameEl.innerText = student.name || '-';
  if (classEl) classEl.innerText = "Class " + (student.currentClass || '').replace(/Class\s*/i, "");
  if (regNoEl) regNoEl.innerText = student.regNo || '-';
  if (fatherEl) fatherEl.innerText = student.fatherName || student.guardianName || '-';

  try {
    // 1. Fee Status & Grid
    const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
    const feeSnap = await getDocs(feeQ);
    
    let feeHtml = "";
    const paidMonths = new Set();
    const ALL_MONTHS = ["APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"];
    
    feeSnap.forEach(fd => {
      const f = fd.data();
      feeHtml += `<tr><td>#${f.receiptNo || '-'}</td><td>${f.date || '-'}</td><td>${f.feeType || '-'}</td><td class="fw-bold text-success">₹${f.amount || 0}</td></tr>`;
      ALL_MONTHS.forEach(m => {
        if (f.feeType && f.feeType.includes(m)) paidMonths.add(m);
      });
    });
    
    const feeTableBody = document.getElementById("pvFeeTableBody");
    if (feeTableBody) {
      feeTableBody.innerHTML = feeHtml || `<tr><td colspan="4" class="text-center text-muted">No fee records found</td></tr>`;
    }

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

    // 2. Examination Marks (എക്സാം മാർക്കുകൾ ലോഡ് ചെയ്യാൻ)
    const marksQ = query(collection(db, "examMarks"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
    const marksSnap = await getDocs(marksQ);
    let marksHtml = "";
    marksSnap.forEach(md => {
      const m = md.data();
      if (m.marks && typeof m.marks === 'object') {
        Object.entries(m.marks).forEach(([subj, score]) => {
          marksHtml += `<tr><td>${m.examName || 'Exam'}</td><td>${subj}</td><td class="fw-bold">${score}</td></tr>`;
        });
      }
    });
    const marksTableBody = document.getElementById("pvMarksTableBody");
    if (marksTableBody) {
      marksTableBody.innerHTML = marksHtml || `<tr><td colspan="3" class="text-center text-muted">No exam marks found</td></tr>`;
    }

    // 3. Performance & Star Points History (പെർഫോമൻസ് പോയിന്റുകൾ ലോഡ് ചെയ്യാൻ)
    const perfQ = query(collection(db, "performancePoints"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
    const perfSnap = await getDocs(perfQ);
    let totalPts = 0;
    let perfHtml = "";
    perfSnap.forEach(pd => {
      const p = pd.data();
      totalPts += (Number(p.points) || 0);
      perfHtml += `<tr><td>${p.date || '-'}</td><td>${p.task || '-'}</td><td class="fw-bold ${p.points >= 0 ? 'text-success' : 'text-danger'}">${p.points > 0 ? '+' : ''}${p.points} Pts</td></tr>`;
    });
    
    if (totalPtsEl) totalPtsEl.innerText = totalPts + " Pts";
    const pointsTableBody = document.getElementById("pvPointsTableBody");
    if (pointsTableBody) {
      pointsTableBody.innerHTML = perfHtml || `<tr><td colspan="3" class="text-center text-muted">No performance points recorded</td></tr>`;
    }

  } catch (e) {
    console.error("Error loading parent data:", e);
  }
}
