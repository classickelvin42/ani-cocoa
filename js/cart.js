const KEY = "ani-cocoa-cart";

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && Number.isInteger(item.qty) && item.qty > 0);
  } catch {
    return [];
  }
}

function write(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart:change"));
}

export function getCart() {
  return read();
}

export function cartCount() {
  return read().reduce((sum, item) => sum + item.qty, 0);
}

export function addToCart(id) {
  const items = read();
  const existing = items.find((item) => item.id === id);
  if (existing) existing.qty = Math.min(6, existing.qty + 1);
  else items.push({ id, qty: 1 });
  write(items);
}

export function setQty(id, qty) {
  const items = read().flatMap((item) => {
    if (item.id !== id) return [item];
    if (qty < 1) return [];
    return [{ ...item, qty: Math.min(6, qty) }];
  });
  write(items);
}

export function clearCart() {
  write([]);
}

export function onCartChange(listener) {
  window.addEventListener("cart:change", listener);
  window.addEventListener("storage", listener);
}
