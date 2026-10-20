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
  const form = document.getElementById("studentProfileForm");
  if (form) form.reset();

  if (docId) {
    const s = localStudentsCache.find(x => x.id === docId);
    if (!s) return;

    const titleEl = document.getElementById("stuModalTitle");
    if (titleEl) titleEl.innerText = `Edit Student: ${s.name || ''}`;
    
    const docIdEl = document.getElementById("stuDocId");
    if (docIdEl) docIdEl.value = docId;

    // Personal Details
    if (document.getElementById("stuRegNo")) document.getElementById("stuRegNo").value = s.regNo || '';
    if (document.getElementById("stuIdNo")) document.getElementById("stuIdNo").value = s.idNo || '';
    if (document.getElementById("stuAadhaar")) document.getElementById("stuAadhaar").value = s.aadhaar || '';
    if (document.getElementById("stuName")) document.getElementById("stuName").value = s.name || '';
    if (document.getElementById("stuGender")) document.getElementById("stuGender").value = s.gender || 'Male';
    if (document.getElementById("stuDob")) document.getElementById("stuDob").value = s.dob || '';
    if (document.getElementById("stuBlood")) document.getElementById("stuBlood").value = s.bloodGroup || '';

    // Academic Details
    if (document.getElementById("stuCurrentClass")) document.getElementById("stuCurrentClass").value = (s.currentClass || '1').replace(/Class\s*/i, "").trim();
    if (document.getElementById("stuJoinedClass")) document.getElementById("stuJoinedClass").value = s.joinedClass || '';
    if (document.getElementById("stuDoj")) document.getElementById("stuDoj").value = s.joinedDate || '';
    if (document.getElementById("stuPresence")) document.getElementById("stuPresence").value = s.presence || '';
    if (document.getElementById("stuMonthlyFee")) document.getElementById("stuMonthlyFee").value = s.monthlyFeeAmount || '';

    // Family Details
    if (document.getElementById("stuFatherName")) document.getElementById("stuFatherName").value = s.fatherName || '';
    if (document.getElementById("stuMotherName")) document.getElementById("stuMotherName").value = s.motherName || '';
    if (document.getElementById("stuGuardianName")) document.getElementById("stuGuardianName").value = s.guardianName || '';
    if (document.getElementById("stuRelation")) document.getElementById("stuRelation").value = s.relation || '';
    if (document.getElementById("stuGuardianJob")) document.getElementById("stuGuardianJob").value = s.guardianJob || '';
    if (document.getElementById("stuPhone")) document.getElementById("stuPhone").value = s.phone || '';
    if (document.getElementById("stuEmergency")) document.getElementById("stuEmergency").value = s.emergencyPhone || '';

    // Address
    if (document.getElementById("stuHouse")) document.getElementById("stuHouse").value = s.houseName || '';
    if (document.getElementById("stuPlace")) document.getElementById("stuPlace").value = s.place || '';
    if (document.getElementById("stuPo")) document.getElementById("stuPo").value = s.postOffice || '';
    if (document.getElementById("stuPin")) document.getElementById("stuPin").value = s.pincode || '';
    if (document.getElementById("stuDistrict")) document.getElementById("stuDistrict").value = s.district || '';
    if (document.getElementById("stuState")) document.getElementById("stuState").value = s.state || 'KERALA';

    // Transfer & Other
    if (document.getElementById("stuTransTo")) document.getElementById("stuTransTo").value = s.transferredTo || '';
    if (document.getElementById("stuReason")) document.getElementById("stuReason").value = s.reasonLeaving || '';
    if (document.getElementById("stuDol")) document.getElementById("stuDol").value = s.dateLeaving || '';
    if (document.getElementById("stuTcIssued")) document.getElementById("stuTcIssued").value = s.tcIssued || 'No';
    if (document.getElementById("stuTcDetails")) document.getElementById("stuTcDetails").value = s.tcDetails || '';
    if (document.getElementById("stuMarks")) document.getElementById("stuMarks").value = s.identificationMarks || '';
    if (document.getElementById("stuMethods")) document.getElementById("stuMethods").value = s.specialInfo || '';

  } else {
    const titleEl = document.getElementById("stuModalTitle");
    if (titleEl) titleEl.innerText = "New Student Admission";
    const docIdEl = document.getElementById("stuDocId");
    if (docIdEl) docIdEl.value = "";
  }

  const modalEl = document.getElementById('studentProfileModal');
  if (modalEl) {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');

    const triggerEl = document.querySelector('#studentTabs button[data-bs-target="#tab-stu-personal"]');
    if (triggerEl && window.bootstrap && bootstrap.Tab) {
      bootstrap.Tab.getOrCreateInstance(triggerEl).show();
    }
    
    if (window.bootstrap && bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    } else {
      modalEl.classList.add("show");
      modalEl.style.display = "block";
    }
  }
};

// സ്റ്റുഡന്റ് ഡാറ്റ സേവ് ചെയ്യാൻ (Add / Update)
window.saveStudentProfile = async (e) => {
  if (e) e.preventDefault();
  
  const regNoInput = document.getElementById("stuRegNo")?.value;
  const nameInput = document.getElementById("stuName")?.value.trim();
  
  if (!regNoInput || !nameInput) {
    window.showToast("Registration Number and Student Name are required!", "warning");
    return;
  }

  const docId = document.getElementById("stuDocId")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");

  const studentData = {
    institutionId: currentInstitutionId,
    regNo: Number(regNoInput) || 0,
    idNo: document.getElementById("stuIdNo")?.value.trim().toUpperCase() || '',
    aadhaar: document.getElementById("stuAadhaar")?.value.trim() || '',
    name: nameInput.toUpperCase(),
    gender: document.getElementById("stuGender")?.value || 'Male',
    dob: document.getElementById("stuDob")?.value || '',
    bloodGroup: document.getElementById("stuBlood")?.value || '',

    currentClass: (document.getElementById("stuCurrentClass")?.value || "1").replace(/Class\s*/i, "").trim(),
    joinedClass: document.getElementById("stuJoinedClass")?.value.trim().toUpperCase() || '',
    joinedDate: document.getElementById("stuDoj")?.value || '',
    presence: document.getElementById("stuPresence")?.value.trim().toUpperCase() || '',
    monthlyFeeAmount: Number(document.getElementById("stuMonthlyFee")?.value) || 0,

    fatherName: document.getElementById("stuFatherName")?.value.trim().toUpperCase() || '',
    motherName: document.getElementById("stuMotherName")?.value.trim().toUpperCase() || '',
    guardianName: document.getElementById("stuGuardianName")?.value.trim().toUpperCase() || '',
    relation: document.getElementById("stuRelation")?.value.trim().toUpperCase() || '',
    guardianJob: document.getElementById("stuGuardianJob")?.value.trim().toUpperCase() || '',
    phone: document.getElementById("stuPhone")?.value.trim() || '',
    emergencyPhone: document.getElementById("stuEmergency")?.value.trim() || '',

    houseName: document.getElementById("stuHouse")?.value.trim().toUpperCase() || '',
    place: document.getElementById("stuPlace")?.value.trim().toUpperCase() || '',
    postOffice: document.getElementById("stuPo")?.value.trim().toUpperCase() || '',
    pincode: document.getElementById("stuPin")?.value.trim() || '',
    district: document.getElementById("stuDistrict")?.value.trim().toUpperCase() || '',
    state: document.getElementById("stuState")?.value.trim().toUpperCase() || 'KERALA',

    transferredTo: document.getElementById("stuTransTo")?.value.trim().toUpperCase() || '',
    reasonLeaving: document.getElementById("stuReason")?.value.trim().toUpperCase() || '',
    dateLeaving: document.getElementById("stuDol")?.value || '',
    tcIssued: document.getElementById("stuTcIssued")?.value || 'No',
    tcDetails: document.getElementById("stuTcDetails")?.value.trim().toUpperCase() || '',
    identificationMarks: document.getElementById("stuMarks")?.value.trim().toUpperCase() || '',
    specialInfo: document.getElementById("stuMethods")?.value.trim().toUpperCase() || '',

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
    
    const modalEl = document.getElementById('studentProfileModal');
    if (modalEl && window.bootstrap && bootstrap.Modal) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    } else if (modalEl) {
      modalEl.style.display = "none";
    }

    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');

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

// Student Directory എപ്പോഴും Registration Number ക്രമത്തിൽ മാത്രം ലോഡ് ചെയ്യും
window.loadStudentsByClass = async (forceRefresh = false) => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  let selectedClass = document.getElementById("filterClassSelect")?.value || "ALL";

  const tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-3">Loading data...</td></tr>`;

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
    }

    // REGISTRATION NUMBER ORDER (ONLY FOR STUDENT DIRECTORY)
    localStudentsCache.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

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
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No student records found.</td></tr>`;
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
    const g = (s.gender || '').toString().trim().toLowerCase();
    const isGirl = g === 'female' || g === 'girl' || g === 'f';
    const genderBadge = isGirl 
      ? `<span class="badge bg-danger-subtle text-danger border border-danger">Female</span>` 
      : `<span class="badge bg-primary-subtle text-primary border border-primary">Male</span>`;

    html += `
      <tr>
        <td><b>${slNo}</b></td>
        <td><b class="text-success">${s.regNo || '-'}</b></td>
        <td><b>${s.name || '-'}</b></td>
        <td>${genderBadge}</td>
        <td><span class="badge bg-success">Class ${cleanClass}</span></td>
        <td>${s.fatherName || '-'}</td>
        <td>${s.place || '-'}</td>
        <td>${s.phone || '-'}</td>
        <td class="text-center" style="white-space: nowrap;">
          <button class="btn btn-sm btn-outline-info me-1" onclick="viewStudentProfile('${s.id}')" title="View Details"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openStudentProfileModal('${s.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s.id}', '${(s.name || '').replace(/'/g, "\\'")}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
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

window.downloadCSVFormat = () => {
  const headers = "REG NO.,STUDENT NAME,GENDER,CURRENT CLASS,FATHER NAME,MOBILE NUMBER\n";
  const sampleData = "101,MUHAMMED,Male,1,ABDULLA,9876543210\n";
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sampleData);
  
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "student_bulk_import_format.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Student Profile Full Details View
window.viewStudentProfile = (docId) => {
  const s = localStudentsCache.find(x => x.id === docId);
  if (!s) return;

  if (document.getElementById("viewStuName")) document.getElementById("viewStuName").innerText = s.name || '-';
  if (document.getElementById("viewStuRegNo")) document.getElementById("viewStuRegNo").innerText = s.regNo || '-';
  if (document.getElementById("viewStuIdNo")) document.getElementById("viewStuIdNo").innerText = s.idNo || '-';
  if (document.getElementById("viewStuClass")) document.getElementById("viewStuClass").innerText = "Class " + (s.currentClass || '-');
  if (document.getElementById("viewStuGender")) document.getElementById("viewStuGender").innerText = s.gender || '-';
  if (document.getElementById("viewStuDob")) document.getElementById("viewStuDob").innerText = s.dob || '-';
  if (document.getElementById("viewStuBlood")) document.getElementById("viewStuBlood").innerText = s.bloodGroup || '-';
  
  if (document.getElementById("viewStuFather")) document.getElementById("viewStuFather").innerText = s.fatherName || '-';
  if (document.getElementById("viewStuMother")) document.getElementById("viewStuMother").innerText = s.motherName || '-';
  if (document.getElementById("viewStuGuardian")) document.getElementById("viewStuGuardian").innerText = s.guardianName || '-';
  if (document.getElementById("viewStuRelation")) document.getElementById("viewStuRelation").innerText = s.relation || '-';
  if (document.getElementById("viewStuPhone")) document.getElementById("viewStuPhone").innerText = s.phone || '-';
  if (document.getElementById("viewStuEmergency")) document.getElementById("viewStuEmergency").innerText = s.emergencyPhone || '-';

  if (document.getElementById("viewStuHouse")) document.getElementById("viewStuHouse").innerText = s.houseName || '-';
  if (document.getElementById("viewStuPlace")) document.getElementById("viewStuPlace").innerText = s.place || '-';
  if (document.getElementById("viewStuPo")) document.getElementById("viewStuPo").innerText = s.postOffice || '-';
  if (document.getElementById("viewStuPin")) document.getElementById("viewStuPin").innerText = s.pincode || '-';
  if (document.getElementById("viewStuDistrict")) document.getElementById("viewStuDistrict").innerText = s.district || '-';

  if (document.getElementById("viewStuDoj")) document.getElementById("viewStuDoj").innerText = s.joinedDate || '-';
  if (document.getElementById("viewStuFee")) document.getElementById("viewStuFee").innerText = `₹${s.monthlyFeeAmount || 0}`;
  if (document.getElementById("viewStuTc")) document.getElementById("viewStuTc").innerText = s.tcIssued || 'No';
  if (document.getElementById("viewStuReason")) document.getElementById("viewStuReason").innerText = s.reasonLeaving || '-';
  if (document.getElementById("viewStuSpecial")) document.getElementById("viewStuSpecial").innerText = s.specialInfo || '-';

  const modalEl = document.getElementById('studentDetailsViewModal');
  if (modalEl && window.bootstrap && bootstrap.Modal) {
    new bootstrap.Modal(modalEl).show();
  }
};
