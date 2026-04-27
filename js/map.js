// Import helper function
import { bindPress } from "./ui.js";

let currentMarkerData = null;

const FLOOR_IDS = {
  ground: "groundMap",
  first: "firstMap",
  second: "secondMap"
};

// Get the map image element for a given floor
function getMapImageByFloor(floor) {
  const id = FLOOR_IDS[floor];
  return id ? document.getElementById(id) : null;
}

// Load data from JSON files
// Displays the selected floor map and hides others
function activateFloor(floor) {
  // Ensure valid floor (go back to ground)
  const selectedFloor = FLOOR_IDS[floor] ? floor : "ground";
  const tabs = document.querySelectorAll(".floor-tabs .tab");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.floor === selectedFloor);
  });
  
  // Show only the selected map image
  Object.entries(FLOOR_IDS).forEach(([key, id]) => {
    const image = document.getElementById(id);
    if (!image) return;

    const isActive = key === selectedFloor;
    image.style.display = isActive ? "block" : "none";
    image.classList.toggle("active-map", isActive);
  });
  
  // If marker belongs to another floor then hide it
  if (currentMarkerData && currentMarkerData.floor !== selectedFloor) {
    markerHide();
  } else {
    updateMarkerPosition();
  }
}

// Hide the marker element
function markerHide() {
  const marker = document.getElementById("marker");
  if (marker) marker.style.display = "none";
}

// Update the marker position based on currentMarkerData and active map
function updateMarkerPosition() {
  const marker = document.getElementById("marker");
  const mapWrapper = document.querySelector(".map-wrapper");

  if (!marker || !mapWrapper) return;

  if (!currentMarkerData) {
    marker.style.display = "none";
    return;
  }
  
  // Get current active map 
  const activeMap = getMapImageByFloor(currentMarkerData.floor);

  // Correct image is ready and visible 
  if (
    !activeMap ||
    activeMap.style.display === "none" ||
    !activeMap.naturalWidth ||
    !activeMap.naturalHeight
  ) {
    marker.style.display = "none";
    return;
  }

  // Get size and position of image and wrapper
  const imageRect = activeMap.getBoundingClientRect();
  const wrapperRect = mapWrapper.getBoundingClientRect();
  
  // Calculate scale between original image and displayed size
  const scaleX = imageRect.width / activeMap.naturalWidth;
  const scaleY = imageRect.height / activeMap.naturalHeight;
  
  // Apply scaling to get correct marker position
  const scaledX = currentMarkerData.x * scaleX + (imageRect.left - wrapperRect.left);
  const scaledY = currentMarkerData.y * scaleY + (imageRect.top - wrapperRect.top);

  // Marker position updates
  marker.style.left = `${scaledX}px`;
  marker.style.top = `${scaledY}px`;
  marker.style.display = "block";
}

// Load data from JSON files
export function setupFloorTabs() {
  const tabs = document.querySelectorAll(".floor-tabs .tab");
  if (!tabs.length) return;

  const params = new URLSearchParams(window.location.search);
  const isLocked = params.get("locked") === "1";

  if (isLocked) {
    tabs.forEach((tab) => {
      tab.style.display = "none";
    });
    return;
  }
  
  // Iteraction to each tab
  tabs.forEach((tab) => {
    bindPress(tab, () => {
      const floor = tab.dataset.floor || "ground";

      if (currentMarkerData) {
        currentMarkerData.floor = floor;
      }

      activateFloor(floor);
    });
  });
}

// Open the map page with query parameters based on the selected item
export function openMap(item) {

  // Identify user came from facilities or searcg
  const fromPage = window.location.pathname.includes("facilities")
    ? "facilities"
    : "search";
  
  // URL paramets
  const params = new URLSearchParams({
    floor: item.floor || "ground",
    label: item.room ? `${item.room} - ${item.name || "Room"}` : item.name || "Selected location",
    from: fromPage,
    locked: "1"
  });
  
  // If coordinates are valid 
  const hasValidCoordinates =
    Number.isFinite(Number(item.x)) &&
    Number.isFinite(Number(item.y));
  // Add coordinates if available
  if (hasValidCoordinates) {
    params.set("x", String(Number(item.x)));
    params.set("y", String(Number(item.y)));
  }
  // Transfer to map page
  window.location.href = `map.html?${params.toString()}`;
}

// Initialize the map page based on URL parameters and set up event listeners
export function initialiseMapPage() {
  const selectedRoomText = document.getElementById("selectedRoomText");
  if (!selectedRoomText) return;

  const params = new URLSearchParams(window.location.search);
  const floor = params.get("floor") || "ground";
  const xParam = params.get("x");
  const yParam = params.get("y");
  const label = params.get("label") || "Viewing floor map";
  const isLocked = params.get("locked") === "1";
  
  selectedRoomText.textContent = label;
  
  // Check if coordinates of marker exist 
  const hasMarker =
    xParam !== null &&
    yParam !== null &&
    !Number.isNaN(Number(xParam)) &&
    !Number.isNaN(Number(yParam));

  if (hasMarker) {
    currentMarkerData = {
      floor,
      x: Number(xParam),
      y: Number(yParam),
      label
    };
  } else {
    currentMarkerData = null;
    markerHide();
  }
  
  // Hide floor tabs if locked, because user came from search
  if (isLocked) {
    const tabsWrapper = document.querySelector(".floor-tabs");
    if (tabsWrapper) tabsWrapper.style.display = "none";
  }

  activateFloor(floor);

  const activeImage = getMapImageByFloor(floor);
  if (activeImage && !activeImage.complete) {
    activeImage.addEventListener("load", updateMarkerPosition, { once: true });
  }
  
  // Update marker when window changes
  window.addEventListener("resize", updateMarkerPosition);
}