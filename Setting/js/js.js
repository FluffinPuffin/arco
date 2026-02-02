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
  const cancelBtn = content.querySelector(".settings-modal-cancel");
  const backdrop = content.querySelector(".settings-modal-backdrop");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const field = editFieldInput?.value;
      const value = editValueInput?.value;
      if (field && value !== undefined) {
        const valueEl = content.querySelector(`[data-value="${field}"]`);
        if (valueEl) valueEl.textContent = value;
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
      }
    });
  });
  content.querySelector("[data-avatar-cancel]")?.addEventListener("click", () => closeAvatarModal(avatarModal));
  content.querySelector("[data-avatar-backdrop]")?.addEventListener("click", () => closeAvatarModal(avatarModal));

  // Manage Account button
  const manageBtn = content.querySelector(".settings-primary-btn");
  if (manageBtn) {
    manageBtn.addEventListener("click", () => {
      manageBtn.textContent = "Account management coming soon.";
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
  const valueEl = content.querySelector(`[data-value="${field}"]`);
  const labels = {
    name: "Edit Name",
    grade: "Edit Grade Level",
    plan: "Edit Plan",
    payment: "Edit Payment",
  };
  const title = content.querySelector("#edit-modal-title");
  if (title) title.textContent = labels[field] || "Edit";
  if (editFieldInput) editFieldInput.value = field;
  if (editValueInput) editValueInput.value = valueEl?.textContent ?? "";
  if (modal) {
    modal.hidden = false;
    editValueInput?.focus();
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
