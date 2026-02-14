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
  loading: false
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
