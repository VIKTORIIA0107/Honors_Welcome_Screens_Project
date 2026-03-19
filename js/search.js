import { roomsData, normaliseSearchQuery } from "./data.js";
import { openMap } from "./map.js";
import { capitalise, escapeHtml } from "./ui.js";

export function setupSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") performSearch();
  });
}

function performSearch() {
  const searchInput = document.getElementById("searchInput");
  const resultsContainer = document.getElementById("results");
  const message = document.getElementById("searchMessage");

  if (!searchInput || !resultsContainer || !message) return;

  const rawQuery = searchInput.value.trim();
  const query = normaliseSearchQuery(rawQuery);

  resultsContainer.innerHTML = "";
  message.textContent = "";

  if (!query) {
    message.textContent = "Enter a room code, room name, lecturer, or facility.";
    return;
  }

  const matches = roomsData.filter((item) => {
    const haystack = item.searchText || "";
    return haystack.includes(query);
  });

  renderResults(matches, rawQuery);
}

function renderResults(list, rawQuery) {
  const resultsContainer = document.getElementById("results");
  const message = document.getElementById("searchMessage");

  if (!resultsContainer || !message) return;

  resultsContainer.innerHTML = "";

  if (!list.length) {
    message.textContent = `No results found for "${rawQuery}".`;
    resultsContainer.innerHTML = `<div class="empty-state">No matches found.</div>`;
    return;
  }

  message.textContent = `${list.length} result${list.length === 1 ? "" : "s"} found.`;

  list.forEach((item) => {
    const code = item.room || "";
    const title = item.name || code || "Unnamed location";
    const lecturersText = Array.isArray(item.lecturers) ? item.lecturers.join(", ") : "";

    const subtitleParts = [];
    if (code) subtitleParts.push(`Room ${code}`);
    if (lecturersText) subtitleParts.push(`Lecturer: ${lecturersText}`);
    if (item.floor) subtitleParts.push(`${capitalise(item.floor)} floor`);
    if (item.type) subtitleParts.push(capitalise(item.type));

    const card = document.createElement("div");
    card.className = "result-card";

    card.innerHTML = `
      <div class="result-info">
        <h3>${escapeHtml(title)}</h3>
        <p>${subtitleParts.map(escapeHtml).join(" • ")}</p>
      </div>
      <button class="small-btn" type="button">Show on Map</button>
    `;

    card.querySelector(".small-btn").addEventListener("click", () => openMap(item));
    resultsContainer.appendChild(card);
  });
}