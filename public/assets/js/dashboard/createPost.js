import { addPost } from "./state.js";

const modal = document.getElementById("create-post-modal");

function openModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  // Clear form
  document.getElementById("post-caption").value = "";
  document.getElementById("post-date").value = "";
  document.querySelectorAll(".platform-select input").forEach(i => i.checked = false);
}

// Use event delegation on topbar for dynamic buttons
document.addEventListener("click", (e) => {
  if (e.target.closest(".primary-btn")?.textContent.includes("Create")) {
    openModal();
  }
});

document.getElementById("close-modal")?.addEventListener("click", closeModal);

document.getElementById("save-draft")?.addEventListener("click", () => {
  savePost("draft");
});

document.getElementById("schedule-post")?.addEventListener("click", () => {
  savePost("scheduled");
});

function savePost(status) {
  const platforms = [...document.querySelectorAll(".platform-select input:checked")]
    .map(i => i.value);

  const caption = document.getElementById("post-caption").value;
  const dateValue = document.getElementById("post-date").value;

  if (platforms.length === 0) {
    alert("Please select at least one platform");
    return;
  }

  if (!caption.trim()) {
    alert("Please add a caption");
    return;
  }

  if (status === "scheduled" && !dateValue) {
    alert("Please select a schedule date");
    return;
  }

  (async () => {
    await addPost({
      id: null,
      platform: platforms,
      caption,
      scheduledAt: status === "scheduled" ? new Date(dateValue) : null,
      status
    }, window.appUser.uid);

    console.log("Post saved:", { platforms, caption, status });
    closeModal();
  })();
}
