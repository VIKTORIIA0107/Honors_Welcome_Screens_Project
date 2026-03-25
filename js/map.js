import { bindPress } from "./ui.js";

let currentMarkerData = null;

const FLOOR_IDS = {
  ground: "groundMap",
  first: "firstMap",
  second: "secondMap"
};

function getMapImageByFloor(floor) {
  const id = FLOOR_IDS[floor];
  return id ? document.getElementById(id) : null;
}

function activateFloor(floor) {
  const selectedFloor = FLOOR_IDS[floor] ? floor : "ground";
  const tabs = document.querySelectorAll(".floor-tabs .tab");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.floor === selectedFloor);
  });

  Object.entries(FLOOR_IDS).forEach(([key, id]) => {
    const image = document.getElementById(id);
    if (!image) return;

    const isActive = key === selectedFloor;
    image.style.display = isActive ? "block" : "none";
    image.classList.toggle("active-map", isActive);
  });

  if (currentMarkerData && currentMarkerData.floor !== selectedFloor) {
    markerHide();
  } else {
    updateMarkerPosition();
  }
}

function markerHide() {
  const marker = document.getElementById("marker");
  if (marker) marker.style.display = "none";
}

function updateMarkerPosition() {
  const marker = document.getElementById("marker");
  const mapWrapper = document.querySelector(".map-wrapper");

  if (!marker || !mapWrapper) return;

  if (!currentMarkerData) {
    marker.style.display = "none";
    return;
  }

  const activeMap = getMapImageByFloor(currentMarkerData.floor);

  if (
    !activeMap ||
    activeMap.style.display === "none" ||
    !activeMap.naturalWidth ||
    !activeMap.naturalHeight
  ) {
    marker.style.display = "none";
    return;
  }

  const imageRect = activeMap.getBoundingClientRect();
  const wrapperRect = mapWrapper.getBoundingClientRect();

  const scaleX = imageRect.width / activeMap.naturalWidth;
  const scaleY = imageRect.height / activeMap.naturalHeight;

  const scaledX = currentMarkerData.x * scaleX + (imageRect.left - wrapperRect.left);
  const scaledY = currentMarkerData.y * scaleY + (imageRect.top - wrapperRect.top);

  marker.style.left = `${scaledX}px`;
  marker.style.top = `${scaledY}px`;
  marker.style.display = "block";
}

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

export function openMap(item) {
  const fromPage = window.location.pathname.includes("facilities")
    ? "facilities"
    : "search";

  const params = new URLSearchParams({
    floor: item.floor || "ground",
    label: item.room ? `${item.room} - ${item.name || "Room"}` : item.name || "Selected location",
    from: fromPage,
    locked: "1"
  });

  const hasValidCoordinates =
    Number.isFinite(Number(item.x)) &&
    Number.isFinite(Number(item.y));

  if (hasValidCoordinates) {
    params.set("x", String(Number(item.x)));
    params.set("y", String(Number(item.y)));
  }

  window.location.href = `map.html?${params.toString()}`;
}

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

  if (isLocked) {
    const tabsWrapper = document.querySelector(".floor-tabs");
    if (tabsWrapper) tabsWrapper.style.display = "none";
  }

  activateFloor(floor);

  const activeImage = getMapImageByFloor(floor);
  if (activeImage && !activeImage.complete) {
    activeImage.addEventListener("load", updateMarkerPosition, { once: true });
  }

  window.addEventListener("resize", updateMarkerPosition);
}