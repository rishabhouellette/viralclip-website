// ============================================
// STATE MANAGEMENT
// ============================================

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

export function addPost(post) {
  state.posts.push(post);
}

export function getScheduledPosts() {
  return state.posts.filter(p => p.status === "scheduled");
}

export function getDrafts() {
  return state.posts.filter(p => p.status === "draft");
}

export function deletePost(id) {
  state.posts = state.posts.filter(p => p.id !== id);
}

export function updatePost(updatedPost) {
  const index = state.posts.findIndex(p => p.id === updatedPost.id);
  if (index !== -1) {
    state.posts[index] = updatedPost;
  }
}
