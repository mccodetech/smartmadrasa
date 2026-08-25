window.currentLang = 'en';
const translations = {
  en: {
    portal_sub: "Digital Madrasa Management Suite",
    tab_login: "Login",
    tab_signup: "Register Madrasa",
    tab_staff_signup: "Staff Register",
    lbl_login_input: "Email Address or Student Reg No.",
    lbl_email: "Email Address",
    lbl_pwd: "Password",
    btn_signin: "Sign In",
    parent_login_hint: "Enter student's Reg No. and registered mobile number.",
    reg_approval_notice: "New registrations require Developer / Super Admin approval before activation.",
    staff_reg_notice: "Staff registration requires approval from the Institution Admin.",
    btn_submit_staff_reg: "Register as Staff",
    lbl_regno: "Student Reg No.",
    lbl_phone: "Registered Mobile Number",
    btn_viewdetails: "View Student Details",
    lbl_instcode: "Madrasa Reg / Code",
    lbl_instname: "Madrasa Name",
    lbl_principal: "Institution Admin Name",
    btn_createrecord: "Submit for Approval",
    btn_exit: "Exit",
    lbl_father: "Father:",
    lbl_totalpoints: "Total Points",
    nav_fees: "Fee Receipts",
    nav_perf: "Performance Tasks",
    th_receiptno: "Receipt No",
    th_date: "Date",
    th_item: "Item",
    th_amount: "Amount",
    msg_nofees: "No fee records found",
    th_task: "Task / Category",
    th_points: "Points",
    msg_nopoints: "No points awarded yet",
    btn_logout: "Logout",
    nav_home: "Home",
    nav_students: "Students",
    nav_attendance: "Attendance",
    nav_marks: "Marks Entry",
    nav_staff: "Staff Management",
    nav_promotion: "Class Promotion",
    home_card_att_sub: "Record daily attendance",
    home_card_perf_sub: "Tasks & Star Points",
    home_card_mark_sub: "Exam scores & evaluations",
    home_leaderboard_title: "Top Performers Leaderboard",
    star_today: "Today's Star",
    star_week: "Weekly Star",
    star_month: "Monthly Star",
    students_list_title: "Student Directory",
    btn_newadm: "New Admission",
    btn_bulkimport: "Bulk Import",
    btn_reload: "Reload",
    th_name: "Name",
    th_class: "Class",
    th_guardian: "Parent / Guardian",
    th_place: "Place",
    th_actions: "Actions",
    msg_loading: "Loading data...",
    adm_form_title: "Student Admission Form",
    btn_backtolist: "Back to List",
    lbl_idno: "ID No.",
    lbl_fullname: "Full Name *",
    lbl_currentclass: "Class *",
    lbl_dob: "Date of Birth",
    lbl_joineddate: "Joined Date",
    lbl_joinedclass: "Joined Class",
    lbl_mother: "Mother Name",
    lbl_guardian: "Guardian Name",
    lbl_whatsapp: "WhatsApp Number *",
    lbl_place: "Place",
    lbl_address: "Address / House Name",
    btn_save: "Save Admission",
    lbl_date: "Date",
    lbl_selectclass: "Select Class",
    lbl_selectall: "Select All",
    th_status: "Status (Present)",
    btn_saveatt: "Save Attendance",
    lbl_selectexam: "Select Exam *",
    btn_savemarks: "Save Marks",
    btn_addtask: "Add Custom Task",
    lbl_selecttask: "Select Task *",
    th_award: "Award (Tick)",
    btn_savepoints: "Save Points",
    lbl_selectstudent: "Select Student",
    lbl_amount: "Amount (₹) *",
    lbl_feetype: "Fee Type",
    lbl_manualno: "Manual Receipt No (Book)",
    btn_saveprint: "Save & Print Receipt",
    btn_whatsapp: "Send via WhatsApp",
    lbl_role: "Role",
    lbl_assignedclasses: "Assigned Classes",
    btn_addstaff: "Register Staff",
    staff_list_title: "Registered Staff Directory",
    th_role: "Role",
    th_email: "Email",
    th_assigned: "Classes",
    lbl_promoteto: "Promote To",
    btn_promote: "Promote Class",
    lbl_taskname: "Task Name *",
    lbl_points: "Points (+ or -) *",
    btn_cancel: "Cancel",
    btn_add: "Add Task"
  },
  ml: {
    portal_sub: "സ്മാർട്ട് മദ്റസാ മാനേജ്‌മെന്റ് പോർട്ടൽ",
    tab_login: "ലോഗിൻ",
    tab_signup: "മദ്റസ രജിസ്ട്രേഷൻ",
    tab_staff_signup: "സ്റ്റാഫ് രജിസ്ട്രേഷൻ",
    lbl_login_input: "ഇമെയിൽ അല്ലെങ്കിൽ കുട്ടിയുടെ Reg No.",
    lbl_email: "ഇമെയിൽ വിലാസം",
    lbl_pwd: "പാസ്‌വേഡ്",
    btn_signin: "പ്രവേശിക്കുക",
    parent_login_hint: "കുട്ടിയുടെ Reg No. വും രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പറും നൽകുക.",
    reg_approval_notice: "പുതിയ മദ്റസകളുടെ രജിസ്ട്രേഷൻ സൂപ്പർ അഡ്മിൻ അംഗീകരിച്ച ശേഷം മാത്രമേ ആക്റ്റീവ് ആകൂ.",
    staff_reg_notice: "സ്റ്റാഫ് രജിസ്ട്രേഷൻ ഇൻസ്റ്റിറ്റ്യൂഷൻ അഡ്മിൻ അംഗീകരിച്ച ശേഷം മാത്രമേ ആക്റ്റീവ് ആകൂ.",
    btn_submit_staff_reg: "സ്റ്റാഫ് ആയി രജിസ്റ്റർ ചെയ്യുക",
    lbl_regno: "വിദ്യാർത്ഥിയുടെ Reg No.",
    lbl_phone: "രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ",
    btn_viewdetails: "വിവരങ്ങൾ കാണുക",
    lbl_instcode: "മദ്റസാ നമ്പർ / കോഡ്",
    lbl_instname: "മദ്റസയുടെ പേര്",
    lbl_principal: "ഇൻസ്റ്റിറ്റ്യൂഷൻ അഡ്മിൻ്റെ പേര്",
    btn_createrecord: "അംഗീകാരത്തിനായി സമർപ്പിക്കുക",
    btn_exit: "പുറത്തുകടക്കുക",
    lbl_father: "പിതാവ്:",
    lbl_totalpoints: "ആകെ പോയിന്റുകൾ",
    nav_fees: "ഫീസ് & രസീത്",
    nav_perf: "പെർഫോമൻസ് ടാസ്കുകൾ",
    th_receiptno: "രസീത് No",
    th_date: "തീയതി",
    th_item: "ഇനം",
    th_amount: "തുക",
    msg_nofees: "ഫീസ് വിവരങ്ങൾ ലഭ്യമല്ല",
    th_task: "ടാസ്ക് / വിഷയം",
    th_points: "പോയിന്റ്",
    msg_nopoints: "പോയിന്റുകൾ നൽകിയിട്ടില്ല",
    btn_logout: "ലോഗ് ഔട്ട്",
    nav_home: "ഹോം",
    nav_students: "വിദ്യാർത്ഥികൾ",
    nav_attendance: "ഹാജർ",
    nav_marks: "മാർക്ക് എൻട്രി",
    nav_staff: "മുഅല്ലിം മാനേജ്‌മെന്റ്",
    nav_promotion: "ക്ലാസ് കയറ്റം",
    home_card_att_sub: "ദിവസേനയുള്ള ഹാജർ രേഖപ്പെടുത്തുക",
    home_card_perf_sub: "പോയിന്റുകളും ക്ലാസ് താരങ്ങളും",
    home_card_mark_sub: "പരീക്ഷാ മാർക്കുകൾ എന്റർ ചെയ്യുക",
    home_leaderboard_title: "മദ്റസാ പ്രതിഭാ ലീഡർബോർഡ്",
    star_today: "ഇന്നത്തെ താരം",
    star_week: "ഈ ആഴ്ചയിലെ താരം",
    star_month: "മാസത്തിലെ താരം",
    students_list_title: "വിദ്യാർത്ഥി ലിസ്റ്റ്",
    btn_newadm: "പുതിയ അഡ്മിഷൻ",
    btn_bulkimport: "ബൾക്ക് ഇമ്പോർട്ട്",
    btn_reload: "റീലോഡ്",
    th_name: "പേര്",
    th_class: "ക്ലാസ്",
    th_guardian: "പിതാവ് / രക്ഷാകർത്താവ്",
    th_place: "സ്ഥലം",
    th_actions: "നടപടികൾ",
    msg_loading: "ഡാറ്റ ലോഡ് ചെയ്യുന്നു...",
    adm_form_title: "പുതിയ അഡ്മിഷൻ ഫോം",
    btn_backtolist: "ലിസ്റ്റിലേക്ക് തിരികെ",
    lbl_idno: "ID No.",
    lbl_fullname: "പൂർണ്ണമായ പേര് *",
    lbl_currentclass: "നിലവിലെ ക്ലാസ് *",
    lbl_dob: "ജനന തീയതി",
    lbl_joineddate: "ചേർന്ന തീയതി",
    lbl_joinedclass: "ചേർന്ന ക്ലാസ്",
    lbl_mother: "മാതാവിന്റെ പേര്",
    lbl_guardian: "രക്ഷാകർത്താവ്",
    lbl_whatsapp: "WhatsApp ഫോൺ നമ്പർ *",
    lbl_place: "സ്ഥലം",
    lbl_address: "വീട്ടുപേര് / വിലാസം",
    btn_save: "സേവ് ചെയ്യുക",
    lbl_date: "തീയതി",
    lbl_selectclass: "ക്ലാസ് തിരഞ്ഞെടുക്കുക",
    lbl_selectall: "മുഴുവൻ പേർക്കും (Select All)",
    th_status: "ഹാജർ നില (Tick)",
    btn_saveatt: "ഹാജർ സേവ് ചെയ്യുക",
    lbl_selectexam: "പരീക്ഷ തിരഞ്ഞെടുക്കുക *",
    btn_savemarks: "മാർക്കുകൾ സേവ് ചെയ്യുക",
    btn_addtask: "പുതിയ ടാസ്ക് ചേർക്കുക",
    lbl_selecttask: "ടാസ്ക് തിരഞ്ഞെടുക്കുക *",
    th_award: "ടാസ്ക് നൽകുക (Tick)",
    btn_savepoints: "പോയിന്റുകൾ സേവ് ചെയ്യുക",
    lbl_selectstudent: "വിദ്യാർത്ഥിയെ തിരഞ്ഞെടുക്കുക",
    lbl_amount: "തുക (₹) *",
    lbl_feetype: "ഫീസ് ഇനം",
    lbl_manualno: "മാനുവൽ രസീത് നമ്പർ (Book No)",
    btn_saveprint: "രസീത് സേവ് & പ്രിന്റ്",
    btn_whatsapp: "WhatsApp-ൽ അയക്കുക",
    lbl_role: "സ്ഥാനം",
    lbl_assignedclasses: "ചുമതലയുള്ള ക്ലാസുകൾ",
    btn_addstaff: "മുഅല്ലിമിനെ രജിസ്റ്റർ ചെയ്യുക",
    staff_list_title: "രജിസ്റ്റർ ചെയ്ത മുഅല്ലിംകളുടെ ലിസ്റ്റ്",
    th_role: "സ്ഥാനം",
    th_email: "ഇമെയിൽ",
    th_assigned: "ക്ലാസുകൾ",
    lbl_promoteto: "മാറേണ്ട ക്ലാസ്",
    btn_promote: "ക്ലാസ് മാറ്റുക",
    lbl_taskname: "ടാസ്കിന്റെ പേര് *",
    lbl_points: "പോയിന്റ് (+ അല്ലെങ്കിൽ -) *",
    btn_cancel: "റദ്ദാക്കുക",
    btn_add: "ചേർക്കുക"
  }
};

window.toggleLanguage = () => {
  window.currentLang = window.currentLang === 'en' ? 'ml' : 'en';
  document.getElementById('langSwitchLabel').innerText = window.currentLang === 'en' ? 'മലയാളം' : 'English';
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[window.currentLang][key]) {
      el.innerText = translations[window.currentLang][key];
    }
  });
};

window.detectLoginMode = () => {
  const val = document.getElementById("loginIdentifier").value.trim();
  const pwdGrp = document.getElementById("passwordGroup");
  const phoneGrp = document.getElementById("phoneGroup");
  const submitBtn = document.getElementById("btnAuthSubmit");

  if (/^\d+$/.test(val)) {
    pwdGrp.classList.add("d-none");
    phoneGrp.classList.remove("d-none");
    submitBtn.innerText = window.currentLang === 'ml' ? "വിവരങ്ങൾ കാണുക" : "View Student Details";
  } else {
    pwdGrp.classList.remove("d-none");
    phoneGrp.classList.add("d-none");
    submitBtn.innerText = window.currentLang === 'ml' ? "പ്രവേശിക്കുക" : "Sign In";
  }
};

window.syncMobileMenu = () => {
  const desktopMenu = document.getElementById("desktopTabMenu");
  const mobileMenu = document.getElementById("mobileTabMenu");
  if (desktopMenu && mobileMenu) {
    mobileMenu.innerHTML = desktopMenu.innerHTML;
  }
};

// Firebase Modular Scripts
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, query, where, writeBatch, runTransaction, serverTimestamp 
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

window.updateDropdownLabel = (type) => {
  const checkboxes = document.querySelectorAll(`.${type}-class-cb:checked`);
  const label = document.getElementById(`${type}ClassDropdownLabel`);
  if (label) {
    if (!checkboxes.length) {
      label.innerText = window.currentLang === 'ml' ? "ക്ലാസ് തിരഞ്ഞെടുക്കുക" : "Select Class";
    } else {
      const selected = Array.from(checkboxes).map(cb => cb.value);
      label.innerText = selected.map(c => `Class ${c}`).join(', ');
    }
  }
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        isSuperAdmin = (user.email === SUPER_ADMIN_EMAIL);
        
        // Handle pending users
        if (!isSuperAdmin && userData.status === "pending") {
           let alertMsg = "Your registration is pending approval.";
           if(userData.role === 'admin') alertMsg = "Your Madrasa registration is pending approval from the Super Admin / Developer. Please contact support.";
           else alertMsg = "Your Staff registration is pending approval from your Institution Admin.";
           
          alert(alertMsg);
          signOut(auth);
          return;
        }

        currentInstitutionId = userData.institutionId;
        currentUserRole = userData.role || (isSuperAdmin ? "superadmin" : "teacher");
        currentUserAssignedClasses = userData.assignedClasses || (userData.assignedClass ? [userData.assignedClass] : []);

        const instNameEl = document.getElementById("displayMadrassaName");
        if (instNameEl) instNameEl.innerText = isSuperAdmin ? "Smart Madrasa - Master Control Center" : (userData.institutionName || "Smart Madrasa");

        const userNameEl = document.getElementById("displayUserName");
        if (userNameEl) userNameEl.innerHTML = `<i class="fa-solid fa-user"></i> ${userData.name}`;
        
        const userRoleEl = document.getElementById("displayUserRole");
        const tMenuBtn = document.getElementById("teachersMenuBtn");
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


        if (isSuperAdmin) {
          if (superMasterBtn) superMasterBtn.classList.remove("d-none");
          if (userRoleEl) userRoleEl.innerText = "Super Admin";
        } else {
          if (superMasterBtn) superMasterBtn.classList.add("d-none");
          if (userRoleEl) {
              if (currentUserRole === "admin") {
                  userRoleEl.innerText = window.currentLang === 'ml' ? "അഡ്മിൻ" : "Admin";
              } else if (currentUserRole === "principal") {
                  userRoleEl.innerText = window.currentLang === 'ml' ? "സ്വദർ മുഅല്ലിം" : "Principal";
              } else {
                  userRoleEl.innerText = `Teacher (${currentUserAssignedClasses.map(c=>'Class '+c).join(', ')})`;
              }
          }
        }

        // Reset visibility for all menus first
        if (tMenuBtn) tMenuBtn.classList.add("d-none");
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


        if (currentUserRole === "admin") {
            // Institution Admin View
            if (instAdminStaffBtn) instAdminStaffBtn.classList.remove("d-none");
            if (tMenuBtn) tMenuBtn.classList.remove("d-none"); // Show Staff Management for Admin
            // Hide other menus until needed
            if (homeMenuBtn) homeMenuBtn.classList.add("d-none");
            if (studentsMenuBtn) studentsMenuBtn.classList.add("d-none");
            if (attendanceMenuBtn) attendanceMenuBtn.classList.add("d-none");
            if (marksMenuBtn) marksMenuBtn.classList.add("d-none");
            if (performanceMenuBtn) performanceMenuBtn.classList.add("d-none");
            if (feesMenuBtn) feesMenuBtn.classList.add("d-none");
            showTab('instAdminTab');
            loadPrincipalsList();

        } else if (currentUserRole === "principal" || isSuperAdmin) {
            // Principal or Super Admin viewing a Madrasa
          if (tMenuBtn) tMenuBtn.classList.remove("d-none");
          if (pMenuBtn) pMenuBtn.classList.remove("d-none");
          if (adminActions) adminActions.classList.remove("d-none");
          if (actionCol) actionCol.classList.remove("d-none");
        } else {
            // Teacher View
            // Menus are already hidden by default reset above
        }

        document.getElementById("authSection").classList.add("d-none");
        document.getElementById("appSection").classList.remove("d-none");
        
        const attDateEl = document.getElementById("attDate");
        if (attDateEl) attDateEl.valueAsDate = new Date();

        populateClassDropdowns();
        syncMobileMenu();

        if (isSuperAdmin) {
          showTab('superAdminTab');
        } else if (currentUserRole !== "admin") {
          showTab('homeDashboardTab');
          loadLeaderboard();
          if (currentUserRole === "principal") loadTeachersList();
        }
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
  const allowedClasses = (currentUserRole === "principal" || isSuperAdmin) ? allClasses : currentUserAssignedClasses;

  const filterSelect = document.getElementById("filterClassSelect");
  if (filterSelect) {
    filterSelect.innerHTML = "";
    if (currentUserRole === "principal" || isSuperAdmin) filterSelect.innerHTML += `<option value="ALL">All Classes</option>`;
    allowedClasses.forEach(c => filterSelect.innerHTML += `<option value="${c}">Class ${c}</option>`);
    if (currentUserRole !== "principal" && !isSuperAdmin && allowedClasses.length === 1) filterSelect.value = allowedClasses[0];
  }

  const dropdowns = ["attClassSelect", "markClassSelect", "perfClassSelect", "feeClassSelect"];
  dropdowns.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = "";
      if (allowedClasses.length > 1 || currentUserRole === "principal" || isSuperAdmin) {
        select.innerHTML = `<option value="">-- Select Class --</option>`;
      }
      allowedClasses.forEach(c => select.innerHTML += `<option value="${c}">Class ${c}</option>`);

      if (currentUserRole !== "principal" && !isSuperAdmin && allowedClasses.length === 1) {
        select.value = allowedClasses[0];
        if (id === "attClassSelect") loadAttendanceSheet();
        if (id === "markClassSelect") loadMarksEntrySheet();
        if (id === "perfClassSelect") loadStudentsForPerfSheet();
        if (id === "feeClassSelect") loadStudentsForFees();
      }
    }
  });
}

// Unified Smart Login
let parentStudentsData = [];
window.handleUnifiedLogin = async (e) => {
  e.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim();

  if (/^\d+$/.test(identifier)) {
    // Parent / Student Login
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
      if (sPhone === mobile) {
          matchedStudent = {id: d.id, ...data};
      }
    });

    if (!matchedStudent) return alert("Provided phone number does not match student's records.");

    // Now, let's find siblings
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

    // Populate dropdown
    const studentSelect = document.getElementById("parentStudentSelect");
    studentSelect.innerHTML = "";
    parentStudentsData.forEach(student => {
        const option = document.createElement("option");
        option.value = student.regNo;
        option.text = `${student.name} (Reg No: ${student.regNo})`;
        if (student.regNo === reg) {
            option.selected = true;
        }
        studentSelect.appendChild(option);
    });

    // Load data for the selected student
    loadParentStudentData(matchedStudent);

  } else {
    // Teacher / Admin Login
    const email = identifier;
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
    if (selectedStudent) {
        loadParentStudentData(selectedStudent);
    }
}

async function loadParentStudentData(student) {
    document.getElementById("pvStudentName").innerText = student.name;
    document.getElementById("pvClass").innerText = "Class " + (student.currentClass || '').replace(/Class\s*/i, "");
    document.getElementById("pvRegNo").innerText = student.regNo;
    document.getElementById("pvFather").innerText = student.fatherName || student.guardianName || '-';

    const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", student.institutionId), where("regNo", "==", student.regNo));
    const feeSnap = await getDocs(feeQ);
    let feeHtml = "";
    feeSnap.forEach(fd => {
      const f = fd.data();
      feeHtml += `<tr><td>#${f.receiptNo}</td><td>${f.date || '-'}</td><td>${f.feeType}</td><td class="fw-bold text-success">₹${f.amount}</td></tr>`;
    });
    document.getElementById("pvFeeTableBody").innerHTML = feeHtml || `<tr><td colspan="4" class="text-center text-muted">No fee records found</td></tr>`;

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

// Institution Registration
window.handleSignUp = async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("btnSubmitSignup");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const instCode = document.getElementById("regInstCode").value.trim().toUpperCase();
    const instName = document.getElementById("regInstName").value.trim();
    const userName = document.getElementById("regUserName").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pwd = document.getElementById("regPassword").value;
    const instId = "MDR_" + instCode;

    const isDev = (email === SUPER_ADMIN_EMAIL);
    const cred = await createUserWithEmailAndPassword(auth, email, pwd);
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name: userName,
      phone: phone,
      email: email,
      institutionId: instId,
      institutionCode: instCode,
      institutionName: instName,
      role: "admin", // Institution Admin
      status: isDev ? "active" : "pending",
      assignedClasses: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      createdAt: serverTimestamp()
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

// Staff Registration (Self-Sign Up)
window.handleStaffSignUp = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("btnStaffSubmitSignup");
    if (submitBtn) submitBtn.disabled = true;
  
    try {
      const instCode = document.getElementById("staffInstCode").value.trim().toUpperCase();
      const userName = document.getElementById("staffName").value.trim();
      const phone = document.getElementById("staffPhone").value.trim();
      const email = document.getElementById("staffEmail").value.trim();
      const pwd = document.getElementById("staffPassword").value;
      const instId = "MDR_" + instCode;
  
      // Verify if the institution exists
      const instQuery = query(collection(db, "users"), where("institutionId", "==", instId), where("role", "==", "admin"));
      const instSnap = await getDocs(instQuery);
  
      if (instSnap.empty) {
          alert("Madrasa Code not found. Please check with your Institution Admin.");
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
        email: email,
        institutionId: instId,
        institutionCode: instCode,
        institutionName: instName,
        role: "teacher", // Default role for staff signups
        status: "pending", // Requires admin approval
        assignedClasses: [],
        createdAt: serverTimestamp()
      });
  
      document.getElementById("staffSignupForm").reset();
      alert("Staff Registration submitted successfully! Please wait for your Institution Admin to approve.");
      signOut(auth);
      switchAuthTab('login');
  
    } catch (err) { 
      alert("Registration failed: " + err.message); 
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  };

// Load Super Admin Madrasa Master List
window.loadSuperAdminRequests = async () => {
  const tbody = document.getElementById("superAdminTableBody");
  tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading registered madrasas...</td></tr>`;

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
  localMadrasasCache.forEach(u => {
    const isPending = (u.status === "pending");
    const statusBadge = isPending 
      ? `<span class="badge bg-warning text-dark">Pending</span>` 
      : `<span class="badge bg-success">Active</span>`;

    const approveOrManageBtn = isPending 
      ? `<button class="btn btn-sm btn-success me-1" onclick="approveMadrasa('${u.id}', '${u.institutionName}')" title="Approve"><i class="fa-solid fa-check"></i> Approve</button>`
      : `<button class="btn btn-sm btn-primary me-1" onclick="switchMadrasaScope('${u.institutionId}', '${u.institutionName}')" title="Manage Scope"><i class="fa-solid fa-folder-open"></i> Manage</button>`;

    html += `
      <tr>
        <td><b>${u.institutionCode || '-'}</b></td>
        <td><b>${u.institutionName || '-'}</b></td>
        <td>${u.name || '-'}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>${statusBadge}</td>
        <td class="text-center">
          ${approveOrManageBtn}
          <button class="btn btn-sm btn-outline-secondary me-1" onclick="openSuperAdminEditMadrasaModal('${u.id}')" title="Edit Details"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="rejectMadrasa('${u.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html || `<tr><td colspan="7" class="text-center text-muted">No madrasa accounts found.</td></tr>`;
};

// Super Admin Switch Scope
window.switchMadrasaScope = (instId, instName) => {
  currentInstitutionId = instId;
  document.getElementById("displayMadrassaName").innerText = instName + " (Super Admin View)";
  document.getElementById("superAdminBackBtn").classList.remove("d-none");
  showTab('homeDashboardTab');
  loadLeaderboard();
  loadTeachersList();
};

window.returnToSuperAdminConsole = () => {
  document.getElementById("displayMadrassaName").innerText = "Smart Madrasa - Master Control Center";
  document.getElementById("superAdminBackBtn").classList.add("d-none");
  showTab('superAdminTab');
};

window.openSuperAdminEditMadrasaModal = (docId) => {
  const m = localMadrasasCache.find(x => x.id === docId);
  if (!m) return;

  document.getElementById("saEditDocId").value = docId;
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
  const code = document.getElementById("saEditInstCode").value.trim().toUpperCase();
  const instName = document.getElementById("saEditInstName").value.trim();
  const name = document.getElementById("saEditName").value.trim();
  const email = document.getElementById("saEditEmail").value.trim();
  const phone = document.getElementById("saEditPhone").value.trim();
  const status = document.getElementById("saEditStatus").value;

  try {
    await updateDoc(doc(db, "users", docId), {
      institutionCode: code,
      institutionName: instName,
      name: name,
      email: email,
      phone: phone,
      status: status,
      updatedAt: serverTimestamp()
    });
    alert("Madrasa details updated successfully.");
    bootstrap.Modal.getInstance(document.getElementById('superAdminEditMadrasaModal')).hide();
    loadSuperAdminRequests();
  } catch (err) { alert("Error: " + err.message); }
};

window.approveMadrasa = async (userId, instName) => {
  if (confirm(`Approve registration for ${instName}?`)) {
    await updateDoc(doc(db, "users", userId), { status: "active" });
    alert("Madrasa approved successfully!");
    loadSuperAdminRequests();
  }
};

window.rejectMadrasa = async (userId) => {
  if (confirm(`Delete this madrasa account?`)) {
    await deleteDoc(doc(db, "users", userId));
    alert("Madrasa account deleted.");
    loadSuperAdminRequests();
  }
};

window.logoutParent = () => {
  sessionStorage.removeItem("parentLoggedIn");
  document.getElementById("parentViewSection").classList.add("d-none");
  document.getElementById("authSection").classList.remove("d-none");
};

window.handleLogout = () => signOut(auth);


// Registration for Principal (By Inst Admin)
window.registerPrincipal = async (e) => {
    e.preventDefault();
    const name = document.getElementById("pName").value.trim();
    const phone = document.getElementById("pPhone").value.trim();
    const email = document.getElementById("pEmail").value.trim();
    const pwd = document.getElementById("pPassword").value;

    try {
        // Create user in Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, email, pwd);
        
        // Save user data in Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            name: name,
            phone: phone,
            email: email,
            institutionId: currentInstitutionId,
            role: "principal",
            assignedClasses: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            status: "active",
            createdAt: serverTimestamp()
        });

        alert("Principal registered successfully!");
        e.target.reset();
        loadPrincipalsList();

    } catch (err) {
        alert("Registration failed: " + err.message);
    }
};

// Load Principals List for Inst Admin
window.loadPrincipalsList = async () => {
    const tbody = document.getElementById("principalsTableBody");
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Loading...</td></tr>`;

    const q = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId), where("role", "==", "principal"));
    const snap = await getDocs(q);

    localPrincipalsCache = [];
    snap.forEach(d => localPrincipalsCache.push({ id: d.id, ...d.data() }));

    let html = "";
    localPrincipalsCache.forEach(p => {
        html += `
            <tr>
                <td><b>${p.name}</b></td>
                <td>${p.email}</td>
                <td>${p.phone}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${p.id}', '${p.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html || `<tr><td colspan="4" class="text-center text-muted">No principals assigned yet.</td></tr>`;
};


// Admission, Students, Marks, Attendance, Fees Logic
window.saveDetailedStudent = async (e) => {
  e.preventDefault();
  try {
    await addDoc(collection(db, "students"), {
      institutionId: currentInstitutionId,
      regNo: Number(document.getElementById("regNo").value) || 0,
      idNo: document.getElementById("idNo").value,
      name: document.getElementById("studentName").value,
      currentClass: (document.getElementById("currentClass").value || "1").replace(/Class\s*/i, "").trim(),
      dob: document.getElementById("dob").value,
      joinedDate: document.getElementById("joinedDate").value,
      joinedClass: document.getElementById("joinedClass").value,
      fatherName: document.getElementById("fatherName").value,
      motherName: document.getElementById("motherName").value,
      guardianName: document.getElementById("guardianName").value,
      phone: document.getElementById("parentPhone").value,
      place: document.getElementById("place").value,
      address: document.getElementById("address").value,
      status: "active",
      createdAt: serverTimestamp()
    });
    alert("Student registered successfully.");
    e.target.reset();
    loadStudentsByClass(true);
    showTab('studentsListTab');
  } catch (err) { alert("Error: " + err.message); }
};

window.openEditStudentModal = (docId) => {
  const s = localStudentsCache.find(x => x.id === docId);
  if (!s) return;
  document.getElementById("editDocId").value = docId;
  document.getElementById("editRegNo").value = s.regNo || '';
  document.getElementById("editIdNo").value = s.idNo || '';
  document.getElementById("editName").value = s.name || '';
  document.getElementById("editCurrentClass").value = (s.currentClass || '1').replace(/Class\s*/i, "").trim();
  document.getElementById("editDob").value = s.dob || '';
  document.getElementById("editPhone").value = s.phone || '';
  document.getElementById("editFatherName").value = s.fatherName || s.guardianName || '';
  document.getElementById("editPlace").value = s.place || '';
  document.getElementById("editAddress").value = s.address || '';
  new bootstrap.Modal(document.getElementById('studentEditModal')).show();
};

window.saveEditedStudent = async (e) => {
  e.preventDefault();
  const docId = document.getElementById("editDocId").value;
  try {
    await updateDoc(doc(db, "students", docId), {
      regNo: Number(document.getElementById("editRegNo").value) || 0,
      idNo: document.getElementById("editIdNo").value,
      name: document.getElementById("editName").value,
      currentClass: (document.getElementById("editCurrentClass").value || '1').replace(/Class\s*/i, "").trim(),
      dob: document.getElementById("editDob").value,
      phone: document.getElementById("editPhone").value,
      fatherName: document.getElementById("editFatherName").value,
      place: document.getElementById("editPlace").value,
      address: document.getElementById("editAddress").value,
      updatedAt: serverTimestamp()
    });
    alert("Student details updated successfully.");
    bootstrap.Modal.getInstance(document.getElementById('studentEditModal')).hide();
    loadStudentsByClass(true);
  } catch (err) { alert("Error: " + err.message); }
};

window.deleteStudent = async (docId, name) => {
  if (confirm(`Are you sure you want to delete ${name}?`)) {
    try {
      await deleteDoc(doc(db, "students", docId));
      alert("Student removed.");
      loadStudentsByClass(true);
    } catch (err) { alert("Error: " + err.message); }
  }
};

window.loadStudentsByClass = async (forceRefresh = false) => {
  let selectedClass = document.getElementById("filterClassSelect").value;
  if (currentUserRole !== "principal" && !isSuperAdmin && (!selectedClass || selectedClass === "ALL")) {
    selectedClass = currentUserAssignedClasses[0] || "1";
    document.getElementById("filterClassSelect").value = selectedClass;
  }

  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading data...</td></tr>`;

  let q;
  if (selectedClass === "ALL" && (currentUserRole === "principal" || isSuperAdmin)) {
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
    const actionCol = (currentUserRole === "principal" || isSuperAdmin) ? `
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditStudentModal('${s.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s.id}', '${s.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
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
    const actionCol = (currentUserRole === "principal" || isSuperAdmin) ? `
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditStudentModal('${s.id}')"><i class="fa-solid fa-pen"></i></button>
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

// Bulk Performance Entry
window.loadStudentsForPerfSheet = async () => {
  const selClass = document.getElementById("perfClassSelect").value;
  if (!selClass) { document.getElementById("perfSheetArea").classList.add("d-none"); return; }

  const area = document.getElementById("perfSheetArea");
  const tbody = document.getElementById("perfTableBody");
  tbody.innerHTML = `<tr><td colspan="3" class="text-center">Loading students...</td></tr>`;
  area.classList.remove("d-none");

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()));
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

  if (!count) return alert("Please select at least one student.");

  try {
    await batch.commit();
    alert(`Successfully awarded '${taskTitle}' points to ${count} students.`);
    
    document.getElementById("perfSheetArea").classList.add("d-none");
    document.getElementById("perfTableBody").innerHTML = "";
    document.getElementById("perfClassSelect").value = "";
    const searchInput = document.getElementById("perfStudentSearch");
    if (searchInput) searchInput.value = "";
    
    loadLeaderboard();
  } catch (err) { alert("Error: " + err.message); }
};

window.addNewCustomTask = (e) => {
  e.preventDefault();
  const name = document.getElementById("newTaskName").value.trim();
  const pts = document.getElementById("newTaskPoints").value.trim();
  const sign = Number(pts) > 0 ? `+${pts}` : pts;
  const formattedValue = `${name} (${sign} Pts)|${pts}`;

  const select = document.getElementById("perfTaskSelect");
  const newOption = new Option(`${name} (${sign} Pts)`, formattedValue, true, true);
  select.add(newOption, 0);

  bootstrap.Modal.getInstance(document.getElementById('customTaskModal')).hide();
  e.target.reset();
  alert("New task added.");
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

// Attendance
window.loadAttendanceSheet = async () => {
  const selClass = document.getElementById("attClassSelect").value;
  if (!selClass) { document.getElementById("attendanceSheetArea").classList.add("d-none"); return; }

  const area = document.getElementById("attendanceSheetArea");
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = `<tr><td colspan="3" class="text-center">Loading students...</td></tr>`;
  area.classList.remove("d-none");

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()));
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
  tbody.innerHTML = html || `<tr><td colspan="3" class="text-center">No students in this class.</td></tr>`;
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
};

window.saveClassAttendance = async () => {
  const date = document.getElementById("attDate").value;
  const selClass = document.getElementById("attClassSelect").value;
  if (!date || !selClass) return alert("Select date and class.");

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
    alert("Attendance recorded successfully.");
  } catch (err) { alert("Error: " + err.message); }
};

// Marks
window.loadMarksEntrySheet = async () => {
  const selClass = document.getElementById("markClassSelect").value;
  if (!selClass) { document.getElementById("marksSheetArea").classList.add("d-none"); return; }

  const area = document.getElementById("marksSheetArea");
  const tbody = document.getElementById("marksTableBody");
  tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading...</td></tr>`;
  area.classList.remove("d-none");

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()));
  const snap = await getDocs(q);

  let students = [];
  snap.forEach(d => students.push({ id: d.id, ...d.data() }));
  students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  let html = "";
  students.forEach(s => {
    html += `
      <tr data-sid="${s.id}" data-reg="${s.regNo}" data-name="${s.name}">
        <td><b>${s.regNo || '-'}</b></td>
        <td>${s.name}</td>
        <td><input type="number" class="form-control form-control-sm text-center m-quran" style="max-width:70px; margin:auto;"></td>
        <td><input type="number" class="form-control form-control-sm text-center m-tajweed" style="max-width:70px; margin:auto;"></td>
        <td><input type="number" class="form-control form-control-sm text-center m-fiqh" style="max-width:70px; margin:auto;"></td>
        <td><input type="number" class="form-control form-control-sm text-center m-aqeeda" style="max-width:70px; margin:auto;"></td>
        <td><input type="number" class="form-control form-control-sm text-center m-tareekh" style="max-width:70px; margin:auto;"></td>
        <td><input type="number" class="form-control form-control-sm text-center m-lisan" style="max-width:70px; margin:auto;"></td>
      </tr>
    `;
  });
  tbody.innerHTML = html || `<tr><td colspan="8" class="text-center">No students in this class.</td></tr>`;
};

window.saveClassMarks = async () => {
  const exam = document.getElementById("markExamSelect").value;
  const selClass = document.getElementById("markClassSelect").value;
  if (!exam || !selClass) return alert("Select exam and class.");

  const rows = document.querySelectorAll("#marksTableBody tr[data-sid]");
  const batch = writeBatch(db);

  rows.forEach(r => {
    const sid = r.getAttribute("data-sid");
    const reg = r.getAttribute("data-reg");
    const name = r.getAttribute("data-name");

    const markRef = doc(collection(db, "marks"));
    batch.set(markRef, {
      institutionId: currentInstitutionId,
      examName: exam,
      class: selClass.replace(/Class\s*/i, "").trim(),
      studentId: sid,
      regNo: Number(reg),
      studentName: name,
      scores: {
        quran: Number(r.querySelector(".m-quran").value) || 0,
        tajweed: Number(r.querySelector(".m-tajweed").value) || 0,
        fiqh: Number(r.querySelector(".m-fiqh").value) || 0,
        aqeeda: Number(r.querySelector(".m-aqeeda").value) || 0,
        tareekh: Number(r.querySelector(".m-tareekh").value) || 0,
        lisan: Number(r.querySelector(".m-lisan").value) || 0
      },
      timestamp: serverTimestamp()
    });
  });

  try {
    await batch.commit();
    alert("Marks saved successfully.");
  } catch (err) { alert("Error: " + err.message); }
};

// Fees
window.loadStudentsForFees = async () => {
  const selClass = document.getElementById("feeClassSelect").value;
  const select = document.getElementById("feeStudentSelect");
  if (!selClass) { select.innerHTML = `<option value="">-- Select Class --</option>`; return; }

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()));
  const snap = await getDocs(q);

  let html = `<option value="">-- Select Student --</option>`;
  snap.forEach(d => {
    const s = d.data();
    html += `<option value="${d.id}" data-reg="${s.regNo}" data-name="${s.name}" data-class="${s.currentClass}" data-phone="${s.phone || ''}">Reg: ${s.regNo} - ${s.name}</option>`;
  });
  select.innerHTML = html;
};

window.processFeeReceipt = async (e) => {
  e.preventDefault();
  const sSelect = document.getElementById("feeStudentSelect");
  const opt = sSelect.options[sSelect.selectedIndex];
  if (!opt || !opt.value) return alert("Select student.");

  const sId = opt.value;
  const reg = opt.getAttribute("data-reg");
  const name = opt.getAttribute("data-name");
  const sClass = opt.getAttribute("data-class");
  const phone = opt.getAttribute("data-phone");
  const amount = document.getElementById("feeAmount").value;
  const type = document.getElementById("feeType").value;
  const manual = document.getElementById("manualReceipt").value.trim();
  const today = new Date().toLocaleDateString();

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
      feeType: type,
      manualReceiptNo: manual,
      date: today,
      collectedBy: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });

    document.getElementById("recMadrassaName").innerText = document.getElementById("displayMadrassaName").innerText;
    document.getElementById("recNo").innerText = "#" + nextReceiptNo;
    document.getElementById("recDate").innerText = today;
    document.getElementById("recStudentName").innerText = name;
    document.getElementById("recAdmNo").innerText = reg;
    document.getElementById("recClass").innerText = "Class " + sClass;
    document.getElementById("recFeeType").innerText = type;
    document.getElementById("recAmount").innerText = "₹" + amount;

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
      type: type,
      manual: manual,
      date: today
    };

    document.getElementById("whatsappShareBtn").classList.remove("d-none");

    document.getElementById("printableReceipt").classList.remove("d-none");
    window.print();
    document.getElementById("printableReceipt").classList.add("d-none");

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
  msg += `Type: ${p.type}%0A`;
  if (p.manual) msg += `Book Receipt No: ${p.manual}%0A`;
  msg += `Amount Received: *₹${p.amount}*%0A%0A`;
  msg += `_May Allah bless you_`;

  const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone.length >= 10 
    ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${msg}`
    : `https://wa.me/?text=${msg}`;

  window.open(waUrl, "_blank");
};

// Bulk CSV Import
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
          const regNum = parseInt(row["REG NO."] || row["regNo"] || 0, 10);
          const phoneVal = row["PHONE"] || row["MOBILE"] || row["PHONE NO"] || "";

          batch.set(newStudentRef, {
            institutionId: currentInstitutionId,
            regNo: isNaN(regNum) ? 0 : regNum,
            idNo: row["ID NO."] || "",
            name: row["NAME"] || "",
            currentClass: (row["CURRENT CLASS"] || "1").replace(/Class\s*/i, "").trim(),
            address: row["ADDRESS"] || "",
            place: row["PLACE"] || "",
            dob: row["D.O.B"] || "",
            fatherName: row["FATHER NAME"] || "",
            motherName: row["MOTHER NAME"] || "",
            guardianName: row["GUARDIAN NAME"] || "",
            phone: phoneVal,
            status: "active",
            createdAt: serverTimestamp()
          });
        });

        await batch.commit();
        statusDiv.className = "alert alert-success";
        statusDiv.innerText = `Successfully imported ${rows.length} students!`;
        bootstrap.Modal.getInstance(document.getElementById('bulkImportModal')).hide();
        loadStudentsByClass(true);
      } catch (err) {
        statusDiv.className = "alert alert-danger";
        statusDiv.innerText = "Error: " + err.message;
      }
    }
  });
};


// Register Teacher/Staff (By Admin directly)
window.registerNewTeacher = async (e) => {
  e.preventDefault();
  
  const name = document.getElementById("tName").value.trim();
  const phone = document.getElementById("tPhone").value.trim();
  const email = document.getElementById("tEmail").value.trim();
  const pwd = document.getElementById("tPassword").value;
  
  // Get selected classes
  const checkboxes = document.querySelectorAll('.reg-class-cb:checked');
  const assignedClasses = Array.from(checkboxes).map(cb => cb.value);

  if (assignedClasses.length === 0) {
      alert("Please select at least one class.");
      return;
  }

  try {
      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      
      // Save user data in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          name: name,
          phone: phone,
          email: email,
          institutionId: currentInstitutionId,
          role: "teacher", // They are teachers
          assignedClasses: assignedClasses,
          status: "active", // Direct registration makes them active
          createdAt: serverTimestamp()
      });

      alert("Staff registered successfully!");
      e.target.reset();
      updateDropdownLabel('reg'); // Reset dropdown label
      loadTeachersList();

  } catch (err) {
      alert("Registration failed: " + err.message);
  }
};

// Open approval form
window.openAssignClassesForm = (staffId) => {
    const staff = pendingStaffCache.find(s => s.id === staffId);
    if(staff) {
        document.getElementById("assignStaffId").value = staffId;
        document.getElementById("assignStaffNameDisplay").innerText = staff.name;
        document.getElementById("assignClassesForm").classList.remove("d-none");
        
        // Reset checkboxes
        document.querySelectorAll('.reg-class-cb').forEach(cb => cb.checked = false);
        updateDropdownLabel('reg');
    }
};

window.cancelAssignClasses = () => {
    document.getElementById("assignClassesForm").classList.add("d-none");
    document.getElementById("assignStaffId").value = "";
}

// Assign Classes and Approve
window.assignClassesToStaff = async (e) => {
    e.preventDefault();
    const staffId = document.getElementById("assignStaffId").value;
    const checkboxes = document.querySelectorAll('.reg-class-cb:checked');
    const assignedClasses = Array.from(checkboxes).map(cb => cb.value);

    if (assignedClasses.length === 0) {
        alert("Please select at least one class.");
        return;
    }

    try {
        await updateDoc(doc(db, "users", staffId), { 
            status: "active",
            assignedClasses: assignedClasses
        });
        alert("Staff approved and classes assigned successfully!");
        document.getElementById("assignClassesForm").classList.add("d-none");
        loadTeachersList(); // Reload lists
    } catch (err) {
        alert("Error: " + err.message);
    }
};


// Teachers List (Viewable by Admin/Principal)
window.loadTeachersList = async () => {
  const tbody = document.getElementById("teachersTableBody");
  const pendingTbody = document.getElementById("pendingStaffTableBody");
  const pendingSection = document.getElementById("pendingStaffSection");
  
  tbody.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;
  pendingTbody.innerHTML = `<tr><td colspan="4" class="text-center">Loading...</td></tr>`;
  
  // Load Active Teachers
  const qActive = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId), where("role", "==", "teacher"), where("status", "==", "active"));
  const snapActive = await getDocs(qActive);

  localTeachersCache = [];
  snapActive.forEach(d => localTeachersCache.push({ id: d.id, ...d.data() }));

  let htmlActive = "";
  localTeachersCache.forEach((t, index) => {
    const classesBadges = (t.assignedClasses || []).map(c => `<span class="badge bg-light text-dark border me-1">Class ${c}</span>`).join(' ') || '-';
    
    htmlActive += `
      <tr>
        <td>${index + 1}</td>
        <td><b>${t.name}</b></td>
        <td>${t.email}</td>
        <td>${t.phone}</td>
        <td>${classesBadges}</td>
        <td class="text-center">
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${t.id}', '${t.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = htmlActive || `<tr><td colspan="6" class="text-center text-muted">No active staff registered yet.</td></tr>`;

  // Load Pending Teachers (Only for Admins)
  if (currentUserRole === 'admin') {
      const qPending = query(collection(db, "users"), where("institutionId", "==", currentInstitutionId), where("role", "==", "teacher"), where("status", "==", "pending"));
      const snapPending = await getDocs(qPending);
    
      pendingStaffCache = [];
      snapPending.forEach(d => pendingStaffCache.push({ id: d.id, ...d.data() }));
    
      if (pendingStaffCache.length > 0) {
          pendingSection.classList.remove("d-none");
          let htmlPending = "";
          pendingStaffCache.forEach((t) => {
            htmlPending += `
              <tr>
                <td><b>${t.name}</b></td>
                <td>${t.email}</td>
                <td>${t.phone}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-success me-1" onclick="openAssignClassesForm('${t.id}')" title="Approve & Assign Class"><i class="fa-solid fa-check"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${t.id}', '${t.name}')" title="Reject"><i class="fa-solid fa-xmark"></i></button>
                </td>
              </tr>
            `;
          });
          pendingTbody.innerHTML = htmlPending;
      } else {
           pendingSection.classList.add("d-none");
      }
  }
};


window.deleteUser = async (userId, name) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
        try {
            await deleteDoc(doc(db, "users", userId));
            alert(`${name} removed successfully.`);
            
            // Reload the respective list based on current view
            if (currentUserRole === 'admin') {
                loadPrincipalsList();
                loadTeachersList();
            } else if (currentUserRole === 'principal') {
                loadTeachersList();
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    }
};

window.promoteStudents = async () => {
  const from = document.getElementById("fromClass").value;
  const to = document.getElementById("toClass").value;
  if (confirm(`Promote all students from Class ${from} to Class ${to}?`)) {
    const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", from));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach(d => batch.update(doc(db, "students", d.id), { currentClass: to }));
    await batch.commit();
    alert(`Students promoted to Class ${to}.`);
    loadStudentsByClass(true);
  }
};

window.switchAuthTab = (type) => {
  document.getElementById("loginForm").classList.add("d-none");
  document.getElementById("signupForm").classList.add("d-none");
  document.getElementById("staffSignupForm").classList.add("d-none");

  document.getElementById("tabBtnLogin").classList.remove("active");
  document.getElementById("tabBtnRegister").classList.remove("active");
  document.getElementById("tabBtnStaffRegister").classList.remove("active");


  if (type === 'login') {
    document.getElementById("loginForm").classList.remove("d-none");
    document.getElementById("tabBtnLogin").classList.add("active");
  } else if (type === 'signup') {
    document.getElementById("signupForm").classList.remove("d-none");
    document.getElementById("tabBtnRegister").classList.add("active");
  } else if (type === 'staffSignup') {
    document.getElementById("staffSignupForm").classList.remove("d-none");
    document.getElementById("tabBtnStaffRegister").classList.add("active");
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
  if (tabId === 'teachersTab') window.loadTeachersList();
  if (tabId === 'instAdminTab') window.loadPrincipalsList();
  if (tabId === 'homeDashboardTab') loadLeaderboard();
  if (tabId === 'superAdminTab') window.loadSuperAdminRequests();
};
