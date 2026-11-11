import { mountShell, escapeHtml } from "./shell.js";
import { loadProducts, loadStore } from "./catalog.js";
import { getCart, clearCart } from "./cart.js";

const store = await mountShell("shop");
await loadStore();
const products = await loadProducts();
const root = document.querySelector("[data-checkout]");

function lines() {
  return getCart().map((line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? { ...line, product } : null;
  }).filter(Boolean);
}

function render() {
  const items = lines();
  if (!items.length) {
    root.innerHTML = `<div class="empty"><h1>Nothing to request</h1><p>Add a product before sending a shelf request.</p><a class="btn" href="shop.html">Shop the shelf</a></div>`;
    return;
  }
  root.innerHTML = `
    <p class="kicker">Shelf request</p>
    <h1>Ask the shop to hold these.</h1>
    <div class="grid-2">
      <form novalidate>
        <div class="error-summary" tabindex="-1" hidden><p>Please fix the following:</p><ul></ul></div>
        <label for="name">Name</label>
        <input id="name" name="name" required autocomplete="name">
        <label for="phone">Phone or WhatsApp</label>
        <input id="phone" name="phone" required autocomplete="tel" inputmode="tel">
        <label for="email">Email, if you want one</label>
        <input id="email" name="email" type="email" autocomplete="email">
        <label for="note">Note</label>
        <textarea id="note" name="note" rows="4" placeholder="Size, scent, or when you will pass by the shop."></textarea>
        <button class="btn" type="submit">Send request</button>
      </form>
      <aside class="summary">
        <h2>In the bag</h2>
        <ul>${items.map((line) => `<li><span>${escapeHtml(line.product.name)} × ${line.qty}</span><span>Price at the shop</span></li>`).join("")}</ul>
        <p class="fine">Pay at ${escapeHtml(store.place)}, or as you arrange with the shop. Card numbers are not taken here.</p>
        <p><a href="${store.whatsapp}" rel="noopener">WhatsApp ${escapeHtml(store.phoneDisplay)}</a></p>
      </aside>
    </div>`;
  root.querySelector("form").addEventListener("submit", submit);
}

async function submit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const summary = form.querySelector(".error-summary");
  const problems = [];
  if (data.name.trim().length < 2) problems.push("Enter your name.");
  if (data.phone.replace(/\D/g, "").length < 10) problems.push("Enter a phone number we can reach.");
  if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) problems.push("Check the email, or leave it blank.");
  if (problems.length) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = problems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    summary.focus();
    return;
  }
  const button = form.querySelector("button");
  button.disabled = true;
  const items = lines();
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        note: data.note.trim(),
        items: items.map((line) => ({ id: line.id, qty: line.qty }))
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The request could not be saved.");
    clearCart();
    const text = items.map((line) => `${line.product.name} x ${line.qty}`).join(", ");
    const wa = `${store.whatsapp}?text=${encodeURIComponent(`Shelf request ${payload.reference}: ${text}`)}`;
    root.innerHTML = `
      <div class="empty">
        <p class="kicker">Request ${escapeHtml(payload.reference)}</p>
        <h1>The shop has your list.</h1>
        <p>Nothing has been charged. ${escapeHtml(store.name)} will confirm stock and price. You can also send the same list on WhatsApp.</p>
        <div class="actions">
          <a class="btn" href="${wa}" rel="noopener">Send it on WhatsApp</a>
          <a class="btn btn-ghost" href="lookup.html?ref=${encodeURIComponent(payload.reference)}">Look up this request</a>
        </div>
      </div>`;
  } catch (error) {
    summary.hidden = false;
    summary.querySelector("ul").innerHTML = `<li>${escapeHtml(error.message)}</li>`;
    summary.focus();
    button.disabled = false;
  }
}

render();
