import { state } from "./state.js";

let currentWeekStart = startOfWeek(new Date());

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // Sunday = 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(start) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDay(date) {
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

function renderCalendar() {
  const header = document.getElementById("calendar-header");
  const grid = document.getElementById("calendar-grid");

  if (!header || !grid) return;

  const days = getWeekDays(currentWeekStart);

  header.innerHTML = `
    <div class="time-col"></div>
    ${days.map(d => `<div class="day-col">${formatDay(d)}</div>`).join("")}
  `;

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am–11pm

  grid.innerHTML = hours.map(hour => `
    <div class="time-row">
      <div class="time-label">${hour}:00</div>
      ${days.map(day => renderCell(day, hour)).join("")}
    </div>
  `).join("");
}

function renderCell(day, hour) {
  const posts = state.posts.filter(p => {
    if (!p.scheduledAt) return false;
    const d = new Date(p.scheduledAt);
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate() &&
      d.getHours() === hour
    );
  });

  return `
    <div class="calendar-cell">
      ${posts.map(renderEvent).join("")}
    </div>
  `;
}

function renderEvent(post) {
  const platform = post.platform[0] || "generic";
  return `
    <div class="calendar-event ${platform}" data-edit="${post.id}">
      ${platform}
    </div>
  `;
}

// Controls
document.addEventListener("click", e => {
  if (e.target.id === "prev-week") {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderCalendar();
  }
  if (e.target.id === "next-week") {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderCalendar();
  }
  if (e.target.id === "today-week") {
    currentWeekStart = startOfWeek(new Date());
    renderCalendar();
  }
});

export function initCalendar() {
  renderCalendar();
}
