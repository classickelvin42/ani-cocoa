import { Suspense } from "react";
import BookForm from "@/components/BookForm";

export const metadata = {
  title: "Book · Ani Cocoa Cosmetics"
};

export default function BookPage() {
  return (
    <Suspense fallback={<p className="page-wrap">Opening the booking form…</p>}>
      <BookForm />
    </Suspense>
  );
}
