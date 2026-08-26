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
