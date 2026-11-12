import Link from "next/link";
import BagLink from "@/components/BagLink";

export default function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/">
        <span className="seal">ACC</span>
        <span className="brand-name">Ani Cocoa</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <Link href="/shop">Shop</Link>
        <Link href="/contact">Visit</Link>
        <BagLink />
        <Link className="btn btn-small" href="/book">Book</Link>
      </nav>
    </header>
  );
}
