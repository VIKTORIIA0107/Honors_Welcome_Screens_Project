// -----------------------------
// ADMIN PAGE - ROOM COORDINATE PICKER
// -----------------------------

// Stores rooms created during the current session
const createdRooms = [];

// Keeps track of the room currently being edited
let editingIndex = -1;

// Image path for each floor
const floorImages = {
  ground: "../assets/ground-floor.png",
  first: "../assets/first-floor.png",
  second: "../assets/second-floor.png"
};

document.addEventListener("DOMContentLoaded", () => {
  const floorSelect = document.getElementById("floorSelect");
  const adminMap = document.getElementById("adminMap");
  const adminMarker = document.getElementById("adminMarker");

  const roomInput = document.getElementById("roomInput");
  const nameInput = document.getElementById("nameInput");
  const lecturerInput = document.getElementById("lecturerInput");
  const typeInput = document.getElementById("typeInput");
  const keywordsInput = document.getElementById("keywordsInput");
  const xInput = document.getElementById("xInput");
  const yInput = document.getElementById("yInput");

  const saveRoomBtn = document.getElementById("saveRoomBtn");
  const clearFormBtn = document.getElementById("clearFormBtn");
  const copyJsonBtn = document.getElementById("copyJsonBtn");

  const savedRoomsList = document.getElementById("savedRoomsList");
  const jsonOutput = document.getElementById("jsonOutput");
  const roomCountBadge = document.getElementById("roomCountBadge");


  // FLOOR CHANGE
  floorSelect.addEventListener("change", () => {
    adminMap.src = floorImages[floorSelect.value];
    adminMarker.style.display = "none";
    xInput.value = "";
    yInput.value = "";
  });


  // MAP CLICK -> CAPTURE COORDINATES
  adminMap.addEventListener("click", (event) => {
    const rect = adminMap.getBoundingClientRect();

    const scaleX = adminMap.naturalWidth / rect.width;
    const scaleY = adminMap.naturalHeight / rect.height;

    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    xInput.value = x;
    yInput.value = y;

    placeMarkerFromRealCoordinates(x, y);
  });

  // SAVE OR UPDATE ROOM
  saveRoomBtn.addEventListener("click", () => {
    const room = roomInput.value.trim();
    const name = nameInput.value.trim();
    const lecturer = lecturerInput.value.trim();
    const type = typeInput.value.trim();
    const floor = floorSelect.value;
    const x = Number(xInput.value);
    const y = Number(yInput.value);

    const keywords = keywordsInput.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!room || !name || !xInput.value || !yInput.value) {
      alert("Please enter the room details and click on the map.");
      return;
    }

    const roomObject = {
      room,
      name,
      lecturer,
      floor,
      type,
      x,
      y,
      keywords
    };

    // Update existing room when editing
    if (editingIndex >= 0) {
      createdRooms[editingIndex] = roomObject;
      editingIndex = -1;
      saveRoomBtn.textContent = "Save Room";
    } else {
      // Add new room
      createdRooms.push(roomObject);
    }

    updateOutput();
    clearForm();
  });

  // CLEAR FORM
  clearFormBtn.addEventListener("click", () => {
    clearForm();
    editingIndex = -1;
    saveRoomBtn.textContent = "Save Room";
  });

  // COPY JSON OUTPUT
  copyJsonBtn.addEventListener("click", async () => {
    const jsonText = JSON.stringify({ rooms: createdRooms }, null, 2);

    try {
      await navigator.clipboard.writeText(jsonText);
      copyJsonBtn.textContent = "Copied!";
      setTimeout(() => {
        copyJsonBtn.textContent = "Copy JSON";
      }, 1400);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Could not copy JSON automatically. Please copy it manually.");
    }
  });

  // UPDATE OUTPUT AREAS
  function updateOutput() {
    jsonOutput.textContent = JSON.stringify({ rooms: createdRooms }, null, 2);

    roomCountBadge.textContent = `${createdRooms.length} room${createdRooms.length === 1 ? "" : "s"}`;

    savedRoomsList.innerHTML = "";

    if (createdRooms.length === 0) {
      savedRoomsList.innerHTML = `
        <div class="empty-state">
          No rooms saved yet. Start by filling the form and clicking on the map.
        </div>
      `;
      return;
    }

    createdRooms.forEach((roomItem, index) => {
      const card = document.createElement("div");
      card.className = "result-card";

      const lecturerText = roomItem.lecturer
        ? ` • Lecturer: ${escapeHtml(roomItem.lecturer)}`
        : "";

      card.innerHTML = `
        <div class="result-info">
          <h3>${escapeHtml(roomItem.room)} - ${escapeHtml(roomItem.name)}</h3>
          <p>
            ${capitalise(roomItem.floor)} floor •
            x: ${roomItem.x} •
            y: ${roomItem.y}
            ${lecturerText}
          </p>
        </div>

        <div class="saved-room-actions">
          <button class="small-btn edit-btn" type="button">Edit</button>
          <button class="small-btn delete-btn" type="button">Delete</button>
        </div>
      `;

      // Load room into form for editing
      card.querySelector(".edit-btn").addEventListener("click", () => {
        loadRoomIntoForm(roomItem, index);
      });

      // Remove room from the list
      card.querySelector(".delete-btn").addEventListener("click", () => {
        createdRooms.splice(index, 1);

        if (editingIndex === index) {
          editingIndex = -1;
          saveRoomBtn.textContent = "Save Room";
          clearForm();
        }

        updateOutput();
      });

      savedRoomsList.appendChild(card);
    });
  }

  // LOAD ROOM INTO FORM
  function loadRoomIntoForm(roomItem, index) {
    editingIndex = index;

    roomInput.value = roomItem.room || "";
    nameInput.value = roomItem.name || "";
    lecturerInput.value = roomItem.lecturer || "";
    typeInput.value = roomItem.type || "";
    keywordsInput.value = Array.isArray(roomItem.keywords)
      ? roomItem.keywords.join(", ")
      : "";
    xInput.value = roomItem.x || "";
    yInput.value = roomItem.y || "";
    floorSelect.value = roomItem.floor || "ground";

    adminMap.src = floorImages[floorSelect.value];
    saveRoomBtn.textContent = "Update Room";

    adminMap.onload = () => {
      placeMarkerFromRealCoordinates(roomItem.x, roomItem.y);
    };
  }

  // DISPLAY MARKER FROM SAVED COORDINATES
  function placeMarkerFromRealCoordinates(realX, realY) {
    const rect = adminMap.getBoundingClientRect();

    const scaleX = rect.width / adminMap.naturalWidth;
    const scaleY = rect.height / adminMap.naturalHeight;

    const displayX = realX * scaleX;
    const displayY = realY * scaleY;

    adminMarker.style.left = `${displayX}px`;
    adminMarker.style.top = `${displayY}px`;
    adminMarker.style.display = "block";
  }

  // CLEAR FORM
  function clearForm() {
    roomInput.value = "";
    nameInput.value = "";
    lecturerInput.value = "";
    typeInput.value = "";
    keywordsInput.value = "";
    xInput.value = "";
    yInput.value = "";
    adminMarker.style.display = "none";
  }

  // HELPERS
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

  // Initial render
  updateOutput();
});