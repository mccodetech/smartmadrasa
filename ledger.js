// ==========================================
// FEE LEDGER MODULE (ledger.js)
// ==========================================
import { db, auth } from "./firebase-config.js";
import { 
  collection, doc, getDocs, query, where, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.loadFeeLedgerSummary = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const currentUserId = auth.currentUser ? auth.currentUser.uid : "";
  const currentUserRole = window.currentUserRole || sessionStorage.getItem("currentUserRole");

  try {
    // 1. കളക്ട് ചെയ്ത ആകെ തുക
    let feeQuery = query(collection(db, "feeCollections"), where("institutionId", "==", currentInstitutionId));
    if (currentUserRole === "teacher") {
      feeQuery = query(collection(db, "feeCollections"), where("institutionId", "==", currentInstitutionId), where("collectedBy", "==", currentUserId));
    }
    
    const feeSnap = await getDocs(feeQuery);
    let totalCollected = 0;
    feeSnap.forEach(d => {
      totalCollected += Number(d.data().amount) || 0;
    });

    // 2. കൈമാറിയ ആകെ തുക (Handover)
    let handoverQuery = query(collection(db, "feeHandovers"), where("institutionId", "==", currentInstitutionId));
    if (currentUserRole === "teacher") {
      handoverQuery = query(collection(db, "feeHandovers"), where("institutionId", "==", currentInstitutionId), where("collectedBy", "==", currentUserId));
    }

    const handoverSnap = await getDocs(handoverQuery);
    let totalHandover = 0;
    let handoverHtml = "";

    handoverSnap.forEach(d => {
      const h = d.data();
      totalHandover += Number(h.amount) || 0;
      handoverHtml += `
        <tr>
          <td>${h.date}</td>
          <td>${h.collectedByName}</td>
          <td class="fw-bold text-success">${h.receiver}</td>
          <td class="fw-bold">₹${h.amount}</td>
        </tr>
      `;
    });

    const balance = totalCollected - totalHandover;

    if (document.getElementById("ledgerCollectedTotal")) document.getElementById("ledgerCollectedTotal").innerText = `₹${totalCollected}`;
    if (document.getElementById("ledgerHandoverTotal")) document.getElementById("ledgerHandoverTotal").innerText = `₹${totalHandover}`;
    if (document.getElementById("ledgerBalanceTotal")) document.getElementById("ledgerBalanceTotal").innerText = `₹${balance}`;
    if (document.getElementById("handoverTableBody")) {
      document.getElementById("handoverTableBody").innerHTML = handoverHtml || `<tr><td colspan="4" class="text-center text-muted">No handover records found.</td></tr>`;
    }

  } catch (err) {
    console.error("Error loading fee ledger:", err);
  }
};

window.openHandoverModal = () => {
  const form = document.getElementById("handoverForm");
  if (form) form.reset();
  const modalEl = document.getElementById("handoverModal");
  if (modalEl && window.bootstrap) {
    new bootstrap.Modal(modalEl).show();
  }
};

window.saveFeeHandover = async (e) => {
  e.preventDefault();
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const currentUserId = auth.currentUser ? auth.currentUser.uid : "";
  const currentUserName = window.currentUserName || "Staff";
  
  const receiver = document.getElementById("handoverReceiver").value.trim().toUpperCase();
  const amount = Number(document.getElementById("handoverAmount").value) || 0;
  const today = new Date().toLocaleDateString();

  if (amount <= 0) return window.showToast("Enter a valid amount", "warning");

  try {
    await addDoc(collection(db, "feeHandovers"), {
      institutionId: currentInstitutionId,
      collectedBy: currentUserId,
      collectedByName: currentUserName,
      receiver,
      amount,
      date: today,
      timestamp: serverTimestamp()
    });

    const modalEl = document.getElementById("handoverModal");
    if (modalEl && window.bootstrap) {
      bootstrap.Modal.getInstance(modalEl).hide();
    }
    window.showToast("Handover recorded successfully!", "success");
    window.loadFeeLedgerSummary();
  } catch (err) {
    window.showToast("Error: " + err.message, "error");
  }
};
