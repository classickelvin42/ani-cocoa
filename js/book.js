import { mountShell, escapeHtml } from "./shell.js";
import { loadServices } from "./catalog.js";

const store = await mountShell("book");
const services = await loadServices();
const root = document.querySelector("[data-book]");
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + (tomorrow.getDay() === 0 ? 1 : tomorrow.getDay() === 1 ? 1 : 0));
if (tomorrow.getDay() === 1) tomorrow.setDate(tomorrow.getDate() + 1);
const min = new Date().toISOString().slice(0, 10);

root.innerHTML = `
  <p class="kicker">Bookings</p>
  <h1>Reserve the chair.</h1>
  <p class="lede">Hair and nails at the beauty bar. ${escapeHtml(store.deposit)} The bar confirms the time. Open ${escapeHtml(store.hours)}. Closed ${escapeHtml(store.closed)}.</p>
  <div class="grid-2">
    <form novalidate>
      <div class="error-summary" tabindex="-1" hidden><p>Please fix the following:</p><ul></ul></div>
      <p class="meta">What do you want done?</p>
      <div class="choice-row">
        ${services.map((service, index) => `
          <label class="choice">
            <input type="radio" name="service" value="${escapeHtml(service.id)}" ${index === 0 ? "required" : ""}>
            ${escapeHtml(service.name)}
          </label>`).join("")}
      </div>
      <label for="day">Day</label>
      <input id="day" name="day" type="date" required min="${min}">
      <p class="meta">Part of the day</p>
      <div class="choice-row">
        ${["Morning", "Afternoon", "Evening"].map((part) => `
          <label class="choice"><input type="radio" name="part" value="${part}">${part}</label>`).join("")}
      </div>
      <label for="name">Name</label>
      <input id="name" name="name" required autocomplete="name">
      <label for="phone">Phone or WhatsApp</label>
      <input id="phone" name="phone" required autocomplete="tel" inputmode="tel">
      <label for="email">Email, if you want one</label>
      <input id="email" name="email" type="email" autocomplete="email">
      <label for="note">Style or finish</label>
      <textarea id="note" name="note" placeholder="Knotless braids, a plain manicure, the length, the colour."></textarea>
      <label class="checks"><input id="deposit" name="deposit" type="checkbox" required> <span>${escapeHtml(store.deposit)} I understand a deposit is required and is not refundable.</span></label>
      <button class="btn" type="submit">Request this appointment</button>
    </form>
    <aside class="summary">
      <img src="images/hero-bar.jpg" alt="The beauty bar chair and mirror.">
      <h2>Before you come</h2>
      <p>Questions? Call or WhatsApp ${escapeHtml(store.phoneDisplay)}, or DM ${escapeHtml(store.instagramBarHandle)}.</p>
      <p>The bar is at ${escapeHtml(store.place)}. ${escapeHtml(store.secondLocation)}</p>
      ${services.map((service) => `<p><strong>${escapeHtml(service.name)}.</strong> ${escapeHtml(service.detail)}</p>`).join("")}
    </aside>
  </div>`;

root.querySelectorAll(".choice").forEach((label) => {
  const input = label.querySelector("input");
  const paint = () => {
    root.querySelectorAll(`input[name="${input.name}"]`).forEach((item) => {
      item.closest(".choice").setAttribute("aria-pressed", String(item.checked));
    });
  };
  input.addEventListener("change", paint);
});

root.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const summary = form.querySelector(".error-summary");
  const problems = [];
  if (!data.service) problems.push("Choose braids, a manicure, or a pedicure.");
  if (!data.day) problems.push("Choose a day.");
  else if (new Date(`${data.day}T12:00:00`).getDay() === 1) problems.push("The bar is closed on Monday.");
  if (!data.part) problems.push("Choose morning, afternoon, or evening.");
  if (!data.name || data.name.trim().length < 2) problems.push("Enter your name.");
  if (!data.phone || data.phone.replace(/\D/g, "").length < 10) problems.push("Enter a phone number.");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) problems.push("Check the email, or leave it blank.");
  if (!form.deposit.checked) problems.push("Acknowledge the deposit. It is not refundable.");
  if (problems.length) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = problems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    summary.focus();
    return;
  }
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: (data.email || "").trim(),
        service: data.service,
        day: data.day,
        part: data.part,
        note: (data.note || "").trim(),
        deposit: true
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The booking could not be saved.");
    const service = services.find((item) => item.id === data.service);
    const message = `Booking ${payload.reference}: ${service.name} on ${data.day}, ${data.part}.`;
    root.innerHTML = `
      <div class="empty">
        <p class="kicker">${escapeHtml(payload.reference)}</p>
        <h1>Request received.</h1>
        <p>${escapeHtml(service.name)} on ${escapeHtml(data.day)}, ${escapeHtml(data.part)}. The bar still confirms the chair and the deposit. Payment is not taken on this page.</p>
        <div class="actions">
          <a class="btn" href="${store.whatsapp}?text=${encodeURIComponent(message)}" rel="noopener">Confirm on WhatsApp</a>
          <a class="btn btn-ghost" href="lookup.html?ref=${encodeURIComponent(payload.reference)}">Look up this booking</a>
        </div>
      </div>`;
  } catch (error) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = `<li>${escapeHtml(error.message)}</li>`;
    button.disabled = false;
  }
});
