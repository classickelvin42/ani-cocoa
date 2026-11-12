"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { products, store } from "@/lib/content";
import { readBag, setBagQty } from "@/lib/bag";

export default function BagView() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const sync = () => setItems(readBag());
    sync();
    window.addEventListener("bag:change", sync);
    return () => window.removeEventListener("bag:change", sync);
  }, []);

  const lines = items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean);

  const total = lines.reduce((sum, line) => sum + (line.product.price || 0) * line.qty, 0);
  const message = lines.length
    ? `Hello Ani Cocoa shop. I would like:\n${lines
        .map((line) => `${line.qty} × ${line.product.name}${line.product.price ? ` (GHS ${line.product.price})` : ""}`)
        .join("\n")}\nPlease confirm what is still in.`
    : "";

  if (!lines.length) {
    return (
      <section className="page-wrap">
        <p className="kicker">The bag</p>
        <h1>Nothing in the bag yet.</h1>
        <p className="lede">The three bottles on the shelf can be added here. The shop confirms what is still in.</p>
        <Link className="btn" href="/shop">Back to the shelf</Link>
      </section>
    );
  }

  return (
    <section className="page-wrap bag-page">
      <p className="kicker">The bag</p>
      <h1>Ready to ask the shop.</h1>
      <ul className="bag-list">
        {lines.map((line) => (
          <li key={line.id}>
            <img src={line.product.image} alt="" />
            <div>
              <h2>{line.product.name}</h2>
              <p className={line.product.price ? "price" : undefined}>{line.product.price ? `GHS ${line.product.price}` : "Ask the shop"}</p>
              <div className="qty">
                <button type="button" aria-label="Fewer" onClick={() => setBagQty(line.id, line.qty - 1)}>−</button>
                <span>{line.qty}</span>
                <button type="button" aria-label="More" onClick={() => setBagQty(line.id, line.qty + 1)}>+</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="buy-price">GHS {total}</p>
      <p className="buy-note">Nothing is paid on this page. Send the list and the shop will say what is still on the shelf.</p>
      <a className="btn btn-wide" href={`${store.whatsapp}?text=${encodeURIComponent(message)}`}>Send the list on WhatsApp</a>
    </section>
  );
}
