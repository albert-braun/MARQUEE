"use client";

import Link from "next/link";
import { GridSkeleton } from "@/components/grid-skeleton";
import { ShowCard } from "@/components/show-card";
import { useLibraryHydrated } from "@/hooks/use-library-hydrated";
import { useLibrary } from "@/store/library";

export function WatchlistScreen() {
  const hydrated = useLibraryHydrated();
  const favorites = useLibrary((state) => state.favorites);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Library</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Watchlist</h1>
      <p className="mt-4 max-w-xl text-muted">
        Saved in this browser’s LocalStorage. No account, and nothing is sent to a server.
      </p>

      {!hydrated ? (
        <div className="mt-8">
          <GridSkeleton count={8} />
        </div>
      ) : null}

      {hydrated && favorites.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-8">
          <p className="text-ink">Nothing saved yet.</p>
          <p className="mt-2 text-sm text-muted">Mark a poster with the heart, then come back here.</p>
          <Link href="/" className="mt-5 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
            Back to the listings
          </Link>
        </div>
      ) : null}

      {hydrated && favorites.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {favorites.map((show) => (
            <li key={show.id}>
              <ShowCard show={show} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
