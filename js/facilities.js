import { roomsData } from "./data.js";
import { openMap } from "./map.js";
import { bindPress, capitalise, escapeHtml } from "./ui.js";

// Get an appropriate emoji for a facility based on its name
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

// Main function to initialise facilities page
export function setupFacilities() {
  // Get container where facility cards will be displayed
  const container = document.getElementById("facilityList");
  if (!container) return;

  // Get all floor tab buttons
  const tabs = document.querySelectorAll(".floor-tabs .tab");
  const facilities = roomsData.filter((item) => item.type === "facility");
  
  // Render facilities for a floor 
  function renderFacilities(floor) {
    container.innerHTML = "";
    
    // Filter facilities
    const floorFacilities = facilities
      .filter((item) => item.floor === floor)
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    
    // Show message if no facilities exist 
    if (!floorFacilities.length) {
      container.innerHTML = `<div class="empty-state">No facilities listed for this floor.</div>`;
      return;
    }
    
    // Create a card for each facility
    floorFacilities.forEach((facility) => {
      // Identify display lable
      const label = facility.name || facility.room || "Facility";
      // Get correct emoji icon 
      const emoji = getFacilityEmoji(label);

      // Create card element 
      const div = document.createElement("div");
      div.className = "facility-card";

      // Insert HTML content
      div.innerHTML = `
        <div class="facility-emoji" aria-hidden="true">${emoji}</div>
        <h3>${escapeHtml(label)}</h3>
        <p>${capitalise(facility.floor)} floor</p>
        <button type="button">Show on Map</button>
      `;

      const button = div.querySelector("button");
      bindPress(button, () => openMap(facility));

      container.appendChild(div);
    });
  }

  // Initialize with the first tab's floor
  const activeTab = document.querySelector(".floor-tabs .tab.active");
  renderFacilities(activeTab?.dataset.floor || "ground");
  
  // Switch between floors when tabs are pressed
  tabs.forEach((tab) => {
    bindPress(tab, () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      renderFacilities(tab.dataset.floor || "ground");
    });
  });
}