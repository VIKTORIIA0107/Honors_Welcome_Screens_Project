export function capitalise(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function escapeHtml(value) {
  return String(value)
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
  } else {
    backButton.href = "../index.html";
    backButton.textContent = "← Back to Home";
  }
}