import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const calendarEl = document.getElementById("calendar");

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const q = query(
    collection(db, "posts"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);
  calendarEl.innerHTML = "";

  snapshot.forEach(doc => {
    const post = doc.data();

    const div = document.createElement("div");
    div.className = "calendar-card";
    div.innerHTML = `
      <strong>${post.platform}</strong>
      <p>${post.caption}</p>
      <small>${new Date(post.time.seconds * 1000).toLocaleString()}</small>
    `;

    calendarEl.appendChild(div);
  });
});
