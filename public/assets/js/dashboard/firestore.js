import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { state } from "./state.js";

const db = getFirestore();
const postsRef = collection(db, "posts");

/**
 * Load posts for current user
 */
export async function loadPosts(uid) {
  const q = query(postsRef, where("uid", "==", uid));
  const snapshot = await getDocs(q);

  state.posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledAt: doc.data().scheduledAt?.toDate() || null
  }));
}

/**
 * Save new post
 */
export async function savePost(post, uid) {
  const docRef = await addDoc(postsRef, {
    uid,
    platform: post.platform,
    caption: post.caption,
    scheduledAt: post.scheduledAt || null,
    status: post.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  post.id = docRef.id;
}

/**
 * Update post
 */
export async function updatePostFirestore(post) {
  const ref = doc(db, "posts", post.id);
  await updateDoc(ref, {
    platform: post.platform,
    caption: post.caption,
    scheduledAt: post.scheduledAt || null,
    status: post.status,
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete post
 */
export async function deletePostFirestore(id) {
  await deleteDoc(doc(db, "posts", id));
}
