import { mountShell, escapeHtml } from "./shell.js";

await mountShell("");
const form = document.querySelector("[data-lookup]");
const result = document.querySelector("[data-result]");
const preset = new URLSearchParams(location.search).get("ref");
if (preset) form.reference.value = preset;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const reference = form.reference.value.trim();
  const summary = form.querySelector(".error-summary");
  if (reference.length < 4) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = "<li>Enter a reference of at least 4 characters.</li>";
    return;
  }
  summary.hidden = true;
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const booking = await fetch(`/api/bookings?reference=${encodeURIComponent(reference)}`);
    const order = booking.ok ? null : await fetch(`/api/orders?reference=${encodeURIComponent(reference)}`);
    const response = booking.ok ? booking : order;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Nothing matched that reference.");
    if (payload.kind === "booking") {
      result.innerHTML = `<h2>${escapeHtml(payload.reference)}</h2><p>${escapeHtml(payload.service)} on ${escapeHtml(payload.day)}, ${escapeHtml(payload.part)}. Status: ${escapeHtml(payload.status)}. The bar confirms the chair. The deposit is not refundable.</p>`;
    } else {
      const items = payload.items.map((item) => `${item.name} × ${item.qty}`).join(", ");
      result.innerHTML = `<h2>${escapeHtml(payload.reference)}</h2><p>Shelf request. Status: ${escapeHtml(payload.status)}. ${escapeHtml(items)}. The shop confirms stock and price.</p>`;
    }
    result.hidden = false;
  } catch (error) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = `<li>${escapeHtml(error.message)}</li>`;
    result.hidden = true;
  } finally {
    button.disabled = false;
  }
});

if (preset) form.requestSubmit();
