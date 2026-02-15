import { state, deletePost } from "./state.js";

document.addEventListener("click", (e) => {
  if (e.target.dataset.delete) {
    deletePost(e.target.dataset.delete);
    document.querySelector('[data-view="clips"]').click();
  }

  if (e.target.dataset.edit) {
    const post = state.posts.find(p => p.id === e.target.dataset.edit);
    if (post) {
      openEditModal(post);
    }
  }
});

function openEditModal(post) {
  const modal = document.getElementById("create-post-modal");
  modal.classList.remove("hidden");

  document.getElementById("post-caption").value = post.caption || "";
  document.getElementById("post-date").value = post.scheduledAt
    ? new Date(post.scheduledAt).toISOString().slice(0, 16)
    : "";
}
