import { store } from "@/lib/content";

export const metadata = {
  title: "Visit · Ani Cocoa Cosmetics"
};

export default function ContactPage() {
  return (
    <section className="page-wrap visit-page">
      <p className="kicker">Visit</p>
      <h1>{store.place}.</h1>
      <p className="lede">
        {store.city}. Open {store.hours}. Closed {store.closed}. {store.secondLocation}
      </p>
      <ul className="visit-list">
        <li>
          <span>Call or WhatsApp</span>
          <a href={`tel:${store.phoneTel}`}>{store.phoneDisplay}</a>
        </li>
        <li>
          <span>Email</span>
          <a href={`mailto:${store.email}`}>{store.email}</a>
        </li>
        <li>
          <span>Beauty bar</span>
          <a href={store.instagramBar}>{store.instagramBarHandle}</a>
        </li>
        <li>
          <span>Cosmetics shop</span>
          <a href={store.instagramShop}>{store.instagramShopHandle}</a>
        </li>
      </ul>
      <a className="btn" href={store.maps}>Open directions</a>
    </section>
  );
}
