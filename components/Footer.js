import Link from "next/link";
import { store } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div>
            <p className="footer-kicker">{store.place}</p>
            <p className="footer-mark">Ani Cocoa</p>
            <p className="footer-line">The beauty bar and the cosmetics shop, in one house.</p>
          </div>
          <Link className="btn footer-book" href="/book">Book the chair</Link>
        </div>
        <div className="footer-grid">
          <div>
            <p>The bar</p>
            <a href={`tel:${store.phoneTel}`}>{store.phoneDisplay}</a>
            <Link href="/book">Book braids or nails</Link>
            <a href={store.instagramBar}>{store.instagramBarHandle}</a>
          </div>
          <div>
            <p>The shop</p>
            <Link href="/shop">Browse the shelf</Link>
            <a href={store.instagramShop}>{store.instagramShopHandle}</a>
            <a href={store.whatsapp}>WhatsApp the shop</a>
          </div>
          <div>
            <p>Visit</p>
            <span>{store.place}, {store.city}</span>
            <span>Open {store.hours}</span>
            <span>Closed {store.closed}</span>
            <a href={`mailto:${store.email}`}>{store.email}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{store.deposit}</span>
          <span>Ani Cocoa Cosmetics</span>
        </div>
      </div>
    </footer>
  );
}
