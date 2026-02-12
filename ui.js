import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "/firebase.js";
import { logoutUser, watchAuthState } from "/auth.js";

const sections = document.querySelectorAll(".section");
const navButtons = document.querySelectorAll(".nav-btn");
const pageTitle = document.getElementById("pageTitle");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modal = document.getElementById("modal");
const createPostForm = document.getElementById("createPostForm");
const postList = document.getElementById("postList");
const logoutBtn = document.getElementById("logoutBtn");
const calendarGrid = document.getElementById("calendarGrid");

const titles = {
  calendar: "Content Calendar",
  posts: "My Posts",
  settings: "Settings"
};

function setActiveSection(id) {
  sections.forEach((section) => {
    section.classList.toggle("active", section.id === id);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === id);
  });

  pageTitle.textContent = titles[id] || "Dashboard";
}

function openModal() {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  createPostForm.reset();
}

function renderCalendarPreview() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  calendarGrid.innerHTML = days
    .map((day) => `<div class="calendar-day"><span>${day}</span></div>`)
    .join("");
}

function renderPosts(posts) {
  if (!posts.length) {
    postList.innerHTML = "<li class='empty-state'>No posts yet. Create your first one.</li>";
    return;
  }

  postList.innerHTML = posts
    .map((post) => {
      const date = post.scheduledFor?.toDate
        ? post.scheduledFor.toDate().toLocaleDateString()
        : "No date";

      return `
        <li class="post-item">
          <h4>${post.title}</h4>
          <p>${post.caption}</p>
          <small>Scheduled: ${date}</small>
        </li>
      `;
    })
    .join("");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => setActiveSection(button.dataset.section));
});

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

logoutBtn.addEventListener("click", async () => {
  await logoutUser();
  window.location.href = "/login.html";
});

watchAuthState((user) => {
  if (!user) return;

  const postsQuery = query(
    collection(db, "posts"),
    where("uid", "==", user.uid),
    orderBy("scheduledFor", "asc")
  );

  onSnapshot(postsQuery, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderPosts(posts);
  });

  createPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(createPostForm);
    const title = String(formData.get("title") || "").trim();
    const caption = String(formData.get("caption") || "").trim();
    const scheduledFor = String(formData.get("scheduledFor") || "");

    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      title,
      caption,
      scheduledFor: new Date(`${scheduledFor}T12:00:00`),
      createdAt: serverTimestamp()
    });

    closeModal();
  });
});

renderCalendarPreview();
