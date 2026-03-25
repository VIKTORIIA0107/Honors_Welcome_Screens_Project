import { roomsData, normaliseSearchQuery } from "./data.js";
import { openMap } from "./map.js";
import { bindPress, capitalise, escapeHtml } from "./ui.js";

export function setupSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const keyboard = document.getElementById("onscreenKeyboard");

  if (!searchBtn || !searchInput) return;

  let timeout;

  bindPress(searchBtn, performSearch);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch();
    }
  });

  searchInput.addEventListener("pointerdown", () => {
    searchInput.focus();
    openKeyboard(keyboard);
  });

  searchInput.addEventListener("focus", () => {
    openKeyboard(keyboard);
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(timeout);

    const value = searchInput.value.trim();

    if (!value) {
      clearSearchResults();
      return;
    }

    timeout = setTimeout(() => {
      performSearch();
    }, 150);
  });
}

function openKeyboard(keyboard) {
  if (!keyboard) return;
  keyboard.classList.remove("hidden");
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
    clearSearchResults();
    return;
  }

  if (query.length < 2) {
    resultsContainer.innerHTML = "";
    message.textContent = "Type at least 2 characters to search.";
    return;
  }

  const matches = roomsData.filter((item) => {
    const haystack = item.searchText || "";
    return haystack.includes(query);
  });

  renderResults(matches, rawQuery);
}

function clearSearchResults() {
  const resultsContainer = document.getElementById("results");
  const message = document.getElementById("searchMessage");

  if (!resultsContainer || !message) return;

  resultsContainer.innerHTML = "";
  message.textContent = "";
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
    if (lecturersText && item.type !== "facility") {
      subtitleParts.push(`Lecturer: ${lecturersText}`);
    }
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

    const button = card.querySelector(".small-btn");
    bindPress(button, () => openMap(item));

    resultsContainer.appendChild(card);
  });
}