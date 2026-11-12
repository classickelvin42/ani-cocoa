import Link from "next/link";
import { store } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-mark">Ani Cocoa</p>
        <p className="footer-line">Beauty bar and cosmetics shop · {store.place}</p>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/book">Book</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/contact">Visit</Link>
          <a href={store.instagramBar}>Beauty bar</a>
          <a href={store.instagramShop}>Cosmetics shop</a>
          <a href={store.whatsapp}>WhatsApp</a>
        </nav>
        <p className="footer-fine">
          <a href={`tel:${store.phoneTel}`}>{store.phoneDisplay}</a>
          <span> · </span>
          <span>Open {store.hours}</span>
          <span> · </span>
          <span>Closed {store.closed}</span>
        </p>
        <p className="footer-fine">{store.deposit}</p>
      </div>
    </footer>
  );
}
