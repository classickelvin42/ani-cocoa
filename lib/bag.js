const KEY = "ani-cocoa-bag";

export function readBag() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && Number.isInteger(item.qty) && item.qty > 0);
  } catch {
    return [];
  }
}

function writeBag(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("bag:change"));
}

export function addToBag(id, qty) {
  const items = readBag();
  const add = Math.max(1, Math.min(6, qty));
  const existing = items.find((item) => item.id === id);
  if (existing) existing.qty = Math.min(6, existing.qty + add);
  else items.push({ id, qty: add });
  writeBag(items);
}

export function setBagQty(id, qty) {
  const next = readBag().flatMap((item) => {
    if (item.id !== id) return [item];
    if (qty < 1) return [];
    return [{ id, qty: Math.min(6, qty) }];
  });
  writeBag(next);
}
