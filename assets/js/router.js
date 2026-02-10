const content = document.getElementById("content");
const buttons = document.querySelectorAll("[data-view]");

async function loadView(view) {
  const res = await fetch(`dashboard/views/${view}.html`);
  const html = await res.text();
  content.innerHTML = html;

  buttons.forEach(btn => btn.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`).classList.add("active");
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    loadView(btn.dataset.view);
  });
});

loadView("calendar");
