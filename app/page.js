import Link from "next/link";
import { featured, services, store } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-stage">
          <div className="hero-track">
            <img src="/images/hero-bar.jpg" alt="A cocoa-brown beauty bar with a cream chair and a round gold mirror." />
            <img src="/images/braids.jpg" alt="" />
            <img src="/images/manicure.jpg" alt="" />
            <img src="/images/shelf.jpg" alt="" />
            <img src="/images/hero-bar.jpg" alt="" />
          </div>
          <div className="hero-copy">
            <p className="kicker">Spintex, Coastal Estates · Accra</p>
            <h1>The bar for hair and nails. The shelf from Canada.</h1>
            <p className="lede">Braids, manicures, and pedicures beside a shop of beauty products and cosmetics.</p>
            <div className="hero-actions">
              <Link className="btn" href="/book">Book the chair</Link>
              <Link className="btn btn-ghost" href="/shop">Shop the shelf</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">The beauty bar</p>
          <h2>Hair and nails.</h2>
        </div>
        <div className="service-row">
          {services.map((service) => (
            <Link className="service-card" href={`/book?service=${service.id}`} key={service.id}>
              <img src={service.image} alt="" />
              <span>{service.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">The cosmetics shop</p>
          <h2>On the shelf.</h2>
          <Link className="text-link" href="/shop">See everything</Link>
        </div>
        <div className="product-grid shelf-grid">
          {featured.map((product) => (
            <Link className="product-card" href={`/shop/${product.id}`} key={product.id}>
              <img src={product.image} alt="" />
              <p>{product.brand}</p>
              <h3>{product.name}</h3>
              {product.price ? <p className="price">GHS {product.price}</p> : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="house">
          <div className="house-intro">
            <p className="kicker">One address</p>
            <h2>Two rooms, one house.</h2>
          </div>
          <div className="house-grid">
            <article>
              <video
                src="/videos/beauty-bar.mp4"
                poster="/images/beauty-bar-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                aria-label="Body-wave braids being finished in the beauty bar."
              />
              <p className="room-index">01</p>
              <h3>The beauty bar</h3>
              <p>Braids, manicures, and pedicures. The chair is booked, then confirmed by the bar.</p>
              <Link href="/book">Book a chair</Link>
            </article>
            <article>
              <video
                src="/videos/cosmetics-shop.mp4"
                poster="/images/cosmetics-shop-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                aria-label="The cosmetics shelves at the shop."
              />
              <p className="room-index">02</p>
              <h3>The cosmetics shop</h3>
              <p>Beauty products and self-care brought from Canada. The shop confirms what is in.</p>
              <Link href="/shop">Browse the shelf</Link>
            </article>
          </div>
          <p className="house-note">
            {store.place} · Open {store.hours} · <a href={`tel:${store.phoneTel}`}>{store.phoneDisplay}</a>
          </p>
        </div>
      </section>
    </>
  );
}
