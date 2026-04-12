// ============================================
// CENTRAL STATE STORE (Single Source of Truth)
// ============================================

export const state = {
  user: {
    uid: null,
    email: null,
    displayName: null
  },
  activeView: "dashboard",
  loading: false,
  posts: []
};

// ============================================
// FIRESTORE OPERATIONS
// ============================================

import {
  savePost,
  updatePostFirestore,
  deletePostFirestore
} from "./firestore.js";

export async function addPost(post, uid) {
  await savePost(post, uid);
  state.posts.push(post);
}

export function getScheduledPosts() {
  return state.posts.filter(p => p.status === "scheduled");
}

export function getDrafts() {
  return state.posts.filter(p => p.status === "draft");
}

export async function deletePost(id) {
  await deletePostFirestore(id);
  state.posts = state.posts.filter(p => p.id !== id);
}

export async function updatePost(updatedPost) {
  await updatePostFirestore(updatedPost);
  const index = state.posts.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    state.posts[index] = updatedPost;
  }
}
