const content = document.getElementById("content");
const buttons = document.querySelectorAll("[data-view]");

async function loadView(view) {
  try {
    const res = await fetch(`views/${view}.html`);
    const html = await res.text(); // ✅ TEXT, not JSON
    content.innerHTML = html;
  } catch (err) {
    content.innerHTML = "<p>Error loading view</p>";
    console.error(err);
  }
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    loadView(btn.dataset.view);
  });
});

// Load default view
loadView("calendar");
