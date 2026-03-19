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
      throw new Error("Could not load data files.");
    }

    const roomsJson = await roomsResponse.json();
    const lecturersJson = await lecturersResponse.json();

    roomsData = Array.isArray(roomsJson.rooms) ? roomsJson.rooms : [];
    lecturersData = Array.isArray(lecturersJson) ? lecturersJson : [];

    attachLecturersToRooms();
  } catch (error) {
    console.error("Data loading failed:", error);
    roomsData = [];
    lecturersData = [];
  }
}

function attachLecturersToRooms() {
  roomsData = roomsData.map((room) => {
    const exactRoomLecturers = lecturersData
      .filter((lecturer) => String(lecturer.room || "").trim() === String(room.room || "").trim())
      .map((lecturer) => lecturer.name);

    const inlineLecturers = String(room.lecturer || "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    const mergedLecturers = [...new Set([...exactRoomLecturers, ...inlineLecturers])];

    const searchText = [
      room.room,
      room.name,
      room.type,
      room.floor,
      ...(Array.isArray(room.keywords) ? room.keywords : []),
      ...mergedLecturers
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...room,
      lecturers: mergedLecturers,
      searchText: normaliseText(searchText)
    };
  });
}

export function getAccessibleFacilities() {
  return roomsData.filter((item) => {
    if (item.type !== "facility") return false;
    const name = String(item.name || "").toLowerCase();
    const keywords = Array.isArray(item.keywords) ? item.keywords.join(" ").toLowerCase() : "";
    return (
      name.includes("accessible") ||
      name.includes("lift") ||
      keywords.includes("accessible") ||
      keywords.includes("lift") ||
      keywords.includes("elevator")
    );
  });
}

export function normaliseSearchQuery(value) {
  return normaliseText(value);
}