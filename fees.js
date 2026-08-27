// ==========================================
// FEES MANAGEMENT MODULE (fees.js)
// ==========================================
import { db } from "./firebase-config.js";
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
    // അഡ്മിൻ സെറ്റിങ്സിൽ നൽകിയ കസ്റ്റം ഫണ്ടുകൾ ഇവിടെ ഡ്രോപ്ഡൗണിൽ വരും
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

// ഫീസ് പേയ്മെന്റ് സേവ് ചെയ്യുമ്പോൾ സ്പെഷ്യൽ ഫണ്ടിന്റെ പേര് കൂടി സേവ് ചെയ്യാൻ
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

    // പ്രധാന ഫീസ് കളക്ഷൻ ടേബിളിൽ സേവ് ചെയ്യുന്നു
    await addDoc(collection(db, "feeCollections"), {
      institutionId: currentInstitutionId, 
      receiptNo: nextReceiptNo, 
      studentId: sId, 
      regNo: Number(reg),
      studentName: name, 
      class: sClass, 
      amount: Number(amount), 
      feeType: finalFeeTypeStr,
      fundCategory: specificFundName || category, // ഏത് ഫണ്ടാണെന്ന് അറിയാൻ
      manualReceiptNo: manual, 
      date: today, 
      collectedBy: auth.currentUser.uid, 
      collectedByName: currentUserName,
      timestamp: serverTimestamp()
    });

    // സ്പെഷ്യൽ ഫണ്ട് റിപ്പോർട്ടുകൾക്കായി സെപ്പറേറ്റ് കളക്ഷനിലേക്ക് സേവ് ചെയ്യുന്നു
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

    // രസീത് പ്രിന്റ് ചെയ്യാനുള്ള ഡാറ്റ സെറ്റ് ചെയ്യൽ
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

    bootstrap.Modal.getInstance(document.getElementById('feePaymentModal')).hide();
    document.getElementById("appSection").classList.add("d-none");
    document.getElementById("printableReceipt").classList.remove("d-none");
    window.loadStudentsForFees();

  } catch (err) { 
    window.showToast("Error: " + err.message, "error"); 
  }
};

window.saveFeeSettings = async () => {
  const perm = document.querySelector('input[name="feePermission"]:checked')?.value || "all";
  const reqManual = document.getElementById("reqManualReceipt")?.checked || false;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");

  try {
    await setDoc(doc(db, "settings", currentInstitutionId), {
      feePermission: perm,
      reqManualReceipt: reqManual,
      specialFundCategories: window.customSpecialFunds || [],
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    window.sysFeePermission = perm;
    window.sysReqManualReceipt = reqManual;
    window.showToast("Fee settings saved successfully!", "success");
  } catch (err) { 
    window.showToast("Error: " + err.message, "error"); 
  }
};

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
  
  const studentPaidMonths = {};
  feeSnap.forEach(d => {
    const f = d.data();
    if (!studentPaidMonths[f.regNo]) studentPaidMonths[f.regNo] = new Set();
    ALL_MONTHS.forEach(m => {
      if (f.feeType && f.feeType.includes(m)) studentPaidMonths[f.regNo].add(m);
    });
  });

  let html = "";
  students.forEach(s => {
    const defaultFee = s.monthlyFeeAmount || 0;
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
        <td class="text-center"><button class="btn btn-sm btn-success w-100" onclick="openFeeModal('${sDataStr}')">Pay Fee</button></td>
      </tr>
    `;
  });
  if (tbody) tbody.innerHTML = html;
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
  window.toggleFeeCategoryOptions();

  const manualInput = document.getElementById("payManualReceiptInput");
  const sysReqManualReceipt = window.sysReqManualReceipt || false;
  if (manualInput) {
    manualInput.required = sysReqManualReceipt;
    manualInput.placeholder = sysReqManualReceipt ? "Required" : "Optional";
  }

  window.calculateFeeAmount();
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
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const currentUserName = window.currentUserName || "Staff";

  let finalFeeTypeStr = category;
  if (category === "Monthly Fee") {
    const checkedMonths = Array.from(document.querySelectorAll(".month-cb:checked")).map(cb => cb.value);
    if (checkedMonths.length === 0) return window.showToast("Select at least one month.", "warning");
    finalFeeTypeStr = `Monthly Fee (${academicYear}): ${checkedMonths.join(', ')}`;
  } else if (category === "Special Fee") {
    const specName = document.getElementById("paySpecialFeeSelect").value;
    finalFeeTypeStr = `Special Fee - ${specName} (${academicYear})`;
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
      institutionId: currentInstitutionId, receiptNo: nextReceiptNo, studentId: sId, regNo: Number(reg),
      studentName: name, class: sClass, amount: Number(amount), feeType: finalFeeTypeStr,
      manualReceiptNo: manual, date: today, collectedBy: auth.currentUser.uid, collectedByName: currentUserName,
      timestamp: serverTimestamp()
    });

    // If it's a special fund, store it separately for public display board if needed
    if (category === "Special Fee") {
      const specName = document.getElementById("paySpecialFeeSelect").value;
      await addDoc(collection(db, "specialFunds"), {
        institutionId: currentInstitutionId,
        donorName: name,
        fundCategory: specName,
        amount: Number(amount),
        date: today,
        timestamp: serverTimestamp()
      });
    }

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

    lastReceiptWhatsAppPayload = { phone, madrassa: document.getElementById("displayMadrassaName").innerText, receiptNo: nextReceiptNo, name, reg, class: sClass, amount, type: finalFeeTypeStr, manual, date: today };

    if (phone) document.getElementById("whatsappShareBtn").classList.remove("d-none");
    else document.getElementById("whatsappShareBtn").classList.add("d-none");

    bootstrap.Modal.getInstance(document.getElementById('feePaymentModal')).hide();
    document.getElementById("appSection").classList.add("d-none");
    document.getElementById("printableReceipt").classList.remove("d-none");
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
