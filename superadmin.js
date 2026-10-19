// ==========================================
// SUPER ADMIN MASTER MANAGEMENT MODULE (superadmin.js)
// ==========================================
import { db } from "./firebase-config.js";
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1. Super Admin Table Data & Approved Institutions Loader
window.loadSuperAdminRequests = async () => {
  const tableBody = document.getElementById("superAdminTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Loading institutions...</td></tr>`;

  try {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);
    let html = "";

    if (querySnapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No Madrasa Registrations Found.</td></tr>`;
      window.populateSuperAdminInstitutionDropdown([]);
      return;
    }

    const approvedList = [];

    querySnapshot.forEach((docSnap) => {
      const user = docSnap.data();
      const isPending = user.status === "pending";
      const shortCode = user.shortCode || "-";

      const safeInstName = (user.institutionName || '').replace(/'/g, "\\'");
      const safeAdminName = (user.name || '').replace(/'/g, "\\'");
      const safeEmail = (user.email || '').replace(/'/g, "\\'");

      if (user.institutionId) {
        approvedList.push({
          id: user.institutionId,
          name: user.institutionName || user.institutionId,
          shortCode: shortCode
        });
      }

      html += `
        <tr>
          <td><span class="badge bg-primary fs-6">${shortCode}</span></td>
          <td><b>${user.institutionId || '-'}</b></td>
          <td>${user.institutionName || 'Smart Madrasa'}</td>
          <td>${user.email || '-'}</td>
          <td>${user.name || '-'}</td>
          <td class="text-center">${user.phone || '-'}</td>
          <td>
            <span class="badge ${isPending ? 'bg-warning text-dark' : 'bg-success'}">
              ${isPending ? 'Pending' : 'Active'}
            </span>
          </td>
          <td class="text-center">
            <div class="d-flex align-items-center justify-content-center gap-1">
              ${isPending 
                ? `<button class="btn btn-sm btn-success px-2" onclick="window.approveMadrasaAdmin('${docSnap.id}')" title="Approve"><i class="fa-solid fa-check"></i></button>`
                : `<span class="badge bg-light text-dark border me-1">Approved</span>`
              }
              <button class="btn btn-sm btn-outline-primary px-2" onclick="window.editMadrasaDetails('${docSnap.id}', '${safeInstName}', '${safeAdminName}', '${user.phone || ''}', '${shortCode}', '${safeEmail}')" title="Edit Madrasa">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger px-2" onclick="window.deleteMadrasaAdmin('${docSnap.id}', '${safeInstName}')" title="Delete Madrasa">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    // ഡ്രോപ്പ്ഡൗണിലേക്ക് മദ്രസകൾ ഫെച്ച് ചെയ്തു നൽകുന്നു
    window.populateSuperAdminInstitutionDropdown(approvedList);

  } catch (e) {
    console.error("Error loading super admin data:", e);
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading data: ${e.message}</td></tr>`;
  }
};

// 2. അപ്രൂവ് ചെയ്ത മദ്രസകൾ ഡ്രോപ്പ്ഡൗണിൽ ഫിൽ ചെയ്യുന്ന ഫങ്ഷൻ
window.populateSuperAdminInstitutionDropdown = function(institutionsArray) {
  const selectEl = document.getElementById("saSelectedInstitutionSelect");
  if (!selectEl) return;

  if (!institutionsArray || institutionsArray.length === 0) {
    selectEl.innerHTML = `<option value="">-- No Approved Institutions Found --</option>`;
    return;
  }

  let html = `<option value="">-- Select Approved Institution --</option>`;
  institutionsArray.forEach(inst => {
    const codeTag = (inst.shortCode && inst.shortCode !== '-') ? `[${inst.shortCode}] ` : '';
    html += `<option value="${inst.id}">${codeTag}${inst.name} (${inst.id})</option>`;
  });

  selectEl.innerHTML = html;
};

// 3. ഡ്രോപ്പ്ഡൗണിൽ മദ്രസ തിരഞ്ഞെടുക്കുമ്പോൾ ആ മദ്രസയുടെ സെറ്റിങ്സുകൾ എടുത്തു കാണിക്കുന്ന ഫങ്ഷൻ
window.loadSelectedInstitutionSettings = async function() {
  const targetInstId = document.getElementById("saSelectedInstitutionSelect")?.value;
  const displayIdEl = document.getElementById("displaySelectedInstId");
  
  if (displayIdEl) displayIdEl.innerText = targetInstId || '-';

  if (!targetInstId) return;

  try {
    const docRef = doc(db, "settings", targetInstId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();

      if (document.getElementById("saSettingSortOrder")) {
        document.getElementById("saSettingSortOrder").value = data.sortOrder || "REG_NO";
      }
      if (document.getElementById("saSettingAttPermission")) {
        document.getElementById("saSettingAttPermission").value = data.attendancePermission || "ASSIGNED_ONLY";
      }
      if (document.getElementById("saSettingFeePermission")) {
        document.getElementById("saSettingFeePermission").value = data.feePermission || "ALL";
      }
      if (document.getElementById("saSettingAllowPhoto")) {
        document.getElementById("saSettingAllowPhoto").checked = (data.allowPhotoUpload !== false);
      }
      if (document.getElementById("saSettingParentStarPoints")) {
        document.getElementById("saSettingParentStarPoints").checked = (data.showParentStarPoints !== false);
      }
      if (document.getElementById("saSettingReqManualReceipt")) {
        document.getElementById("saSettingReqManualReceipt").checked = (data.reqManualReceipt === true);
      }
    } else {
      if (document.getElementById("saSettingSortOrder")) document.getElementById("saSettingSortOrder").value = "REG_NO";
      if (document.getElementById("saSettingAttPermission")) document.getElementById("saSettingAttPermission").value = "ASSIGNED_ONLY";
      if (document.getElementById("saSettingFeePermission")) document.getElementById("saSettingFeePermission").value = "ALL";
      if (document.getElementById("saSettingAllowPhoto")) document.getElementById("saSettingAllowPhoto").checked = true;
      if (document.getElementById("saSettingParentStarPoints")) document.getElementById("saSettingParentStarPoints").checked = true;
      if (document.getElementById("saSettingReqManualReceipt")) document.getElementById("saSettingReqManualReceipt").checked = false;
    }
  } catch (e) {
    console.error("Error fetching settings for institution:", e);
    window.showToast("Failed to load settings: " + e.message, "error");
  }
};

// 4. തെരഞ്ഞെടുത്ത മദ്രസയുടെ കൺട്രോൾ സെറ്റിങ്സുകൾ സേവ് ചെയ്യുന്ന ഫങ്ഷൻ
window.saveMasterControlSettings = async function() {
  const targetInstId = document.getElementById("saSelectedInstitutionSelect")?.value;

  if (!targetInstId) {
    window.showToast("Please select an institution from the dropdown first!", "warning");
    return;
  }

  const sortOrder = document.getElementById("saSettingSortOrder")?.value || "REG_NO";
  const attPerm = document.getElementById("saSettingAttPermission")?.value || "ASSIGNED_ONLY";
  const feePerm = document.getElementById("saSettingFeePermission")?.value || "ALL";
  const allowPhoto = document.getElementById("saSettingAllowPhoto")?.checked ?? true;
  const showParentStars = document.getElementById("saSettingParentStarPoints")?.checked ?? true;
  const reqManualReceipt = document.getElementById("saSettingReqManualReceipt")?.checked ?? false;

  try {
    await setDoc(doc(db, "settings", targetInstId), {
      institutionId: targetInstId,
      sortOrder: sortOrder,
      attendancePermission: attPerm,
      feePermission: feePerm,
      allowPhotoUpload: allowPhoto,
      showParentStarPoints: showParentStars,
      reqManualReceipt: reqManualReceipt,
      updatedAt: serverTimestamp()
    }, { merge: true });

    window.showToast(`Settings updated successfully for ${targetInstId}!`, "success");
  } catch (e) {
    console.error("Error saving master control settings:", e);
    window.showToast("Failed to save settings: " + e.message, "error");
  }
};

// 5. മദ്രസ അക്കൗണ്ട് അപ്രൂവ് ചെയ്യുന്ന ഫങ്ഷൻ
window.approveMadrasaAdmin = async (userId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      status: "active",
      updatedAt: serverTimestamp()
    });
    window.showToast("Madrasa registration approved successfully!", "success");
    window.loadSuperAdminRequests();
  } catch (e) {
    window.showToast("Error approving Madrasa: " + e.message, "error");
  }
};
