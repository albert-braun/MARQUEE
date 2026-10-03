import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">That address is not part of the guide.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
        Back to the listings
      </Link>
    </div>
  );
}
