import { loadData } from "./data.js";
import { setupSearch } from "./search.js";
import { setupFloorTabs, initialiseMapPage } from "./map.js";
import { setupFacilities } from "./facilities.js";
import { setupBackButton, setupPressedState } from "./ui.js";

// MAIN ENTRY POINT
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();

  setupSearch();
  setupFloorTabs();
  setupFacilities();
  initialiseMapPage();
  setupBackButton();
  setupPressedState();

  document.addEventListener("pointerdown", () => {
    document.body.classList.add("touch-active");
  }, { once: true });
});