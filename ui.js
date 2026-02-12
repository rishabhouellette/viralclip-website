import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";
import { logoutAndRedirect, watchAuthState } from "./auth.js";

const pageTitle = document.getElementById("pageTitle");
const sectionButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const postModal = document.getElementById("postModal");
const postForm = document.getElementById("createPostForm");
const postTitleInput = document.getElementById("postTitle");
const postCaptionInput = document.getElementById("postCaption");
const logoutBtn = document.getElementById("logoutBtn");

const postsList = document.getElementById("postsList");
const modalMessage = document.getElementById("modalMessage");

const sectionTitles = {
  calendar: "Content Calendar",
  settings: "Settings"
};

let currentUid = null;
let unsubscribePosts = null;

function showSection(targetSectionId) {
  sections.forEach((section) => {
    section.classList.toggle("active", section.id === targetSectionId);
  });

  sectionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === targetSectionId);
  });

  pageTitle.textContent = sectionTitles[targetSectionId] || "Dashboard";
}

function openModal() {
  postModal.classList.remove("hidden");
  postModal.setAttribute("aria-hidden", "false");
  modalMessage.textContent = "";
  postTitleInput.focus();
}

function closeModal() {
  postModal.classList.add("hidden");
  postModal.setAttribute("aria-hidden", "true");
  postForm.reset();
  modalMessage.textContent = "";
}

function renderPosts(posts) {
  if (!posts.length) {
    postsList.innerHTML = `<li class="empty-post">No posts yet. Click "Create Post" to add your first post.</li>`;
    return;
  }

  postsList.innerHTML = posts
    .map((post) => {
      const createdAt = post.createdAt?.toDate
        ? post.createdAt.toDate().toLocaleString()
        : "Saving...";

      return `
        <li class="post-item">
          <div class="post-head">
            <h4>${escapeHtml(post.title)}</h4>
            <span>${createdAt}</span>
          </div>
          <p>${escapeHtml(post.caption)}</p>
        </li>
      `;
    })
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
postModal.addEventListener("click", (event) => {
  if (event.target === postModal) {
    closeModal();
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await logoutAndRedirect();
  } catch (error) {
    alert(`Sign out failed: ${error.message}`);
  }
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUid) {
    modalMessage.textContent = "You must be logged in to create posts.";
    return;
  }

  const title = postTitleInput.value.trim();
  const caption = postCaptionInput.value.trim();

  if (!title || !caption) {
    modalMessage.textContent = "Please enter both a title and caption.";
    return;
  }

  const saveBtn = postForm.querySelector("button[type='submit']");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    await addDoc(collection(db, "posts"), {
      uid: currentUid,
      title,
      caption,
      createdAt: serverTimestamp()
    });

    closeModal();
    showSection("calendar");
  } catch (error) {
    modalMessage.textContent = `Unable to save post: ${error.message}`;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Post";
  }
});

watchAuthState((user) => {
  if (!user) {
    currentUid = null;

    if (unsubscribePosts) {
      unsubscribePosts();
      unsubscribePosts = null;
    }

    return;
  }

  currentUid = user.uid;

  if (unsubscribePosts) {
    unsubscribePosts();
  }

  const postsRef = query(
    collection(db, "posts"),
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  unsubscribePosts = onSnapshot(
    postsRef,
    (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      renderPosts(posts);
    },
    (error) => {
      postsList.innerHTML = `<li class="empty-post">Unable to load posts: ${error.message}</li>`;
    }
  );
});
