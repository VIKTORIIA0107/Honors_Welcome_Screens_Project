/*Queen Mother Building Wayfinding SystemHandles search and map navigation
*/

function normalize(str){
return (str||"").toLowerCase().trim();
}

function renderResults(list){
    const results=document.getElementById("results");
    if(!results)return;
    results.innerHTML="";
    list.forEach(room=>{
        const card=document.createElement("div");
        card.className="result-card";
        card.innerHTML=`
    <div>
<b>${room.room} ${room.id}</b><br>
${room.lecturer ? "Lecturer: "+room.lecturer : ""}
${room.module ? " • "+room.module : ""}
</div>
<button class="small-btn" onclick="showRoom('${room.id}','${room.floor}')">Show Map</button>`;
results.appendChild(card);
});
}

function doSearch(){
    const input=document.getElementById("roomQuery");
    if(!input)return;
    const q=normalize(input.value);
    if(!q)return;
    const matches=ROOMS.filter(r=>

normalize(r.id).includes(q)||
normalize(r.room).includes(q)||
normalize(r.lecturer).includes(q)||
normalize(r.module).includes(q)

);

renderResults(matches);
}

function showRoom(id,floor){
    window.location.href=`map.html?room=${id}&floor=${floor}`;
}

document.addEventListener("DOMContentLoaded",()=>{
    const btn=document.getElementById("searchBtn");
    const input=document.getElementById("roomQuery");
if(btn)btn.addEventListener("click",doSearch);
if(input){
    input.addEventListener("keydown",e=>{
        if(e.key==="Enter")doSearch();
    });
}
const tabs=document.querySelectorAll(".tab");
const maps=document.querySelectorAll(".floor-map");

if(tabs.length>0){
    tabs.forEach(tab=>{
        tab.addEventListener("click",()=>{const floor=tab.dataset.floor;
            maps.forEach(m=>m.classList.remove("active-map"));
            document.getElementById(floor+"Map").classList.add("active-map");
            tabs.forEach(t=>t.classList.remove("active"));
            tab.classList.add("active");
        });
    });
}
});

const params = new URLSearchParams(window.location.search);
const floor = params.get("floor");

if(floor){
    document.getElementById(floor+"Map").classList.add("active-map");
    document.querySelector(`[data-floor="${floor}"]`).classList.add("active");
}
// GLOBAL DATA
let roomsData = [];

// Load rooms.json dynamically
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("../data/rooms.js");
    const data = await res.json();
    roomsData = data.rooms;
  } catch (err) {
    console.warn("rooms.js not found!", err);
  }

  setupSearch();
});

// ---------------- SEARCH FUNCTIONALITY ----------------
function setupSearch() {
  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("results");

  if (!btn || !input || !results) return;

  btn.addEventListener("click", () => {
    const query = input.value.toLowerCase().trim();

    const matches = roomsData.filter(r =>
      r.room.toLowerCase().includes(query) ||
      r.name.toLowerCase().includes(query) ||
      (r.lecturer && r.lecturer.toLowerCase().includes(query))
    );

    displayResults(matches);
  });
}

// Display search results
function displayResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>No results found</p>";
    return;
  }

  results.forEach(r => {
    const div = document.createElement("div");
    div.className = "result";

    div.innerHTML = `
      <div class="result-info">
        <h3>${r.room} — ${r.name}</h3>
        <p>${r.lecturer || "No lecturer assigned"}</p>
      </div>

      <button class="map-button"
        onclick="openMap('${r.floor}',${r.x},${r.y},'${r.room}')">
        📍 Show on Map
      </button>
    `;

    container.appendChild(div);
  });
}

// Navigate to map page with floor & coordinates
function openMap(floor, x, y, label) {
  window.location.href = `map.html?floor=${floor}&x=${x}&y=${y}&label=${label}`;
}

// FLOOR TAB SWITCHING
function setupFloorTabs() {
  const tabs = document.querySelectorAll(".tab");
  const maps = document.querySelectorAll(".floor-map");

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const floor = tab.dataset.floor;
      maps.forEach(m => m.classList.remove("active-map"));
      tabs.forEach(t => t.classList.remove("active"));
      document.getElementById(floor + "Map").classList.add("active-map");
      tab.classList.add("active");
    });
  });
}

// SHOW MARKER FROM URL
function showMapFromURL() {
  const marker = document.getElementById("marker");
  if (!marker) return;

  const params = new URLSearchParams(window.location.search);
  const floor = params.get("floor");
  const x = params.get("x");
  const y = params.get("y");
  const label = params.get("label");

  if (!floor || !x || !y) return;

  document.querySelectorAll(".floor-map").forEach(m => m.classList.remove("active-map"));
  const targetMap = document.getElementById(floor + "Map");
  if (targetMap) targetMap.classList.add("active-map");

  marker.style.left = x + "px";
  marker.style.top = y + "px";
  marker.style.display = "block";

  const text = document.getElementById("selectedRoomText");
  if (text) text.textContent = label + " location";
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  setupFloorTabs();
  showMapFromURL();
});

// ---------------- FACILITIES PAGE ----------------
function setupFacilities() {
    const container = document.getElementById("facilityList");
    if (!container || roomsData.length === 0) return;

    const tabs = document.querySelectorAll(".floor-tabs .tab");

    // Filter facilities (type="facility")
    const facilities = roomsData.filter(r => r.type === "facility");

    // Show only facilities for selected floor
    function renderFacilities(floor) {
        container.innerHTML = "";
        const floorFacilities = facilities.filter(f => f.floor === floor);

        floorFacilities.forEach(f => {
            const div = document.createElement("div");
            div.className = "facility-card";

            div.innerHTML = `
                <h3>${f.name}</h3>
                <p>Floor: ${f.floor.charAt(0).toUpperCase() + f.floor.slice(1)}</p>
                <button onclick="openMap('${f.floor}',${f.x},${f.y},'${f.name}')">
                    📍 Show on Map
                </button>
            `;

            container.appendChild(div);
        });
    }

    // Initial render (active tab)
    const activeTab = document.querySelector(".floor-tabs .tab.active");
    if(activeTab) renderFacilities(activeTab.dataset.floor);

    // Handle floor tab clicks
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderFacilities(tab.dataset.floor);
        });
    });
}

// Call on page load
document.addEventListener("DOMContentLoaded", setupFacilities);