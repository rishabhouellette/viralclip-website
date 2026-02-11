const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".sidebar nav button");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(btn.dataset.page).classList.add("active");
  });
});

// LOGOUT
document.getElementById("logoutBtn").onclick = () => {
  firebase.auth().signOut();
};

// CALENDAR
const calendarGrid = document.getElementById("calendarGrid");

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= days; d++) {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.innerHTML = `<strong>${d}</strong>`;
    cell.dataset.date = `${year}-${month + 1}-${d}`;
    calendarGrid.appendChild(cell);
  }
}

renderCalendar();

// POSTS
db.collection("posts").onSnapshot(snapshot => {
  document.querySelectorAll(".post").forEach(p => p.remove());

  snapshot.forEach(doc => {
    const data = doc.data();
    const cell = [...document.querySelectorAll(".day")]
      .find(d => d.dataset.date === data.date);

    if (cell) {
      const el = document.createElement("div");
      el.className = "post";
      el.textContent = data.title;
      cell.appendChild(el);
    }
  });
});

// MODAL
const modal = document.getElementById("postModal");

document.getElementById("openPostModal").onclick = () => {
  modal.classList.remove("hidden");
};

document.getElementById("closeModal").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("savePost").onclick = async () => {
  const date = document.getElementById("postDate").value;
  const title = document.getElementById("postTitle").value;

  if (!date || !title) return;

  await db.collection("posts").add({ date, title });
  modal.classList.add("hidden");
};

