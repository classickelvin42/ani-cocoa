import { mountShell, escapeHtml } from "./shell.js";
import { loadProducts } from "./catalog.js";
import { getCart, setQty } from "./cart.js";

await mountShell("shop");
const products = await loadProducts();
const root = document.querySelector("[data-cart]");

function render() {
  const lines = getCart().map((line) => {
    const product = products.find((item) => item.id === line.id);
    return product ? { ...line, product } : null;
  }).filter(Boolean);
  if (!lines.length) {
    root.innerHTML = `<div class="empty"><h1>Your bag is empty</h1><p>Add something from the shelf. The shop confirms the price before you pay.</p><a class="btn" href="shop.html">Shop the shelf</a></div>`;
    return;
  }
  root.innerHTML = `
    <h1>Your bag</h1>
    <div class="grid-2">
      <div>
        ${lines.map((line) => `
          <article class="card" style="margin-bottom:0.8rem">
            <p class="meta">${escapeHtml(line.product.brand)}</p>
            <h3>${escapeHtml(line.product.name)}</h3>
            <div class="qty">
              <button type="button" data-qty="${line.qty - 1}" data-id="${escapeHtml(line.id)}" aria-label="Fewer">−</button>
              <span>${line.qty}</span>
              <button type="button" data-qty="${line.qty + 1}" data-id="${escapeHtml(line.id)}" aria-label="More">+</button>
              <button class="remove" type="button" data-qty="0" data-id="${escapeHtml(line.id)}">Remove</button>
            </div>
          </article>`).join("")}
      </div>
      <aside class="summary">
        <h2>Request</h2>
        <p>This bag is a request, not a payment. The shop confirms stock and price.</p>
        <a class="btn" href="checkout.html">Request these pieces</a>
      </aside>
    </div>`;
}

root.addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  setQty(button.dataset.id, Number(button.dataset.qty));
  render();
});

render();
window.addEventListener("cart:change", render);
