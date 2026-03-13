let currentMarkerData = null;

export function setupFloorTabs() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateFloor(tab.dataset.floor);
    });
  });
}

export function openMap(item) {
  const fromPage = window.location.pathname.includes("facilities")
    ? "facilities"
    : "search";

  const params = new URLSearchParams({
    floor: item.floor || "ground",
    x: String(Number(item.x) || 0),
    y: String(Number(item.y) || 0),
    label: item.room ? `${item.room} - ${item.name || "Room"}` : (item.name || "Selected location"),
    from: fromPage
  });

  window.location.href = `map.html?${params.toString()}`;
}

export function initialiseMapPage() {
  const marker = document.getElementById("marker");
  if (!marker) return;

  const params = new URLSearchParams(window.location.search);
  const floor = params.get("floor");
  const x = Number(params.get("x"));
  const y = Number(params.get("y"));
  const label = params.get("label");

  if (!floor) return;

  currentMarkerData = { floor, x, y, label: label || "Selected location" };

  const selectedRoomText = document.getElementById("selectedRoomText");
  if (selectedRoomText) {
    selectedRoomText.textContent = currentMarkerData.label;
  }

  activateFloor(floor);
  window.addEventListener("resize", updateMarkerPosition);
}

function activateFloor(floor) {
  const tabs = document.querySelectorAll(".tab");
  const maps = {
    ground: document.getElementById("groundMap"),
    first: document.getElementById("firstMap"),
    second: document.getElementById("secondMap")
  };

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.floor === floor);
  });

  Object.values(maps).forEach((img) => {
    if (img) img.style.display = "none";
  });

  if (maps[floor]) maps[floor].style.display = "block";

  updateMarkerPosition();
}

function updateMarkerPosition() {
  const marker = document.getElementById("marker");
  const mapWrapper = document.querySelector(".map-wrapper");

  if (!marker || !currentMarkerData || !mapWrapper) return;

  let activeMap = null;
  if (currentMarkerData.floor === "ground") activeMap = document.getElementById("groundMap");
  if (currentMarkerData.floor === "first") activeMap = document.getElementById("firstMap");
  if (currentMarkerData.floor === "second") activeMap = document.getElementById("secondMap");

  if (!activeMap || activeMap.style.display === "none") {
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