"use client";

import { useState } from "react";
import Link from "next/link";
import { addToBag } from "@/lib/bag";

export default function ShelfBuy({ product, store }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const note = `Hello Ani Cocoa shop. I would like ${qty} of ${product.name}, listed at GHS ${product.price}. Please tell me if it is still in.`;

  function add() {
    addToBag(product.id, qty);
    setAdded(true);
  }

  return (
    <div className="buy">
      <p className="buy-price">GHS {product.price}</p>
      <p className="lede">{product.blurb}</p>
      <p>{product.detail}</p>
      <p className="buy-note">Message the shop before you come. The figure on this page can move, and a bottle is not held until the shop says so.</p>
      <p className="buy-label">How many</p>
      <div className="qty">
        <button type="button" aria-label="Fewer" onClick={() => setQty((value) => Math.max(1, value - 1))}>−</button>
        <span>{qty}</span>
        <button type="button" aria-label="More" onClick={() => setQty((value) => Math.min(6, value + 1))}>+</button>
      </div>
      <div className="buy-actions">
        <button className="btn" type="button" onClick={add}>{added ? "In your bag" : "Add to bag"}</button>
        <a className="btn btn-ghost" href={store.instagramShop}>Shop on Instagram</a>
      </div>
      {added ? <Link className="text-link buy-open" href="/bag">Open the bag</Link> : null}
      <ul className="buy-facts">
        <li>
          <span>Collect it</span>
          <strong>{store.place}</strong>
        </li>
        <li>
          <span>Ask first</span>
          <a href={`${store.whatsapp}?text=${encodeURIComponent(note)}`}>WhatsApp the shop about this one</a>
        </li>
        <li>
          <span>The figure</span>
          <strong>GHS {product.price}. The shop confirms it before anything is paid.</strong>
        </li>
        <li>
          <span>More photos</span>
          <a href={store.instagramShop}>{store.instagramShopHandle}</a>
        </li>
      </ul>
    </div>
  );
}
