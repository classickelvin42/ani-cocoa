import { loadStore, escapeHtml } from "./catalog.js";
import { cartCount, onCartChange } from "./cart.js";

const LINKS = [
  ["index.html", "home", "Home"],
  ["services.html", "services", "The bar"],
  ["book.html", "book", "Book"],
  ["shop.html", "shop", "The shelf"],
  ["careers.html", "careers", "Hiring"],
  ["contact.html", "contact", "Visit"]
];

export function pageName(file) {
  const name = file.split("/").pop();
  return LINKS.find((link) => link[0] === name)?.[1] || "";
}

export async function mountShell(page) {
  const store = await loadStore();
  document.title = document.title || store.name;
  const header = document.createElement("div");
  header.innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <header class="header">
      <a class="brand" href="index.html">
        <span class="seal">${escapeHtml(store.mark)}</span>
        <span><small>Beauty bar</small><strong>${escapeHtml(store.name)}</strong></span>
      </a>
      <nav class="nav" aria-label="Primary">
        ${LINKS.map(([href, id, label]) => `<a href="${href}" ${page === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="header-actions">
        <a class="btn btn-ghost" href="cart.html">Bag <span data-count>${cartCount() || ""}</span></a>
        <a class="btn" href="book.html">Book</a>
        <button class="btn btn-ghost menu-btn" type="button" aria-expanded="false">Menu</button>
      </div>
    </header>
    <div class="mobile-nav" hidden>
      <nav aria-label="Mobile">
        ${LINKS.map(([href, id, label]) => `<a href="${href}" ${page === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}
        <a href="lookup.html">Find a reference</a>
        <button class="btn btn-ghost" type="button" data-close-menu>Close</button>
      </nav>
    </div>`;
  document.body.prepend(header);
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <div>
        <p class="seal" style="margin-bottom:0.8rem">${escapeHtml(store.mark)}</p>
        <strong class="serif">${escapeHtml(store.name)}</strong>
        <p>${escapeHtml(store.tagline)}. ${escapeHtml(store.place)}, ${escapeHtml(store.city)}. ${escapeHtml(store.secondLocation)}</p>
      </div>
      <div>
        <p class="meta">The bar</p>
        <a href="services.html">Hair and nails</a>
        <a href="book.html">Book an appointment</a>
        <a href="lookup.html">Find a booking</a>
        <a href="careers.html">Braiders and pedicurists</a>
      </div>
      <div>
        <p class="meta">The shelf</p>
        <a href="shop.html">Shop self-care</a>
        <a href="cart.html">Your bag</a>
        <a href="${store.instagramBar}" rel="noopener">Beauty bar ${escapeHtml(store.instagramBarHandle)}</a>
        <a href="${store.instagramShop}" rel="noopener">Shop ${escapeHtml(store.instagramShopHandle)}</a>
        <a href="mailto:${store.email}">${escapeHtml(store.email)}</a>
        <a href="tel:${store.phoneTel}">${escapeHtml(store.phoneDisplay)}</a>
      </div>
    </div>
    <p class="announce">${escapeHtml(store.deposit)} · Open ${escapeHtml(store.hours)} · <a href="contact.html">${escapeHtml(store.place)}</a></p>`;
  document.body.append(footer);
  const menu = document.querySelector(".mobile-nav");
  const menuBtn = document.querySelector(".menu-btn");
  menuBtn.addEventListener("click", () => {
    menu.hidden = false;
    menu.classList.add("open");
    menuBtn.setAttribute("aria-expanded", "true");
  });
  menu.querySelector("[data-close-menu]").addEventListener("click", () => {
    menu.hidden = true;
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
  const paintCount = () => {
    document.querySelectorAll("[data-count]").forEach((node) => {
      node.textContent = cartCount() ? String(cartCount()) : "";
    });
  };
  onCartChange(paintCount);
  dressPhotos();
  bindPhotoMotion();
  return store;
}

function dressPhotos(root = document) {
  root.querySelectorAll("main img").forEach((img) => {
    if (img.dataset.dressed) return;
    img.dataset.dressed = "1";
    if (img.closest(".hero-stage")) return;
    if (!img.closest(".panel") && !img.parentElement.classList.contains("frame")) {
      const frame = document.createElement("span");
      frame.className = "frame";
      if (img.classList.contains("hero-photo")) frame.classList.add("frame-hero");
      img.parentNode.insertBefore(frame, img);
      frame.appendChild(img);
    }
    if (!img.closest("a, button")) {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-pressed", "false");
      const label = img.alt ? `Move closer: ${img.alt}` : "Move this photo closer";
      if (!img.getAttribute("aria-label")) img.setAttribute("aria-label", label);
    }
  });
}

function bindPhotoMotion() {
  if (document.body.dataset.motion) return;
  document.body.dataset.motion = "1";
  const observer = new MutationObserver(() => dressPhotos());
  observer.observe(document.body, { childList: true, subtree: true });
  const release = (img) => {
    img.classList.remove("is-near");
    if (img.getAttribute("role") === "button") img.setAttribute("aria-pressed", "false");
  };
  document.addEventListener("click", (event) => {
    const img = event.target.closest("main img");
    if (!img || img.closest(".sample-track")) return;
    const link = img.closest("a");
    if (link && img.classList.contains("is-near")) return;
    if (link) event.preventDefault();
    document.querySelectorAll("main img.is-near").forEach((other) => {
      if (other !== img) release(other);
    });
    const near = img.classList.toggle("is-near");
    if (img.getAttribute("role") === "button") img.setAttribute("aria-pressed", near ? "true" : "false");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const img = event.target instanceof Element ? event.target.closest("img[role='button']") : null;
    if (!img) return;
    event.preventDefault();
    img.click();
  });
}

export { escapeHtml };
