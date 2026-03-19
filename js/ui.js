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

export function setupBackButton() {
  const backButton = document.getElementById("backButton");
  if (!backButton) return;

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");

  if (from === "facilities") {
    backButton.href = "facilities.html";
    backButton.textContent = "← Back to Facilities";
  } else if (from === "search") {
    backButton.href = "search.html";
    backButton.textContent = "← Back to Search";
  } else if (window.history.length > 1) {
    backButton.href = "#";
    backButton.textContent = "← Back";
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.back();
    });
  } else {
    backButton.href = "../index.html";
    backButton.textContent = "← Back to Home";
  }
}

export function setupKeyboardToggle() {
  const input = document.getElementById("searchInput");
  const keyboard = document.getElementById("onscreenKeyboard");
  const toggleBtn = document.getElementById("keyboardToggleBtn");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (!input || !keyboard || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    keyboard.classList.toggle("hidden");
    input.focus();
  });

  clearBtn?.addEventListener("click", () => {
    input.value = "";
    input.focus();
  });

  keyboard.querySelectorAll("[data-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;

      if (key === "BACKSPACE") {
        input.value = input.value.slice(0, -1);
      } else if (key === "SPACE") {
        input.value += " ";
      } else if (key === "CLEAR") {
        input.value = "";
      } else {
        input.value += key;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
    });
  });
}