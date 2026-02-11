function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });

  document.getElementById(id).classList.add('active');

  const titles = {
    calendar: "Content Calendar",
    clips: "Clips",
    accounts: "Accounts",
    analytics: "Analytics"
  };

  document.getElementById("pageTitle").innerText = titles[id];
}

function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
