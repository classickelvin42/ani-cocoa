let storePromise;
let productPromise;
let servicePromise;

export function loadStore() {
  if (!storePromise) {
    storePromise = fetch("data/store.json").then((response) => {
      if (!response.ok) throw new Error("Could not load the studio.");
      return response.json();
    });
  }
  return storePromise;
}

export function loadProducts() {
  if (!productPromise) {
    productPromise = fetch("data/products.json").then((response) => response.json()).then((data) => data.products);
  }
  return productPromise;
}

export function loadServices() {
  if (!servicePromise) {
    servicePromise = fetch("data/services.json").then((response) => response.json()).then((data) => data.services);
  }
  return servicePromise;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
