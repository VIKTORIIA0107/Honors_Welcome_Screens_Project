// Array that will store all processed room data
export let roomsData = [];

// This function standardises text for search comparison
// It removes punctuation, titles and ensures consistent formatting
function normaliseText(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll(".", "")
    .replaceAll(",", "")
    .replaceAll("prof ", "")
    .replaceAll("prof. ", "")
    .replaceAll("dr ", "")
    .replaceAll("dr. ", "")
    .replaceAll("mr ", "")
    .replaceAll("mrs ", "")
    .replaceAll("ms ", "")
    .replace(/\s+/g, " ")
    .trim();
}

// Load data from JSON files
export async function loadData() {
  try {
    // Fetch room data from local JSON file
    const roomsResponse = await fetch("../data/rooms.json");

    if (!roomsResponse.ok) {
      throw new Error("Could not load project data.");
    }

    const roomsJson = await roomsResponse.json();
    roomsData = Array.isArray(roomsJson.rooms) ? roomsJson.rooms : [];

    attachRoomsData();
  } catch (error) {
    console.error("Failed to load data:", error);
    roomsData = [];
  }
}

// Build lecturers array and searchable text from rooms.json only
function attachRoomsData() {
  roomsData = roomsData.map((room) => {
    // Split lecturer string into individual names
    const inlineLecturers = String(room.lecturer || "")
      .split(/[;,]/)
      .map((name) => name.trim())
      .filter(Boolean);

    // Remove duplicate lecturer names
    const lecturers = [...new Set(inlineLecturers)];
    
    // Combine all search fields into one string
    const searchText = [
      room.room,
      room.name,
      room.floor,
      room.type,
      ...(Array.isArray(room.keywords) ? room.keywords : []),
      ...lecturers
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...room,
      lecturers,
      searchText: normaliseText(searchText)
    };
  });
}

// Ensures user input is processed in the same way as stored data
export function normaliseSearchQuery(value) {
  return normaliseText(value);
}