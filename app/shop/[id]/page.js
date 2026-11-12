import Link from "next/link";
import { notFound } from "next/navigation";
import { products, store } from "@/lib/content";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  return { title: product ? `${product.name} · Ani Cocoa` : "Shop" };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  const message = `Hello Ani Cocoa shop. Is ${product.name} still on the shelf?`;
  return (
    <article className="product-page">
      <img src={product.image} alt={product.name} />
      <div>
        <p className="kicker">{product.brand}</p>
        <h1>{product.name}</h1>
        <p className="lede">{product.blurb}</p>
        <p>{product.detail}</p>
        <div className="hero-actions">
          <a className="btn" href={`${store.whatsapp}?text=${encodeURIComponent(message)}`}>
            Ask the shop on WhatsApp
          </a>
          <Link className="btn btn-ghost" href="/shop">Back to the shelf</Link>
        </div>
      </div>
    </article>
  );
}
