import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function createPost() {
  const title = document.getElementById("postTitle").value;
  const caption = document.getElementById("postCaption").value;
  const user = auth.currentUser;

  if (!user || !title) return alert("Missing data");

  await addDoc(collection(db, "posts"), {
    uid: user.uid,
    title,
    caption,
    createdAt: serverTimestamp()
  });

  closeModal();
  loadPosts();
}

async function loadPosts() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "posts"),
    where("uid", "==", user.uid)
  );

  const snap = await getDocs(q);
  const container = document.getElementById("calendar");
  container.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `<strong>${d.title}</strong><p>${d.caption}</p>`;
    container.appendChild(div);
  });
}

function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

window.createPost = createPost;
window.openModal = openModal;
window.closeModal = closeModal;
window.showSection = showSection;

auth.onAuthStateChanged(user => {
  if (user) loadPosts();
});
