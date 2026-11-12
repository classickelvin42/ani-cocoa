import Link from "next/link";
import { products } from "@/lib/content";

export const metadata = {
  title: "Shop · Ani Cocoa Cosmetics"
};

export default function ShopPage() {
  return (
    <section className="page-wrap">
      <p className="kicker">The cosmetics shop</p>
      <h1>The shelf.</h1>
      <p className="lede">Beauty products and cosmetics in Spintex. The shop confirms the price and what is still in.</p>
      <div className="product-grid shop-grid">
        {products.map((product) => (
          <Link className="product-card" href={`/shop/${product.id}`} key={product.id}>
            <img src={product.image} alt="" />
            <p>{product.brand}</p>
            <h3>{product.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
