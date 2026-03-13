export let roomsData = [];
export let lecturersData = [];

export async function loadData() {
  const [roomsResponse, lecturersResponse] = await Promise.all([
    fetch("../data/rooms.json"),
    fetch("../data/lecturers.json")
  ]);

  const roomsJson = await roomsResponse.json();
  const lecturersJson = await lecturersResponse.json();

  roomsData = Array.isArray(roomsJson.rooms) ? roomsJson.rooms : [];
  lecturersData = Array.isArray(lecturersJson) ? lecturersJson : [];

  attachLecturersToRooms();
}

function attachLecturersToRooms() {
  roomsData = roomsData.map((room) => {
    const matchingLecturers = lecturersData
      .filter((lecturer) => lecturer.room === room.room)
      .map((lecturer) => lecturer.name);

    return {
      ...room,
      lecturers: matchingLecturers
    };
  });
}