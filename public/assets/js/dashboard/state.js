// ============================================
// STATE MANAGEMENT
// ============================================

import {
  savePost,
  updatePostFirestore,
  deletePostFirestore
} from "./firestore.js";

export const state = {
  user: {
    name: "",
    email: "",
    plan: "Pro",
    avatar: null
  },
  activeView: "dashboard",
  loading: false,
  posts: []
};

// State update with callback
export function updateState(updates, callback) {
  Object.assign(state, updates);
  if (callback) callback(state);
}

// Get current state
export function getState() {
  return { ...state };
}

// ============================================
// POSTS MANAGEMENT
// ============================================

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
    state.posts[index] = updatedPost;
  }
}
