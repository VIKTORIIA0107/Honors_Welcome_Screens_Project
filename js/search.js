import { roomsData } from "./data.js";
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

  if (!searchInput || !resultsContainer) return;

  const query = searchInput.value.trim().toLowerCase();
  resultsContainer.innerHTML = "";

  if (message) message.textContent = "";

  if (!query) {
    if (message) {
      message.textContent = "Enter a room code, room name, lecturer, or facility.";
    }
    return;
  }

  const matches = roomsData.filter((item) => {
    const roomCode = String(item.room || "").toLowerCase();
    const name = String(item.name || "").toLowerCase();
    const type = String(item.type || "").toLowerCase();
    const keywords = Array.isArray(item.keywords) ? item.keywords.join(" ").toLowerCase() : "";
    const lecturers = Array.isArray(item.lecturers) ? item.lecturers.join(" ").toLowerCase() : "";

    return (
      roomCode.includes(query) ||
      name.includes(query) ||
      type.includes(query) ||
      keywords.includes(query) ||
      lecturers.includes(query)
    );
  });

  renderResults(matches, query);
}

function renderResults(list, query) {
  const resultsContainer = document.getElementById("results");
  const message = document.getElementById("searchMessage");

  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";

  if (list.length === 0) {
    if (message) message.textContent = `No results found for "${query}".`;
    resultsContainer.innerHTML = `<div class="empty-state">No matches found.</div>`;
    return;
  }

  if (message) {
    message.textContent = `${list.length} result${list.length === 1 ? "" : "s"} found.`;
  }

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