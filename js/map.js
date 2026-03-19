let currentMarkerData = null;

const FLOOR_IDS = {
  ground: "groundMap",
  first: "firstMap",
  second: "secondMap"
};

export function setupFloorTabs() {
  const tabs = document.querySelectorAll(".floor-tabs .tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedFloor = tab.dataset.floor || "ground";

      if (currentMarkerData) {
        currentMarkerData.floor = selectedFloor;
      }

      activateFloor(selectedFloor);
    });
  });
}

export function openMap(item) {
  const fromPage = window.location.pathname.includes("facilities")
    ? "facilities"
    : "search";

  const params = new URLSearchParams({
    floor: item.floor || "ground",
    label: item.room
      ? `${item.room} - ${item.name || "Room"}`
      : item.name || "Selected location",
    from: fromPage
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
  const marker = document.getElementById("marker");
  const params = new URLSearchParams(window.location.search);
  const selectedRoomText = document.getElementById("selectedRoomText");

  if (!selectedRoomText) return;

  const floor = params.get("floor") || "ground";
  const xParam = params.get("x");
  const yParam = params.get("y");
  const label = params.get("label") || "Viewing floor map";

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
    if (marker) marker.style.display = "none";
  }

  activateFloor(floor);
  window.addEventListener("resize", updateMarkerPosition);

  const activeImage = getMapImageByFloor(floor);
  if (activeImage) {
    if (activeImage.complete) {
      updateMarkerPosition();
    } else {
      activeImage.addEventListener("load", updateMarkerPosition, { once: true });
    }
  }
}

function getMapImageByFloor(floor) {
  const id = FLOOR_IDS[floor];
  return id ? document.getElementById(id) : null;
}

function activateFloor(floor) {
  const validFloor = FLOOR_IDS[floor] ? floor : "ground";
  const tabs = document.querySelectorAll(".floor-tabs .tab");

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.floor === validFloor);
  });

  Object.entries(FLOOR_IDS).forEach(([key, id]) => {
    const image = document.getElementById(id);
    if (!image) return;

    const isActive = key === validFloor;
    image.style.display = isActive ? "block" : "none";
    image.classList.toggle("active-map", isActive);
  });

  const activeImage = getMapImageByFloor(validFloor);
  if (activeImage?.complete) {
    updateMarkerPosition();
  } else {
    activeImage?.addEventListener("load", updateMarkerPosition, { once: true });
  }
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