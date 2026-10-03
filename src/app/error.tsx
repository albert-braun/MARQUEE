"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">This page did not load</h1>
      <p className="mt-3 text-muted">The catalog request failed. You can try again.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
        Try again
      </button>
    </div>
  );
}
