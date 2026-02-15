import { addPost } from "./state.js";

const modal = document.getElementById("create-post-modal");

function openModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

document.querySelectorAll(".primary-btn").forEach(btn => {
  if (btn.textContent.includes("Create")) {
    btn.addEventListener("click", openModal);
  }
});

document.getElementById("close-modal").addEventListener("click", closeModal);

document.getElementById("save-draft").addEventListener("click", () => {
  savePost("draft");
});

document.getElementById("schedule-post").addEventListener("click", () => {
  savePost("scheduled");
});

function savePost(status) {
  const platforms = [...document.querySelectorAll(".platform-select input:checked")]
    .map(i => i.value);

  const caption = document.getElementById("post-caption").value;
  const dateValue = document.getElementById("post-date").value;

  addPost({
    id: crypto.randomUUID(),
    platform: platforms,
    caption,
    scheduledAt: status === "scheduled" ? new Date(dateValue) : null,
    status
  });

  closeModal();
}
