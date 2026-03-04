document.addEventListener("frame:ready", () => {
  // Inject title.html into the frame's title placeholder
  const titleContainer = document.getElementById("lesson-title");
  if (titleContainer) {
    fetch("./title.html")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load title.html");
        return res.text();
      })
      .then((titleContent) => {
        titleContainer.innerHTML = titleContent;
      })
      .catch((err) => console.error("TITLE LOAD FAILED:", err));
  }

  // Load content.html into #content
  fetch("./content.html")
    .then((res) => {
      if (!res.ok) throw new Error("Not OK");
      return res.text();
    })
    .then((content) => {
      document.getElementById("content").insertAdjacentHTML("beforeend", content);
      initSettings();
    })
    .catch((err) => console.error("CONTENT LOAD FAILED:", err));
});

function initSettings() {
  const content = document.getElementById("content");
  if (!content) return;

  // Section/sub navigation
  content.querySelectorAll(".settings-nav-item[data-section][data-sub]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      const sub = item.dataset.sub;
      showPanel(section, sub);
      content.querySelectorAll(".settings-nav-item").forEach((n) => n.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Show first panel by default
  const firstNav = content.querySelector(".settings-nav-item[data-section][data-sub]");
  if (firstNav) {
    firstNav.classList.add("active");
    showPanel(firstNav.dataset.section, firstNav.dataset.sub);
  }

  // Restore saved avatar in General preview
  const savedAvatar = localStorage.getItem("arco-avatar");
  const avatarImg = content.querySelector("[data-avatar-img]");
  if (savedAvatar && avatarImg) {
    avatarImg.src = savedAvatar.startsWith("/") ? savedAvatar : "/" + savedAvatar;
  }

  // Restore saved name
  const savedName = localStorage.getItem("arco-name");
  if (savedName) {
    const nameEl = content.querySelector('[data-value="name"]');
    if (nameEl) nameEl.textContent = savedName;
  }

  // Restore saved grade
  const savedGrade = localStorage.getItem("arco-grade");
  if (savedGrade) {
    const gradeEl = content.querySelector('[data-value="grade"]');
    if (gradeEl) gradeEl.textContent = savedGrade;
  }

  // Edit buttons
  content.querySelectorAll(".settings-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.edit === "avatar") {
        openAvatarModal(content);
      } else {
        openEditModal(btn.dataset.edit, content);
      }
    });
  });

  // Edit modal
  const modal = content.querySelector("#settings-edit-modal");
  const form = content.querySelector("#settings-edit-form");
  const editFieldInput = content.querySelector("#edit-field");
  const editValueInput = content.querySelector("#edit-value");
  const cancelBtn = modal?.querySelector(".settings-modal-cancel");
  const backdrop = modal?.querySelector(".settings-modal-backdrop");

  const editSelectInput = content.querySelector("#edit-select");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const field = editFieldInput?.value;
      let value;

      if (field === "name") {
        // Handle separate first and last name fields
        const firstName = content.querySelector("#edit-first-name")?.value?.trim();
        const lastName = content.querySelector("#edit-last-name")?.value?.trim();
        value = `${firstName}, ${lastName}`;
      } else {
        const isSelectField = field === "plan" || field === "payment" || field === "grade";
        value = isSelectField ? editSelectInput?.value : editValueInput?.value;
      }

      if (field && value !== undefined) {
        const valueEl = content.querySelector(`[data-value="${field}"]`);
        if (valueEl) valueEl.textContent = value;

        // Save to localStorage and sync to server
        if (field === "name") {
          localStorage.setItem("arco-name", value);
          if (typeof ArcoAPI !== 'undefined') ArcoAPI.updateProfile({ display_name: value });
        } else if (field === "grade") {
          localStorage.setItem("arco-grade", value);
          if (typeof ArcoAPI !== 'undefined') ArcoAPI.updateProfile({ grade: value });
        }

        closeEditModal(modal);
      }
    });
  }

  if (cancelBtn) cancelBtn.addEventListener("click", () => closeEditModal(modal));
  if (backdrop) backdrop.addEventListener("click", () => closeEditModal(modal));

  // Avatar modal - selection and close
  const avatarModal = content.querySelector("#settings-avatar-modal");
  content.querySelectorAll("#settings-avatar-modal .settings-avatar-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const img = opt.querySelector("img");
      const src = img?.src || opt.dataset.avatarSrc;
      if (src) {
        const avatarImg = content.querySelector("[data-avatar-img]");
        if (avatarImg) avatarImg.src = src;
        content.querySelectorAll("#settings-avatar-modal .settings-avatar-option").forEach((o) => o.classList.remove("active"));
        opt.classList.add("active");
        closeAvatarModal(avatarModal);

        const path = src.startsWith("http") ? new URL(src).pathname : src;
        localStorage.setItem("arco-avatar", path);
        if (typeof ArcoAPI !== 'undefined') ArcoAPI.updateProfile({ avatar: path });
      }
    });
  });
  content.querySelector("[data-avatar-cancel]")?.addEventListener("click", () => closeAvatarModal(avatarModal));
  content.querySelector("[data-avatar-backdrop]")?.addEventListener("click", () => closeAvatarModal(avatarModal));

  // Manage Account button (only in the Account panel)
  const manageBtn = content.querySelector('.settings-panel[data-sub="account"] .settings-primary-btn');
  if (manageBtn) {
    manageBtn.addEventListener("click", () => {
      manageBtn.textContent = "Account management coming soon.";
    });
  }

  // Parental Lock PIN — auto-advance boxes and save
  const pinBoxesSm = Array.from(content.querySelectorAll(".pin-box-sm"));
  pinBoxesSm.forEach((box, i) => {
    box.addEventListener("keydown", (e) => {
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        box.value = e.key;
        if (i < pinBoxesSm.length - 1) pinBoxesSm[i + 1].focus();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        box.value = "";
        if (i > 0) pinBoxesSm[i - 1].focus();
      }
    });
  });

  const savePinBtn = content.querySelector("#save-pin-btn");
  if (savePinBtn) {
    savePinBtn.addEventListener("click", () => {
      const pinStatus = document.querySelector("#pin-save-status");
      const pin = pinBoxesSm.map((b) => b.value).join("");
      if (pin.length < 4) {
        if (pinStatus) pinStatus.textContent = "Please enter all 4 digits.";
        return;
      }
      fetch("/api/childlock.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", pin }),
      })
        .then((res) => {
          pinBoxesSm.forEach((b) => (b.value = ""));
          if (res.status === 401) {
            if (pinStatus) pinStatus.textContent = "Please log in to change your PIN.";
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          if (pinStatus) {
            pinStatus.textContent = data.success ? "PIN saved!" : "Failed to save PIN.";
          }
        })
        .catch(() => {
          pinBoxesSm.forEach((b) => (b.value = ""));
          if (pinStatus) pinStatus.textContent = "Error saving PIN.";
        });
    });
  }
}

function showPanel(section, sub) {
  const content = document.getElementById("content");
  if (!content) return;
  content.querySelectorAll(".settings-panel").forEach((p) => p.classList.remove("active"));
  const panel = content.querySelector(`.settings-panel[data-section="${section}"][data-sub="${sub}"]`);
  if (panel) panel.classList.add("active");
}

function openEditModal(field, content) {
  const modal = content.querySelector("#settings-edit-modal");
  const editFieldInput = content.querySelector("#edit-field");
  const editValueInput = content.querySelector("#edit-value");
  const editSelectInput = content.querySelector("#edit-select");
  const nameFields = content.querySelector("#name-fields");
  const singleField = content.querySelector("#single-field");
  const valueEl = content.querySelector(`[data-value="${field}"]`);
  const labels = {
    name: "Edit Name",
    grade: "Edit Grade Level",
    plan: "Edit Tier",
    payment: "Edit Subscription",
  };
  const title = content.querySelector("#edit-modal-title");
  if (title) title.textContent = labels[field] || "Edit";
  if (editFieldInput) editFieldInput.value = field;

  // Handle name field with separate first/last name inputs
  if (field === "name" && nameFields && singleField) {
    // Show name fields, hide single field
    nameFields.hidden = false;
    singleField.hidden = true;
    if (editValueInput) editValueInput.required = false;
    if (editSelectInput) editSelectInput.required = false;

    // Parse current name value
    const currentName = valueEl?.textContent?.trim() || "";
    const nameParts = currentName.split(",").map(part => part.trim());
    const firstName = nameParts[0] || "";
    const lastName = nameParts[1] || "";

    const firstNameInput = content.querySelector("#edit-first-name");
    const lastNameInput = content.querySelector("#edit-last-name");

    if (firstNameInput) {
      firstNameInput.value = firstName;
      firstNameInput.required = true;
      firstNameInput.focus();
    }
    if (lastNameInput) {
      lastNameInput.value = lastName;
      lastNameInput.required = true;
    }
  }
  // Handle dropdown fields (plan, payment, and grade)
  else if (field === "plan" || field === "payment" || field === "grade") {
    if (nameFields && singleField) {
      nameFields.hidden = true;
      singleField.hidden = false;
    }
    if (editSelectInput && editValueInput) {
      // Hide text input, show dropdown
      editValueInput.hidden = true;
      editSelectInput.hidden = false;
      editSelectInput.required = true;
      editValueInput.required = false;

      // Populate dropdown options
      const options = {
        plan: ["Free", "Premium"],
        payment: ["Monthly", "Annually"],
        grade: ["Kindergarten", "1st", "2nd", "3rd", "4th", "5th"],
      };

      editSelectInput.innerHTML = "";
      options[field].forEach((option) => {
        const optionEl = document.createElement("option");
        optionEl.value = option;
        optionEl.textContent = option;
        editSelectInput.appendChild(optionEl);
      });

      // Set current value
      const currentValue = valueEl?.textContent?.trim();
      editSelectInput.value = currentValue || options[field][0];
      editSelectInput.focus();
    }
  } else {
    // Show text input, hide dropdown and name fields
    if (nameFields && singleField) {
      nameFields.hidden = true;
      singleField.hidden = false;
    }
    if (editValueInput && editSelectInput) {
      editValueInput.hidden = false;
      editSelectInput.hidden = true;
      editSelectInput.required = false;
      editValueInput.required = true;
      editValueInput.value = valueEl?.textContent ?? "";
      editValueInput.placeholder = "";
      editValueInput.focus();
    }
  }

  if (modal) {
    modal.hidden = false;
  }
}

function closeEditModal(modal) {
  if (modal) modal.hidden = true;
}

function openAvatarModal(content) {
  const modal = content.querySelector("#settings-avatar-modal");
  if (modal) modal.hidden = false;
}

function closeAvatarModal(modal) {
  if (modal) modal.hidden = true;
}
