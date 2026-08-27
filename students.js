// ==========================================
// STUDENTS MANAGEMENT MODULE (students.js)
// ==========================================
import { db } from "./firebase-config.js";
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, writeBatch, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let localStudentsCache = [];
let currentPage = 1;
const pageSize = 50;

// സ്റ്റുഡന്റ് പ്രൊഫൈൽ മോഡൽ തുറക്കാൻ (New / Edit)
window.openStudentProfileModal = (docId) => {
  document.getElementById("studentProfileForm").reset();

  if (docId) {
    const s = localStudentsCache.find(x => x.id === docId);
    if (!s) return;

    document.getElementById("stuModalTitle").innerText = `Edit Student: ${s.name}`;
    document.getElementById("stuDocId").value = docId;

    document.getElementById("stuRegNo").value = s.regNo || '';
    document.getElementById("stuName").value = s.name || '';
    document.getElementById("stuCurrentClass").value = (s.currentClass || '1').replace(/Class\s*/i, "").trim();
    document.getElementById("stuMonthlyFee").value = s.monthlyFeeAmount || '';
    document.getElementById("stuFatherName").value = s.fatherName || '';
    document.getElementById("stuPhone").value = s.phone || '';
  } else {
    document.getElementById("stuModalTitle").innerText = "New Student Admission";
    document.getElementById("stuDocId").value = "";
  }

  const triggerEl = document.querySelector('#studentTabs button[data-bs-target="#tab-stu-personal"]');
  if (triggerEl) bootstrap.Tab.getOrCreateInstance(triggerEl).show();
  new bootstrap.Modal(document.getElementById('studentProfileModal')).show();
};

// സ്റ്റുഡന്റ് ഡാറ്റ സേവ് ചെയ്യാൻ (Add / Update)
window.saveStudentProfile = async (e) => {
  if (e) e.preventDefault();
  
  const regNoInput = document.getElementById("stuRegNo").value;
  const nameInput = document.getElementById("stuName").value.trim();
  
  if (!regNoInput || !nameInput) {
    window.showToast("Registration Number and Student Name are required!", "warning");
    return;
  }

  const docId = document.getElementById("stuDocId").value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");

  const studentData = {
    institutionId: currentInstitutionId,
    regNo: Number(regNoInput) || 0,
    name: nameInput.toUpperCase(),
    currentClass: (document.getElementById("stuCurrentClass").value || "1").replace(/Class\s*/i, "").trim(),
    monthlyFeeAmount: Number(document.getElementById("stuMonthlyFee").value) || 0,
    fatherName: document.getElementById("stuFatherName").value.trim().toUpperCase(),
    phone: document.getElementById("stuPhone").value.trim(),
    status: "active"
  };

  try {
    if (docId) {
      studentData.updatedAt = serverTimestamp();
      await updateDoc(doc(db, "students", docId), studentData);
      window.showToast("Student details updated successfully.", "success");
    } else {
      studentData.createdAt = serverTimestamp();
      await addDoc(collection(db, "students"), studentData);
      window.showToast("New student admitted successfully.", "success");
    }
    
    bootstrap.Modal.getInstance(document.getElementById('studentProfileModal')).hide();
    window.loadStudentsByClass(true);
  } catch (err) {
    window.showToast("Error: " + err.message, "error");
  }
};

// ഒറ്റ വിദ്യാർത്ഥിയെ ഡിലീറ്റ് ചെയ്യാൻ
window.deleteStudent = async (docId, name) => {
  if (confirm(`Are you sure you want to delete ${name}?`)) {
    try {
      await deleteDoc(doc(db, "students", docId));
      window.showToast("Student removed.", "success");
      window.loadStudentsByClass(true);
    } catch (err) {
      window.showToast("Error: " + err.message, "error");
    }
  }
};

// എല്ലാ വിദ്യാർത്ഥികളെയും ഡിലീറ്റ് ചെയ്യാൻ
window.deleteAllStudents = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (confirm("WARNING: Are you sure you want to delete ALL student records for this madrasa?")) {
    try {
      window.showToast("Deleting all students...", "warning");
      const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId));
      const snap = await getDocs(q);
      
      const batch = writeBatch(db);
      snap.forEach(d => { batch.delete(doc(db, "students", d.id)); });
      
      await batch.commit();
      window.showToast("All student records deleted successfully.", "success");
      window.loadStudentsByClass(true);
    } catch (err) {
      window.showToast("Error deleting students: " + err.message, "error");
    }
  }
};

// ക്ലാസ്സ് അനുസരിച്ച് വിദ്യാർത്ഥികളെ ലോഡ് ചെയ്യാൻ
window.loadStudentsByClass = async (forceRefresh = false) => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  let selectedClass = document.getElementById("filterClassSelect")?.value || "ALL";

  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-3">Loading data...</td></tr>`;

  try {
    if (localStudentsCache.length === 0 || forceRefresh) {
      let q;
      if (selectedClass === "ALL") {
        q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId));
      } else {
        q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selectedClass.replace(/Class\s*/i, "").trim()));
      }

      const snap = await getDocs(q);
      localStudentsCache = [];
      snap.forEach(d => localStudentsCache.push({ id: d.id, ...d.data() }));

      localStudentsCache.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));
    }

    // ക്ലാസ് ഫിൽട്ടറിങ് ലോക്കൽ ക്യാഷിൽ നിന്ന്
    let filtered = localStudentsCache;
    if (selectedClass !== "ALL") {
      filtered = localStudentsCache.filter(s => String(s.currentClass) === String(selectedClass.replace(/Class\s*/i, "").trim()));
    }

    currentPage = 1;
    renderPaginatedTable(filtered);
  } catch (err) {
    console.error("Error loading students:", err);
    window.showToast("Error loading students: " + err.message, "error");
  }
};

function renderPaginatedTable(dataArray = localStudentsCache) {
  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;
  const total = dataArray.length;

  if (!total) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No student records found.</td></tr>`;
    const infoEl = document.getElementById("paginationInfo");
    if (infoEl) infoEl.innerText = `Showing 0-0 of 0`;
    const controlsEl = document.getElementById("paginationControls");
    if (controlsEl) controlsEl.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(total / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageData = dataArray.slice(startIndex, endIndex);

  let html = "";
  pageData.forEach((s, index) => {
    const slNo = startIndex + index + 1;
    const cleanClass = (s.currentClass || '-').replace(/Class\s*/i, "").trim();
    html += `
      <tr>
        <td><b>${slNo}</b></td>
        <td><b class="text-success">${s.regNo || '-'}</b></td>
        <td><b>${s.name || '-'}</b></td>
        <td><span class="badge bg-success">Class ${cleanClass}</span></td>
        <td>${s.fatherName || '-'}</td>
        <td>${s.place || '-'}</td>
        <td>${s.phone || '-'}</td>
        <td class="text-center" style="white-space: nowrap;">
          <button class="btn btn-sm btn-outline-info me-1" onclick="viewStudentProfile('${s.id}')" title="View Full Details"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openStudentProfileModal('${s.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s.id}', '${s.name}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  
  const infoEl = document.getElementById("paginationInfo");
  if (infoEl) {
    infoEl.innerText = `Showing ${startIndex + 1}-${endIndex} of ${total} students`;
  }
  
  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const controlsEl = document.getElementById("paginationControls");
  if (!controlsEl) return;

  if (totalPages <= 1) {
    controlsEl.innerHTML = "";
    return;
  }

  let html = `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" onclick="window.changeStudentPage(${currentPage - 1})">Previous</button>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <button class="page-link" onclick="window.changeStudentPage(${i})">${i}</button>
        </li>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" onclick="window.changeStudentPage(${currentPage + 1})">Next</button>
    </li>
  `;

  controlsEl.innerHTML = html;
}

window.changeStudentPage = (page) => {
  currentPage = page;
  let selectedClass = document.getElementById("filterClassSelect")?.value || "ALL";
  let filtered = localStudentsCache;
  if (selectedClass !== "ALL") {
    filtered = localStudentsCache.filter(s => String(s.currentClass) === String(selectedClass.replace(/Class\s*/i, "").trim()));
  }
  renderPaginatedTable(filtered);
};

// ലോക്കൽ ഫിൽട്ടർ ചെയ്യുമ്പോഴും പേജിനേഷൻ വരുന്ന രീതിയിൽ
window.filterStudentsLocal = () => {
  const term = document.getElementById("searchBox").value.toLowerCase();
  const filtered = localStudentsCache.filter(s => 
    (s.name && s.name.toLowerCase().includes(term)) || 
    (s.regNo && s.regNo.toString().includes(term)) ||
    (s.place && s.place.toLowerCase().includes(term))
  );
  currentPage = 1;
  renderPaginatedTable(filtered);
};

// CSV ഫോർമാറ്റ് ഡൗൺലോഡ് ചെയ്യാൻ
window.downloadCSVFormat = () => {
  const headers = "REG NO.,STUDENT NAME,CURRENT CLASS,FATHER NAME,MOBILE NUMBER\n";
  const sampleData = "101,MUHAMMED,1,ABDULLA,9876543210\n";
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sampleData);
  
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "student_bulk_import_format.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ==========================================
// STUDENT PROFILE VIEW MODULE (students.js)
// ==========================================

window.viewStudentProfile = (docId) => {
  const s = localStudentsCache.find(x => x.id === docId);
  if (!s) return;

  document.getElementById("viewStuName").innerText = s.name || '-';
  document.getElementById("viewStuRegNo").innerText = s.regNo || '-';
  document.getElementById("viewStuIdNo").innerText = s.idNo || '-';
  document.getElementById("viewStuClass").innerText = "Class " + (s.currentClass || '-');
  document.getElementById("viewStuGender").innerText = s.gender || '-';
  document.getElementById("viewStuDob").innerText = s.dob || '-';
  document.getElementById("viewStuBlood").innerText = s.bloodGroup || '-';
  
  document.getElementById("viewStuFather").innerText = s.fatherName || '-';
  document.getElementById("viewStuMother").innerText = s.motherName || '-';
  document.getElementById("viewStuGuardian").innerText = s.guardianName || '-';
  document.getElementById("viewStuRelation").innerText = s.relation || '-';
  document.getElementById("viewStuPhone").innerText = s.phone || '-';
  document.getElementById("viewStuEmergency").innerText = s.emergencyPhone || '-';

  document.getElementById("viewStuHouse").innerText = s.houseName || '-';
  document.getElementById("viewStuPlace").innerText = s.place || '-';
  document.getElementById("viewStuPo").innerText = s.postOffice || '-';
  document.getElementById("viewStuPin").innerText = s.pincode || '-';
  document.getElementById("viewStuDistrict").innerText = s.district || '-';

  document.getElementById("viewStuDoj").innerText = s.joinedDate || '-';
  document.getElementById("viewStuFee").innerText = `₹${s.monthlyFeeAmount || 0}`;
  document.getElementById("viewStuTc").innerText = s.tcIssued || 'No';
  document.getElementById("viewStuReason").innerText = s.reasonLeaving || '-';
  document.getElementById("viewStuSpecial").innerText = s.specialInfo || '-';

  const modalEl = document.getElementById('studentDetailsViewModal');
  if (modalEl) {
    new bootstrap.Modal(modalEl).show();
  }
};
