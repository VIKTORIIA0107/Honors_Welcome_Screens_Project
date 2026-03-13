import { loadData } from "./data.js";
import { setupSearch } from "./search.js";
import { setupFloorTabs, initialiseMapPage } from "./map.js";
import { setupFacilities } from "./facilities.js";
import { setupBackButton } from "./ui.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  setupSearch();
  setupFloorTabs();
  setupFacilities();
  initialiseMapPage();
  setupBackButton();
});