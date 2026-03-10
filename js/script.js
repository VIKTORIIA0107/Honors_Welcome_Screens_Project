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