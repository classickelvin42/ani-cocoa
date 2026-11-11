import { mountShell, escapeHtml } from "./shell.js";
import { loadProducts } from "./catalog.js";
import { addToCart } from "./cart.js";

const store = await mountShell("shop");
const products = await loadProducts();
const root = document.querySelector("[data-shop]");
const filters = document.querySelector("[data-filters]");
let current = "all";

const labels = { all: "All", body: "Body", fragrance: "Fragrance", house: "House" };

function tile(product) {
  return `
    <article class="product">
      <a href="product.html?id=${encodeURIComponent(product.id)}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      </a>
      <p class="meta">${escapeHtml(product.brand)}</p>
      <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
      <p>${escapeHtml(product.blurb)}</p>
      <p class="fine">Price confirmed by the shop.</p>
      <button class="btn" type="button" data-add="${escapeHtml(product.id)}">Add to bag</button>
    </article>`;
}

function render() {
  const list = products.filter((product) => current === "all" || product.category === current);
  root.innerHTML = list.map(tile).join("");
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  current = button.dataset.filter;
  filters.querySelectorAll("[data-filter]").forEach((item) => {
    item.setAttribute("aria-pressed", String(item === button));
  });
  render();
});

root.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(button.dataset.add);
  button.textContent = "Added";
  setTimeout(() => {
    button.textContent = "Add to bag";
  }, 900);
});

document.querySelector("[data-shop-intro]").textContent = `${store.name} stocks original self-care from Canada, plus the body care on the Spintex shelf. Prices are confirmed by the shop before you pay. Nothing is charged on this page.`;
render();
