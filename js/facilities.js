import { roomsData } from "./data.js";
import { openMap } from "./map.js";
import { capitalise, escapeHtml, bindPress } from "./ui.js";

function getFacilityEmoji(name = "") {
  const value = name.toLowerCase();

  if (value.includes("accessible wc")) return "♿🚻";
  if (value.includes("wc") || value.includes("toilet") || value.includes("bathroom")) return "🚾";
  if (value.includes("lift") || value.includes("elevator")) return "🛗";
  if (value.includes("stairs") || value.includes("staircase")) return "🪜";
  if (value.includes("kitchen")) return "🍽️";
  if (value.includes("cleaners")) return "🧹";
  if (value.includes("terrace")) return "🌿";
  return "📍";
}

export function setupFacilities() {
  const container = document.getElementById("facilityList");
  if (!container) return;

  const tabs = document.querySelectorAll(".floor-tabs .tab");
  const facilities = roomsData.filter((item) => item.type === "facility");

  function renderFacilities(floor) {
    container.innerHTML = "";

    const floorFacilities = facilities
      .filter((item) => item.floor === floor)
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));

    if (!floorFacilities.length) {
      container.innerHTML = `<div class="empty-state">No facilities listed for this floor.</div>`;
      return;
    }

    floorFacilities.forEach((facility) => {
      const label = facility.name || facility.room || "Facility";
      const emoji = getFacilityEmoji(label);

      const div = document.createElement("div");
      div.className = "facility-card";
      div.innerHTML = `
        <div class="facility-emoji" aria-hidden="true">${emoji}</div>
        <h3>${escapeHtml(label)}</h3>
        <p>${capitalise(facility.floor)} floor</p>
        <button type="button">Show on Map</button>
      `;

      div.querySelector("button").addEventListener("click", () => openMap(facility));
      container.appendChild(div);
    });
  }

  const activeTab = document.querySelector(".floor-tabs .tab.active");
  renderFacilities(activeTab?.dataset.floor || "ground");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      renderFacilities(tab.dataset.floor || "ground");
    });
  });
}