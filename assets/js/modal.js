import { auth, db } from "./firebase.js";
import { addDoc, collection, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const modal = document.getElementById("postModal");
const createBtn = document.querySelector("#createPostBtn");

window.openModal = () => {
  modal.style.display = "block";
};

window.closeModal = () => {
  modal.style.display = "none";
};

createBtn?.addEventListener("click", openModal);

document.getElementById("createPostForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const platform = e.target.platform.value;
    const caption = e.target.caption.value;
    const time = new Date(e.target.time.value);

    const user = auth.currentUser;
    if (!user) return alert("Not authenticated");

    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      platform,
      caption,
      time: Timestamp.fromDate(time),
      createdAt: Timestamp.now()
    });

    location.reload();
  });
