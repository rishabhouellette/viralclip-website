import { db, auth } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const modal = document.getElementById("postModal");
const createBtn = document.querySelector("#createPostBtn");
const saveBtn = document.getElementById("savePost");

window.openModal = () => {
  modal.style.display = "block";
};

window.closeModal = () => {
  modal.style.display = "none";
};

createBtn?.addEventListener("click", openModal);

saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Not authenticated");

  const post = {
    uid: user.uid,
    platform: document.getElementById("platform").value,
    title: document.getElementById("title").value,
    schedule: document.getElementById("schedule").value,
    createdAt: serverTimestamp(),
    status: "scheduled"
  };

  await addDoc(collection(db, "posts"), post);

  closeModal();
  alert("Post scheduled");
  location.reload();
});
