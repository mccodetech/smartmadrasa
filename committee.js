// ==========================================
// MANAGING COMMITTEE MODULE (committee.js)
// ==========================================
import { db, auth } from "./firebase-config.js";
import { 
  collection, doc, setDoc, getDocs, query, where, addDoc, deleteDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// കമ്മിറ്റി അംഗങ്ങളുടെ പട്ടിക ലോഡ് ചെയ്യാൻ
window.loadCommitteeMembers = async () => {
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const currentUserRole = window.currentUserRole || sessionStorage.getItem("currentUserRole");
  const tbody = document.getElementById("committeeTableBody");
  const addBtn = document.getElementById("btnAddCommitteeMember");

  // അഡ്മിന് മാത്രം ആഡ് ചെയ്യാനും ഡിലീറ്റ് ചെയ്യാനും അനുവാദം നൽകുക
  if (currentUserRole === "admin") {
    if (addBtn) addBtn.classList.remove("d-none");
    document.querySelectorAll(".action-col").forEach(el => el.classList.remove("d-none"));
  } else {
    if (addBtn) addBtn.classList.add("d-none");
    document.querySelectorAll(".action-col").forEach(el => el.classList.add("d-none"));
  }

  if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading committee members...</td></tr>`;

  try {
    const q = query(collection(db, "committee"), where("institutionId", "==", currentInstitutionId));
    const snap = await getDocs(q);
    
    let html = "";
    snap.forEach(d => {
      const c = d.data();
      const photoHtml = c.photo ? `<img src="${c.photo}" class="rounded-circle" width="40" height="40" style="object-fit:cover;">` : `<i class="fa-solid fa-user-circle fa-2x text-secondary"></i>`;
      
      html += `
        <tr>
          <td class="text-center">${photoHtml}</td>
          <td class="fw-bold">${c.name}</td>
          <td><span class="badge bg-success">${c.designation}</span></td>
          <td>${c.phone || '-'}</td>
          <td class="text-center action-col ${currentUserRole === 'admin' ? '' : 'd-none'}">
            <button class="btn btn-sm text-danger p-0" onclick="deleteCommitteeMember('${d.id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    });

    if (tbody) tbody.innerHTML = html || `<tr><td colspan="5" class="text-center text-muted">No committee members added yet.</td></tr>`;
  } catch (err) {
    console.error("Error loading committee:", err);
  }
};

window.openCommitteeModal = () => {
  const form = document.getElementById("committeeForm");
  if (form) form.reset();
  const modalEl = document.getElementById("committeeModal");
  if (modalEl && window.bootstrap) {
    new bootstrap.Modal(modalEl).show();
  }
};

window.saveCommitteeMember = async (e) => {
  e.preventDefault();
  const currentInstitutionId = window.currentInstitutionId || sessionStorage.getItem("currentInstitutionId");
  const name = document.getElementById("commName").value.trim().toUpperCase();
  const designation = document.getElementById("commDesignation").value.trim().toUpperCase();
  const phone = document.getElementById("commPhone").value.trim();
  const photoFile = document.getElementById("commPhotoFile")?.files[0];

  let photoBase64 = "";

  // ഫോട്ടോ സെലക്ട് ചെയ്തിട്ടുണ്ടെങ്കിൽ അതിനെ Base64 ആക്കി മാറ്റുന്നു
  if (photoFile) {
    photoBase64 = await toBase64(photoFile);
  }

  try {
    await addDoc(collection(db, "committee"), {
      institutionId: currentInstitutionId,
      name, 
      designation, 
      phone, 
      photo: photoBase64, // സേവ് ചെയ്യുന്ന ഫോട്ടോ
      timestamp: serverTimestamp()
    });

    const modalEl = document.getElementById("committeeModal");
    if (modalEl && window.bootstrap) {
      bootstrap.Modal.getInstance(modalEl).hide();
    }
    window.showToast("Committee member added successfully!", "success");
    window.loadCommitteeMembers();
  } catch (err) {
    window.showToast("Error: " + err.message, "error");
  }
};

// ഫയലിനെ Base64 ഫോർമാറ്റിലേക്ക് മാറ്റാൻ സഹായിക്കുന്ന ചെറിയ ഫംഗ്ഷൻ
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

window.deleteCommitteeMember = async (id) => {
  if (!confirm("Are you sure you want to delete this member?")) return;
  try {
    await deleteDoc(doc(db, "committee", id));
    window.showToast("Member removed.", "success");
    window.loadCommitteeMembers();
  } catch (err) {
    window.showToast("Error: " + err.message, "error");
  }
};
