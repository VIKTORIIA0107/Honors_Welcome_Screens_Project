export function capitalise(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function bindPress(element, handler) {
  if (!element) return;

  let triggered = false;

  element.addEventListener("pointerdown", (event) => {
    triggered = true;
    event.preventDefault();
    handler(event);
  });

  element.addEventListener("click", (event) => {
    if (triggered) {
      triggered = false;
      return;
    }
    handler(event);
  });
}

export function setupBackButton() {
  const backButton = document.getElementById("backButton");
  if (!backButton) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");

  if (from === "facilities") {
    backButton.href = "facilities.html";
    backButton.textContent = "← Back to Facilities";
    return;
  }

  if (from === "search") {
    backButton.href = "search.html";
    backButton.textContent = "← Back to Search";
    return;
  }

  backButton.href = "../index.html";
  backButton.textContent = "← Back to Home";
}

export function setupKeyboardToggle() {
  const input = document.getElementById("searchInput");
  const keyboard = document.getElementById("onscreenKeyboard");
  const toggleBtn = document.getElementById("keyboardToggleBtn");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (!input || !keyboard || !toggleBtn) return;

  bindPress(toggleBtn, () => {
    keyboard.classList.toggle("hidden");
    input.focus();
  });

  if (clearBtn) {
    bindPress(clearBtn, () => {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
  }

  keyboard.querySelectorAll("[data-key]").forEach((button) => {
    bindPress(button, () => {
      const key = button.dataset.key;

      if (key === "BACKSPACE") {
        input.value = input.value.slice(0, -1);
      } else if (key === "SPACE") {
        input.value += " ";
      } else {
        input.value += key;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
  });

  input.addEventListener("pointerdown", () => {
    input.focus();
  });
}

export function setupPressedState() {
  document.querySelectorAll("a.button, .tab, .small-btn, .search-button, .facility-card button").forEach((element) => {
    element.addEventListener("pointerdown", () => {
      element.classList.add("pressed");
    });

    element.addEventListener("pointerup", () => {
      element.classList.remove("pressed");
    });

    element.addEventListener("pointerleave", () => {
      element.classList.remove("pressed");
    });

    element.addEventListener("pointercancel", () => {
      element.classList.remove("pressed");
    });
  });
}