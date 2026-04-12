import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "../firebase.js";

const modal = document.getElementById("create-post-modal");
const captionInput = document.getElementById("post-caption");
const scheduleInput = document.getElementById("post-date");
const scheduleBtn = document.getElementById("schedule-post");
const saveDraftBtn = document.getElementById("save-draft");

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

saveDraftBtn?.addEventListener("click", () => {
  alert("Drafts are not supported yet.");
});

scheduleBtn?.addEventListener("click", async () => {
  await savePost();
});

function getSelectedPlatforms() {
  return [...document.querySelectorAll(".platform-select input:checked")]
    .map(i => i.value);
}

async function savePost() {
  try {
    if (!auth.currentUser) {
      alert("Not authenticated");
      return;
    }

    const uid = auth.currentUser.uid;

    const post = {
      caption: captionInput.value.trim(),
      platforms: getSelectedPlatforms(),
      scheduledAt: new Date(scheduleInput.value),
      status: "scheduled",
      createdAt: serverTimestamp()
    };

    if (!post.caption || post.platforms.length === 0) {
      alert("Missing caption or platform");
      return;
    }

    const postsRef = collection(db, "users", uid, "posts");
    await addDoc(postsRef, post);

    closeModal();
    console.log("Post scheduled successfully");
  } catch (err) {
    console.error("Create post failed:", err);
    alert(err.message);
  }
}
