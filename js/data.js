export let roomsData = [];
export let lecturersData = [];

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

export async function loadData() {
  try {
    const [roomsResponse, lecturersResponse] = await Promise.all([
      fetch("../data/rooms.json"),
      fetch("../data/lecturers.json")
    ]);

    if (!roomsResponse.ok || !lecturersResponse.ok) {
      throw new Error("Could not load project data.");
    }

    const roomsJson = await roomsResponse.json();
    const lecturersJson = await lecturersResponse.json();

    roomsData = Array.isArray(roomsJson.rooms) ? roomsJson.rooms : [];
    lecturersData = Array.isArray(lecturersJson) ? lecturersJson : [];

    attachLecturersToRooms();
  } catch (error) {
    console.error("Failed to load data:", error);
    roomsData = [];
    lecturersData = [];
  }
}

function attachLecturersToRooms() {
  roomsData = roomsData.map((room) => {
    const roomCode = String(room.room || "").trim();

    const lecturerMatches = 
    roomCode && room.type !== "facility"
    ? lecturersData
        .filter((lecturer) => String(lecturer.room || "").trim() === roomCode)
        .map((lecturer) => lecturer.name)
    : [];

    const inlineLecturers = String(room.lecturer || "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const lecturers = [...new Set([...lecturerMatches, ...inlineLecturers])];

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

export function normaliseSearchQuery(value) {
  return normaliseText(value);
}