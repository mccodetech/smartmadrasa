// ==========================================
// ACADEMICS MODULE (academics.js) - Complete
// ==========================================
import { db, auth } from "./firebase-config.js";
import { 
  collection, doc, setDoc, getDoc, getDocs, query, where, addDoc, writeBatch, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const DEFAULT_SUBJECTS = ["Quran", "Tajweed", "Fiqh", "Aqeedah", "Tareekh", "Lisan"];

// ==========================================
// 1. SUBJECT SETTINGS MODULE
// ==========================================
window.loadClassSubjectSettings = async () => {
  const selClass = document.getElementById("subjectClassSelect")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!selClass) return;

  try {
    const docRef = doc(db, "subjectSettings", `${currentInstitutionId}_Class_${selClass}`);
    const snap = await getDoc(docRef);
    const inputEl = document.getElementById("customSubjectsInput");
    if (inputEl) {
      if (snap.exists() && snap.data().subjects) {
        inputEl.value = snap.data().subjects.join(", ");
      } else {
        inputEl.value = DEFAULT_SUBJECTS.join(", ");
      }
    }
  } catch (e) {
    const inputEl = document.getElementById("customSubjectsInput");
    if (inputEl) inputEl.value = DEFAULT_SUBJECTS.join(", ");
  }
};

window.saveClassSubjects = async () => {
  const selClass = document.getElementById("subjectClassSelect")?.value;
  const rawInput = document.getElementById("customSubjectsInput")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const subjectsArray = rawInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

  if (subjectsArray.length === 0) return window.showToast("Please enter at least one subject.", "warning");

  try {
    await setDoc(doc(db, "subjectSettings", `${currentInstitutionId}_Class_${selClass}`), {
      institutionId: currentInstitutionId,
      class: selClass,
      subjects: subjectsArray,
      updatedAt: serverTimestamp()
    });
    window.showToast(`Subjects for Class ${selClass} updated successfully!`, "success");
  } catch (e) {
    window.showToast("Error saving subjects: " + e.message, "error");
  }
};

// ==========================================
// 2. MARKS ENTRY MODULE (With Total Column)
// ==========================================
window.resetMarksButton = () => {
  const btn = document.getElementById("btnSaveMarks");
  if (btn) {
    btn.disabled = false;
    btn.className = "btn btn-primary-custom px-4 mt-2";
    btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Marks`;
  }
};

window.loadMarksEntrySheet = async () => {
  window.resetMarksButton();
  const selClass = document.getElementById("markClassSelect")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!selClass) { document.getElementById("marksSheetArea")?.classList.add("d-none"); return; }

  const cleanClass = selClass.replace(/Class\s*/i, "").trim();
  const area = document.getElementById("marksSheetArea");
  const thead = document.getElementById("marksTableHead");
  const tbody = document.getElementById("marksTableBody");

  if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading subjects and students...</td></tr>`;
  if (area) area.classList.remove("d-none");

  let currentSubjects = DEFAULT_SUBJECTS;
  try {
    const subDoc = await getDoc(doc(db, "subjectSettings", `${currentInstitutionId}_Class_${cleanClass}`));
    if (subDoc.exists() && subDoc.data().subjects && subDoc.data().subjects.length > 0) {
      currentSubjects = subDoc.data().subjects;
    }
  } catch (e) {
    console.log("Using default subjects");
  }

  // നിലവിലുള്ള മാർക്കുകൾ ഫെച്ച് ചെയ്യുന്നു
  const examName = document.getElementById("markExamSelect")?.value || "Quarterly Exam";
  const marksQuery = query(collection(db, "examMarks"), where("institutionId", "==", currentInstitutionId), where("examName", "==", examName), where("classNum", "==", cleanClass));
  const marksSnap = await getDocs(marksQuery);
  let existingMarks = {}; 
  marksSnap.forEach(d => {
    const data = d.data();
    if (data.regNo) existingMarks[data.regNo] = data.marks || {};
  });

  let headHtml = `<tr><th>Reg No</th><th>Name</th>`;
  currentSubjects.forEach(sub => { headHtml += `<th>${sub}</th>`; });
  headHtml += `<th class="table-secondary" style="width: 100px;">Total</th></tr>`;
  if (thead) thead.innerHTML = headHtml;

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", cleanClass), where("status", "==", "active"));
  const snap = await getDocs(q);

  let students = [];
  snap.forEach(d => students.push({ id: d.id, ...d.data() }));
  students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

  let bodyHtml = "";
  students.forEach(s => {
    const studentMarks = existingMarks[s.regNo] || {};
    let rowTotal = 0;

    bodyHtml += `<tr data-sid="${s.id}" data-reg="${s.regNo}" data-name="${s.name}">
      <td><b>${s.regNo || '-'}</b></td>
      <td><b>${s.name}</b></td>`;

    currentSubjects.forEach(sub => {
      const score = studentMarks[sub] !== undefined ? studentMarks[sub] : "";
      rowTotal += Number(score) || 0;
      bodyHtml += `<td><input type="number" class="form-control form-control-sm text-center sub-mark-input mark-input" data-subject="${sub}" value="${score}" style="max-width:80px; margin:auto;" oninput="calculateRowTotal(this); resetMarksButton()"></td>`;
    });

    bodyHtml += `<td class="table-secondary fw-bold text-center row-total">${rowTotal}</td></tr>`;
  });

  if (tbody) tbody.innerHTML = bodyHtml || `<tr><td colspan="${currentSubjects.length + 3}" class="text-center text-muted">No active students in this class.</td></tr>`;
};

window.calculateRowTotal = (inputEl) => {
  const row = inputEl.closest("tr");
  if (!row) return;
  const inputs = row.querySelectorAll(".mark-input");
  let total = 0;
  inputs.forEach(inp => {
    total += Number(inp.value) || 0;
  });
  const totalCell = row.querySelector(".row-total");
  if (totalCell) totalCell.innerText = total;
};

window.saveClassMarks = async () => {
  const exam = document.getElementById("markExamSelect")?.value;
  const selClass = document.getElementById("markClassSelect")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!exam || !selClass) return window.showToast("Select exam and class.", "warning");

  const btn = document.getElementById("btnSaveMarks");
  if (btn) {
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
    let totalScore = 0;
    r.querySelectorAll(".sub-mark-input").forEach(input => {
      const subName = input.getAttribute("data-subject");
      const val = Number(input.value) || 0;
      scores[subName] = val;
      totalScore += val;
    });

    const docId = `${currentInstitutionId}_${exam}_${cleanClass}_${reg}`;
    const markRef = doc(db, "examMarks", docId);
    batch.set(markRef, {
      institutionId: currentInstitutionId,
      examName: exam,
      classNum: cleanClass,
      studentId: sid,
      regNo: Number(reg),
      studentName: name,
      marks: scores,
      totalScore: totalScore,
      timestamp: serverTimestamp()
    }, { merge: true });
  });

  try {
    await batch.commit();
    if (btn) {
      btn.className = "btn btn-secondary px-4 mt-2"; 
      btn.innerHTML = `<i class="fa-solid fa-check me-1"></i> Saved Successfully`;
    }
    window.showToast("Marks saved successfully!", "success");
  } catch (err) { 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-floppy-disk me-1"></i> Save Marks`;
    }
    window.showToast("Error: " + err.message, "error"); 
  }
};

// ==========================================
// 3. ATTENDANCE MODULE
// ==========================================
window.resetAttendanceButton = () => {
  const btn = document.getElementById("btnSaveAttendance");
  if (btn) {
    btn.disabled = false;
    btn.className = "btn btn-primary-custom px-4 mt-2";
    btn.innerHTML = `<i class="fa-solid fa-check-double me-1"></i> Save Attendance`;
  }
};

window.loadAttendanceSheet = async () => {
  window.resetAttendanceButton();
  const selClass = document.getElementById("attClassSelect")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!selClass) { document.getElementById("attendanceSheetArea")?.classList.add("d-none"); return; }

  const area = document.getElementById("attendanceSheetArea");
  const tbody = document.getElementById("attendanceTableBody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="3" class="text-center">Loading students...</td></tr>`;
  if (area) area.classList.remove("d-none");

  const q = query(collection(db, "students"), where("institutionId", "==", currentInstitutionId), where("currentClass", "==", selClass.replace(/Class\s*/i, "").trim()), where("status", "==", "active"));
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
  if (tbody) tbody.innerHTML = html || `<tr><td colspan="3" class="text-center">No active students in this class.</td></tr>`;
  const selectAllAtt = document.getElementById("selectAllAtt");
  if (selectAllAtt) selectAllAtt.checked = true;
  window.updateAttendanceCount();
};

window.toggleSelectAllAttendance = () => {
  const isChecked = document.getElementById("selectAllAtt")?.checked;
  document.querySelectorAll(".att-checkbox").forEach(cb => cb.checked = isChecked);
  window.updateAttendanceCount();
};

window.updateAttendanceCount = () => {
  const total = document.querySelectorAll(".att-checkbox").length;
  const present = document.querySelectorAll(".att-checkbox:checked").length;
  const attCountInfo = document.getElementById("attCountInfo");
  if (attCountInfo) attCountInfo.innerText = `Total: ${total} | Present: ${present} | Absent: ${total - present}`;
  window.resetAttendanceButton();
};

window.saveClassAttendance = async () => {
  const date = document.getElementById("attDate")?.value;
  const selClass = document.getElementById("attClassSelect")?.value;
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  if (!date || !selClass) return alert("Select date and class.");

  const btn = document.getElementById("btnSaveAttendance");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> Saving Attendance & Points...`;
  }

  const cleanClass = selClass.replace(/Class\s*/i, "").trim();
  const rows = document.querySelectorAll("#attendanceTableBody tr[data-sid]");
  const records = {};
  
  const batch = writeBatch(db);
  const attendanceRef = doc(collection(db, "attendance"));

  rows.forEach(r => {
    const sid = r.getAttribute("data-sid");
    const isPresent = r.querySelector(".att-checkbox")?.checked;
    records[sid] = isPresent ? "P" : "A";

    if (isPresent) {
      const reg = r.querySelector("b")?.innerText || "";
      const name = r.querySelectorAll("td")[1]?.innerText || "";

      const perfRef = doc(collection(db, "performancePoints"));
      batch.set(perfRef, {
        institutionId: currentInstitutionId,
        studentId: sid,
        regNo: Number(reg) || 0,
        studentName: name,
        class: cleanClass,
        task: "Daily Attendance (+5 Pts)",
        points: 5,
        date: new Date(date).toLocaleDateString(),
        timestamp: serverTimestamp()
      });
    }
  });

  batch.set(attendanceRef, {
    institutionId: currentInstitutionId,
    date: date,
    class: cleanClass,
    records: records,
    recordedBy: auth.currentUser ? auth.currentUser.uid : "unknown",
    timestamp: serverTimestamp()
  });

  try {
    await batch.commit();
    if (btn) {
      btn.className = "btn btn-secondary px-4 mt-2"; 
      btn.innerHTML = `<i class="fa-solid fa-check me-1"></i> Saved Successfully`;
    }
    window.showToast("Attendance & Auto-Points recorded successfully!", "success");
  } catch (err) { 
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-check-double me-1"></i> Save Attendance`;
    }
    window.showToast("Error: " + err.message, "error"); 
  }
};

// ==========================================
// 4. PERFORMANCE MODULE
// ==========================================
window.loadStudentsForPerfSheet = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const classSelect = document.getElementById("perfClassSelect");
  const selectedClass = classSelect ? classSelect.value : "";
  const sheetArea = document.getElementById("perfSheetArea");
  const tbody = document.getElementById("perfTableBody");

  if (!selectedClass) {
    if (sheetArea) sheetArea.classList.add("d-none");
    return;
  }

  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3"><i class="fa-solid fa-spinner fa-spin me-2"></i>Loading students...</td></tr>`;
  }
  if (sheetArea) sheetArea.classList.remove("d-none");

  try {
    const q = query(
      collection(db, "students"), 
      where("institutionId", "==", currentInstitutionId), 
      where("currentClass", "==", selectedClass.replace(/Class\s*/i, "").trim())
    );
    const snap = await getDocs(q);
    
    let students = [];
    snap.forEach(d => {
      students.push({ id: d.id, ...d.data() });
    });

    students.sort((a, b) => (Number(a.regNo) || 0) - (Number(b.regNo) || 0));

    let html = "";
    if (students.length === 0) {
      html = `<tr><td colspan="3" class="text-center text-muted py-3">No students found in Class ${selectedClass}.</td></tr>`;
    } else {
      students.forEach((stu) => {
        html += `
          <tr>
            <td><b>${stu.regNo || '-'}</b></td>
            <td><b>${stu.name || '-'}</b></td>
            <td class="text-center">
              <div class="form-check d-inline-block">
                <input class="form-check-input perf-student-cb" type="checkbox" value="${stu.id}" id="perfStu_${stu.id}" checked>
                <label class="form-check-label" for="perfStu_${stu.id}">Award</label>
              </div>
            </td>
          </tr>
        `;
      });
    }

    if (tbody) tbody.innerHTML = html;

  } catch (err) {
    console.error("Error loading performance sheet:", err);
    window.showToast("Error loading students: " + err.message, "error");
  }
};

window.toggleSelectAllPerf = () => {
  const selectAllCb = document.getElementById("selectAllPerf");
  const checkboxes = document.querySelectorAll(".perf-student-cb");
  checkboxes.forEach(cb => {
    cb.checked = selectAllCb ? selectAllCb.checked : true;
  });
};
