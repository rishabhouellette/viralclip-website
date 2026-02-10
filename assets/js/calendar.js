import { auth, db } from "./firebase.js";
import { addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function createPost({ platform, title, datetime }) {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(
    collection(db, "users", user.uid, "posts"),
    {
      platform,
      title,
      datetime,
      status: "scheduled",
      createdAt: new Date()
    }
  );
}

export async function loadPosts() {
  const user = auth.currentUser;
  if (!user) return [];

  const snapshot = await getDocs(
    collection(db, "users", user.uid, "posts")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
