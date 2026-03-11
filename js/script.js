let roomsData = [];
let currentMarkerData = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadRoomData();

  setupSearch();
  setupFloorTabs();
  setupFacilities();
  initialiseMapPage();
});

async function loadRoomData() {
  try {
    const response = await fetch("../data/rooms.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data.rooms)) {
      roomsData = data.rooms;
    } else if (Array.isArray(data.room)) {
      roomsData = data.room;
    } else if (Array.isArray(data)) {
      roomsData = data;
    } else {
      roomsData = [];
    }
  } catch (error) {
    console.error("Could not load rooms.json:", error);
    roomsData = [];

    const message = document.getElementById("searchMessage");
    if (message) {
      message.textContent = "Could not load room data.";
    }
  }
}

/* ---------------- SEARCH ---------------- */

function setupSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      performSearch();
    }
  });

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");

  if (initialQuery) {
    searchInput.value = initialQuery;
    performSearch();
  }
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
    const roomCode = String(item.room || item.rooms || "").toLowerCase();
    const name = String(item.name || "").toLowerCase();
    const lecturer = String(item.lecturer || "").toLowerCase();
    const type = String(item.type || "").toLowerCase();
    const keywords = Array.isArray(item.keywords)
      ? item.keywords.join(" ").toLowerCase()
      : "";

    return (
      roomCode.includes(query) ||
      name.includes(query) ||
      lecturer.includes(query) ||
      type.includes(query) ||
      keywords.includes(query)
    );
  });

  renderResults(matches, query);
}

function renderResults(list, query = "") {
  const resultsContainer = document.getElementById("results");
  const message = document.getElementById("searchMessage");

  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";

  if (list.length === 0) {
    if (message) {
      message.textContent = `No results found for "${query}".`;
    }

    resultsContainer.innerHTML = `
      <div class="empty-state">
        No rooms, lecturers, or facilities matched your search.
      </div>
    `;
    return;
  }

  if (message) {
    message.textContent = `${list.length} result${list.length === 1 ? "" : "s"} found.`;
  }

  list.forEach((item) => {
    const code = item.room || item.rooms || "";
    const title = item.name || code || "Unnamed location";

    const subtitleParts = [];
    if (code && item.name) subtitleParts.push(`Room ${code}`);
    if (item.lecturer) subtitleParts.push(`Lecturer: ${item.lecturer}`);
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

    card.querySelector(".small-btn").addEventListener("click", () => {
      openMap(item);
    });

    resultsContainer.appendChild(card);
  });
}

/* ---------------- MAP ---------------- */

function openMap(item) {
  const fromPage = window.location.pathname.includes("facilities")
    ? "facilities"
    : "search";

  const params = new URLSearchParams({
    floor: item.floor || "ground",
    x: String(Number(item.x) || 0),
    y: String(Number(item.y) || 0),
    label: item.name || item.room || item.rooms || "Selected location",
    from: fromPage
  });

  window.location.href = `map.html?${params.toString()}`;
}

function setupFloorTabs() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateFloor(tab.dataset.floor);
    });
  });
}

function activateFloor(floor) {
  const tabs = document.querySelectorAll(".tab");
  const maps = document.querySelectorAll(".floor-map");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.floor === floor);
  });

  maps.forEach((map) => {
    map.classList.remove("active-map");
  });

  const activeMap = document.getElementById(`${floor}Map`);
  if (activeMap) {
    activeMap.classList.add("active-map");
  }

  updateMarkerPosition();
}

function initialiseMapPage() {
  const marker = document.getElementById("marker");
  if (!marker) return;

  const params = new URLSearchParams(window.location.search);
  const floor = params.get("floor");
  const x = Number(params.get("x"));
  const y = Number(params.get("y"));
  const label = params.get("label");

  if (!floor) return;

  currentMarkerData = {
    floor,
    x,
    y,
    label: label || "Selected location"
  };

  activateFloor(floor);

  const selectedRoomText = document.getElementById("selectedRoomText");
  if (selectedRoomText) {
    selectedRoomText.textContent = `${currentMarkerData.label}`;
  }

  const activeImage = document.getElementById(`${floor}Map`);
  if (activeImage) {
    if (activeImage.complete) {
      updateMarkerPosition();
    } else {
      activeImage.addEventListener("load", updateMarkerPosition);
    }
  }

  window.addEventListener("resize", updateMarkerPosition);
}

function updateMarkerPosition() {
  const marker = document.getElementById("marker");
  if (!marker || !currentMarkerData) return;

  const activeMap = document.querySelector(".floor-map.active-map");
  const mapWrapper = document.querySelector(".map-wrapper");

  if (!activeMap || !mapWrapper) return;

  if (
    currentMarkerData.floor !== activeMap.id.replace("Map", "")
  ) {
    marker.style.display = "none";
    return;
  }

  const naturalWidth = activeMap.naturalWidth;
  const naturalHeight = activeMap.naturalHeight;

  if (!naturalWidth || !naturalHeight) {
    marker.style.display = "none";
    return;
  }

  const displayedWidth = activeMap.clientWidth;
  const displayedHeight = activeMap.clientHeight;

  const scaleX = displayedWidth / naturalWidth;
  const scaleY = displayedHeight / naturalHeight;

  const imageLeft = activeMap.offsetLeft;
  const imageTop = activeMap.offsetTop;

  const scaledX = imageLeft + currentMarkerData.x * scaleX;
  const scaledY = imageTop + currentMarkerData.y * scaleY;

  marker.style.left = `${scaledX}px`;
  marker.style.top = `${scaledY}px`;
  marker.style.display = "block";
}

/* ---------------- FACILITIES ---------------- */

function setupFacilities() {
  const container = document.getElementById("facilityList");
  if (!container) return;

  const tabs = document.querySelectorAll(".floor-tabs .tab");
  const facilities = roomsData.filter((item) => item.type === "facility");

  function renderFacilities(floor) {
    container.innerHTML = "";

    const floorFacilities = facilities.filter((item) => item.floor === floor);

    if (!floorFacilities.length) {
      container.innerHTML = `<div class="empty-state">No facilities listed for this floor.</div>`;
      return;
    }

    floorFacilities.forEach((facility) => {
      const div = document.createElement("div");
      div.className = "facility-card";

      const label = facility.name || facility.room || facility.rooms || "Facility";

      div.innerHTML = `
        <h3>${escapeHtml(label)}</h3>
        <p>${capitalise(facility.floor)} floor</p>
        <button type="button">Show on Map</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        openMap(facility);
      });

      container.appendChild(div);
    });
  }

  const activeTab = document.querySelector(".floor-tabs .tab.active");
  if (activeTab) {
    renderFacilities(activeTab.dataset.floor);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderFacilities(tab.dataset.floor);
    });
  });
}

/* ---------------- HELPERS ---------------- */

function capitalise(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}