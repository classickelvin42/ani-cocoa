import { mountShell, escapeHtml } from "./shell.js";
import { loadProducts } from "./catalog.js";
import { addToCart } from "./cart.js";

await mountShell("shop");
const products = await loadProducts();
const id = new URLSearchParams(location.search).get("id");
const product = products.find((item) => item.id === id);
const root = document.querySelector("[data-product]");

if (!product) {
  root.innerHTML = `<div class="empty"><h1>That piece is not on this list</h1><p>The shelf changes. Ask the shop what is in this week.</p><a class="btn" href="shop.html">Back to the shelf</a></div>`;
} else {
  document.title = `${product.name} · Ani Cocoa Cosmetics`;
  root.innerHTML = `
    <p class="kicker">${escapeHtml(product.brand)}</p>
    <div class="grid-2">
      <img class="hero-photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <div>
        <h1 style="font-size:clamp(2.6rem,5vw,4.4rem)">${escapeHtml(product.name)}</h1>
        <p class="lede">${escapeHtml(product.detail)}</p>
        <p class="fine">Price is not listed here. The shop confirms it on WhatsApp, by phone, or when you collect.</p>
        <div class="actions">
          <button class="btn" type="button" data-add>Add to bag</button>
          <a class="btn btn-ghost" href="shop.html">Keep browsing</a>
        </div>
      </div>
    </div>`;
  root.querySelector("[data-add]").addEventListener("click", () => {
    addToCart(product.id);
    root.querySelector("[data-add]").textContent = "Added to the bag";
  });
}
