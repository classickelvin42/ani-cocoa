"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readBag } from "@/lib/bag";

export default function BagLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(readBag().reduce((sum, item) => sum + item.qty, 0));
    sync();
    window.addEventListener("bag:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bag:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link className="bag-link" href="/bag" aria-label={count ? `Bag, ${count}` : "Bag"}>
      Bag{count ? <span>{count}</span> : null}
    </Link>
  );
}
