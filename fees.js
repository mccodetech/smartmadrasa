// ==========================================
// FEES MANAGEMENT MODULE (fees.js) - Complete
// ==========================================
import { db, auth } from "./firebase-config.js";
import { 
  collection, doc, setDoc, getDocs, query, where, addDoc, runTransaction, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ALL_MONTHS = ["APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"];
let lastReceiptWhatsAppPayload = null;

// സ്പെഷ്യൽ ഫണ്ട് കാറ്റഗറി ആഡ് ചെയ്യാൻ
window.addSpecialFundCategory = () => {
  const input = document.getElementById("newSpecialFundInput");
  if (!input) return;
  const val = input.value.trim().toUpperCase();
  if (!val) return window.showToast("Enter fund name", "warning");

  if (!window.customSpecialFunds) window.customSpecialFunds = [];
  if (!window.customSpecialFunds.includes(val)) {
    window.customSpecialFunds.push(val);
    input.value = "";
    renderSpecialFundCategoriesList();
    window.showToast("Added category. Click Save Settings.", "success");
  } else {
    window.showToast("Category already exists", "warning");
  }
};

window.removeSpecialFundCategory = (catName) => {
  if (!window.customSpecialFunds) return;
  window.customSpecialFunds = window.customSpecialFunds.filter(c => c !== catName);
  renderSpecialFundCategoriesList();
  window.showToast("Removed. Click Save Settings.", "warning");
};

function renderSpecialFundCategoriesList() {
  const listEl = document.getElementById("specialFundCategoriesList");
  if (!listEl) return;
  const funds = window.customSpecialFunds || [];
  if (funds.length === 0) {
    listEl.innerHTML = `<li class="list-group-item text-muted">No custom special funds added.</li>`;
    return;
  }
  let html = "";
  funds.forEach(cat => {
    html += `<li class="list-group-item d-flex justify-content-between align-items-center">
      <b>${cat}</b>
      <button type="button" class="btn btn-sm text-danger p-0" onclick="removeSpecialFundCategory('${cat}')"><i class="fa-solid fa-trash"></i></button>
    </li>`;
  });
  listEl.innerHTML = html;
}

// ഫീസ് കാറ്റഗറി മാറുമ്പോൾ സ്പെഷ്യൽ ഫണ്ട് ഡ്രോപ്ഡൗൺ കാണിക്കാൻ
window.toggleFeeCategoryOptions = () => {
  const category = document.getElementById("payFeeCategory")?.value;
  const monthDiv = document.getElementById("monthSelectionDiv");
  const specialDiv = document.getElementById("specialFeeTypeDiv");
  const specialSelect = document.getElementById("paySpecialFeeSelect");

  if (category === "Monthly Fee") {
    if (monthDiv) monthDiv.classList.remove("d-none");
    if (specialDiv) specialDiv.classList.add("d-none");
  } else if (category === "Special Fee / Fund") {
    if (monthDiv) monthDiv.classList.add("d-none");
    if (specialDiv) specialDiv.classList.remove("d-none");
    
    let html = "";
    const funds = window.customSpecialFunds || [];
    if (funds.length > 0) {
      funds.forEach(f => html += `<option value="${f}">${f}</option>`);
    } else {
      html = `<option value="GENERAL FUND">GENERAL FUND</option><option value="BUILDING FUND">BUILDING FUND</option>`;
    }
    if (specialSelect) specialSelect.innerHTML = html;
  } else {
    if (monthDiv) monthDiv.classList.add("d-none");
    if (specialDiv) specialDiv.classList.add("d-none");
  }
  window.calculateFeeAmount();
};

// ക്ലാസ് സെലക്ട് ചെയ്യുമ്പോൾ കുട്ടികളുടെ ഫീസ് വിവരങ്ങൾ ലോഡ് ചെയ്യാൻ
window.loadStudentsForFees = async () => {
  const selClass = document.getElementById("feeClassSelect")?.value;
  const tableArea = document.getElementById("feesTableArea");
  const tbody = document.getElementById("feesTableBody");
  const alertArea = document.getElementById("feeCollectionAlert");
  const collectionArea = document.getElementById("feeCollectionArea");
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const currentUserRole = window.currentUserRole || sessionStorage.getItem("currentUserRole");
  const sysFeePermission = window.sysFeePermission || "all";

  let canCollect = (currentUserRole === "admin") || 
                   (currentUserRole === "principal" && (sysFeePermission === "principal" || sysFeePermission === "all")) || 
                   (currentUserRole === "teacher" && sysFeePermission === "all");

  if (!canCollect) {
    if (alertArea) alertArea.classList.remove("d-none");
    if (collectionArea) collectionArea.classList.add("d-none");
    return;
  } else {
    if (alertArea) alertArea.classList.add("d-none");
    if (collectionArea) collectionArea.classList.remove("d-none");
  }

  if (!selClass) { if (tableArea) tableArea.classList.add("d-none"); return; }
  if (tableArea) tableArea.classList.remove("d-none");
  if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading student fee status...</td></tr>`;

  const cleanClass = selClass.replace(/Class\s*/i, "").trim();

  try {
    const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", cleanClass), where("status", "==", "active"));
    const snap = await getDocs(q);

    let students = [];
    snap.forEach(d => students.push({ id: d.id, ...d.data() }));
    students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

    if (students.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No active students in this class.</td></tr>`;
      return;
    }

    const feeQ = query(collection(db, "feeCollections"), where("institutionId", "==", currentInstitutionId), where("class", "==", cleanClass));
    const feeSnap = await getDocs(feeQ);
    
    let studentPaidMonths = {};
    feeSnap.forEach(d => {
      const f = d.data();
      if (f.regNo) {
        if (!studentPaidMonths[f.regNo]) studentPaidMonths[f.regNo] = new Set();
        ALL_MONTHS.forEach(m => {
          if (f.feeType && f.feeType.includes(m)) studentPaidMonths[f.regNo].add(m);
        });
      }
    });

    let html = "";
    students.forEach(s => {
      const defaultFee = s.monthlyFeeAmount || s.monthlyFee || 200;
      const paidSet = studentPaidMonths[s.regNo] || new Set();

      let monthBadges = `<div class="d-flex flex-wrap gap-1">`;
      ALL_MONTHS.forEach(m => {
        if (paidSet.has(m)) monthBadges += `<span class="badge bg-success" style="font-size:0.7rem;">${m}</span>`;
        else monthBadges += `<span class="badge bg-light text-danger border border-danger" style="font-size:0.7rem;">${m}</span>`;
      });
      monthBadges += `</div>`;

      const sDataStr = encodeURIComponent(JSON.stringify({
        id: s.id, regNo: s.regNo, name: s.name, class: s.currentClass, phone: s.phone || '', fee: defaultFee
      }));

      html += `
        <tr>
          <td><b>${s.regNo || '-'}</b></td>
          <td><b>${s.name}</b></td>
          <td class="text-primary fw-bold">₹${defaultFee}</td>
          <td>${monthBadges}</td>
          <td class="text-center"><button class="btn btn-sm btn-success w-100" onclick="openFeeModal('${sDataStr}')"><i class="fa-solid fa-indian-rupee-sign me-1"></i> Pay Fee</button></td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;

  } catch (err) {
    console.error("Error loading fee data:", err);
    window.showToast("Error loading fee details: " + err.message, "error");
  }
};

window.calculateFeeAmount = () => {
  const category = document.getElementById("payFeeCategory")?.value;
  const baseFee = Number(document.getElementById("payBaseFee")?.value) || 0;
  const monthDiv = document.getElementById("monthSelectionDiv");
  let total = 0;

  if (category === "Monthly Fee") {
    if (monthDiv) monthDiv.classList.remove("d-none");
    const checkedCount = document.querySelectorAll(".month-cb:checked").length;
    total = baseFee * checkedCount;
  } else {
    if (monthDiv) monthDiv.classList.add("d-none");
    total = baseFee;
  }
  const payAmtEl = document.getElementById("payAmount");
  if (payAmtEl) payAmtEl.value = total;
};

// ഫീസ് മോഡൽ സുരക്ഷിതമായി ഓപ്പൺ ചെയ്യാൻ
window.openFeeModal = (studentDataStr) => {
  const s = JSON.parse(decodeURIComponent(studentDataStr));
  const feeForm = document.getElementById("feePaymentForm");
  if (feeForm && typeof feeForm.reset === 'function') {
    feeForm.reset();
  }

  const sId = document.getElementById("payStudentId");
  const sReg = document.getElementById("payStudentReg");
  const sName = document.getElementById("payStudentName");
  const sClass = document.getElementById("payStudentClass");
  const sPhone = document.getElementById("payStudentPhone");
  const baseFee = document.getElementById("payBaseFee");
  const nameDisplay = document.getElementById("payStudentNameDisplay");
  const feeCategory = document.getElementById("payFeeCategory");

  if (sId) sId.value = s.id;
  if (sReg) sReg.value = s.regNo;
  if (sName) sName.value = s.name;
  if (sClass) sClass.value = s.class;
  if (sPhone) sPhone.value = s.phone;
  if (baseFee) baseFee.value = s.fee;
  if (nameDisplay) nameDisplay.innerText = `${s.name} (Reg: ${s.regNo})`;
  if (feeCategory) feeCategory.value = "Monthly Fee";
  
  window.toggleFeeCategoryOptions();

  const manualInput = document.getElementById("payManualReceiptInput");
  const sysReqManualReceipt = window.sysReqManualReceipt || false;
  if (manualInput) {
    manualInput.required = sysReqManualReceipt;
    manualInput.placeholder = sysReqManualReceipt ? "Required" : "Optional";
  }

  window.calculateFeeAmount();

  const modalEl = document.getElementById("feePaymentModal");
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
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
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const currentUserName = window.currentUserName || "Staff";

  let finalFeeTypeStr = category;
  let specificFundName = "";

  if (category === "Monthly Fee") {
    const checkedMonths = Array.from(document.querySelectorAll(".month-cb:checked")).map(cb => cb.value);
    if (checkedMonths.length === 0) return window.showToast("Select at least one month.", "warning");
    finalFeeTypeStr = `Monthly Fee (${academicYear}): ${checkedMonths.join(', ')}`;
  } else if (category === "Special Fee / Fund") {
    specificFundName = document.getElementById("paySpecialFeeSelect").value;
    finalFeeTypeStr = `Fund - ${specificFundName} (${academicYear})`;
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
      fundCategory: specificFundName || category,
      manualReceiptNo: manual, 
      date: today, 
      collectedBy: auth.currentUser ? auth.currentUser.uid : "unknown", 
      collectedByName: currentUserName,
      timestamp: serverTimestamp()
    });

    if (category === "Special Fee / Fund") {
      await addDoc(collection(db, "specialFunds"), {
        institutionId: currentInstitutionId,
        studentId: sId,
        regNo: Number(reg),
        donorName: name,
        class: sClass,
        fundCategory: specificFundName,
        amount: Number(amount),
        date: today,
        timestamp: serverTimestamp()
      });
    }

    const recMad = document.getElementById("recMadrassaName");
    const recNo = document.getElementById("recNo");
    const recDate = document.getElementById("recDate");
    const recStuName = document.getElementById("recStudentName");
    const recAdmNo = document.getElementById("recAdmNo");
    const recClass = document.getElementById("recClass");
    const recFeeType = document.getElementById("recFeeType");
    const recAmount = document.getElementById("recAmount");
    const recCollector = document.getElementById("recCollector");
    const displayMad = document.getElementById("displayMadrassaName");

    if (recMad && displayMad) recMad.innerText = displayMad.innerText;
    if (recNo) recNo.innerText = "#" + nextReceiptNo;
    if (recDate) recDate.innerText = today;
    if (recStuName) recStuName.innerText = name;
    if (recAdmNo) recAdmNo.innerText = reg;
    if (recClass) recClass.innerText = "Class " + sClass;
    if (recFeeType) recFeeType.innerText = finalFeeTypeStr;
    if (recAmount) recAmount.innerText = "₹" + amount;
    if (recCollector) recCollector.innerText = currentUserName;

    const manualBox = document.getElementById("recManualBox");
    const recManualNo = document.getElementById("recManualNo");
    if (manual) {
      if (recManualNo) recManualNo.innerText = manual;
      if (manualBox) manualBox.classList.remove("d-none");
    } else {
      if (manualBox) manualBox.classList.add("d-none");
    }

    lastReceiptWhatsAppPayload = { phone, madrassa: displayMad ? displayMad.innerText : "Smart Madrasa", receiptNo: nextReceiptNo, name, reg, class: sClass, amount, type: finalFeeTypeStr, manual, date: today };

    const waBtn = document.getElementById("whatsappShareBtn");
    if (waBtn) {
      if (phone) waBtn.classList.remove("d-none");
      else waBtn.classList.add("d-none");
    }

    const modalElem = document.getElementById('feePaymentModal');
    if (modalElem && window.bootstrap) {
      const modalInstance = bootstrap.Modal.getInstance(modalElem);
      if (modalInstance) modalInstance.hide();
    }

    const appSec = document.getElementById("appSection");
    const printRec = document.getElementById("printableReceipt");
    if (appSec) appSec.classList.add("d-none");
    if (printRec) printRec.classList.remove("d-none");
    
    window.loadStudentsForFees();
  } catch (err) { 
    window.showToast("Error: " + err.message, "error"); 
  }
};

window.shareToWhatsApp = () => {
  if (!lastReceiptWhatsAppPayload) return;
  const p = lastReceiptWhatsAppPayload;
  let msg = `*${p.madrassa} - Fee Receipt*%0A%0AReceipt No: #${p.receiptNo}%0ADate: ${p.date}%0AStudent: *${p.name}* (Reg: ${p.reg})%0AClass: ${p.class}%0AItem: ${p.type}%0AAmount: *₹${p.amount}*%0A%0A_Jazakallah_`;
  const cleanPhone = (p.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone.length >= 10 ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${msg}` : `https://wa.me/?text=${msg}`;
  window.open(waUrl, "_blank");
};

window.saveFeeSettings = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const feePerm = document.querySelector('input[name="feePermission"]:checked')?.value || "all";
  const reqManual = document.getElementById("reqManualReceipt")?.checked || false;

  try {
    await setDoc(doc(db, "settings", currentInstitutionId), {
      institutionId: currentInstitutionId,
      feePermission: feePerm,
      reqManualReceipt: reqManual,
      specialFundCategories: window.customSpecialFunds || [],
      updatedAt: serverTimestamp()
    }, { merge: true });

    window.sysFeePermission = feePerm;
    window.sysReqManualReceipt = reqManual;
    window.showToast("Fee settings saved successfully!", "success");
  } catch (e) {
    window.showToast("Error saving fee settings: " + e.message, "error");
  }
};
