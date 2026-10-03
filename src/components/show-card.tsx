import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { Poster } from "@/components/poster";
import { genreLabel, statusLabel, yearOf } from "@/lib/present";
import { showHref } from "@/lib/routes";
import type { SavedShow } from "@/lib/types";

export function ShowCard({ show }: { show: SavedShow }) {
  const year = yearOf(show.premiered);
  const genre = show.genres[0] ? genreLabel(show.genres[0]) : null;

  return (
    <article className="group relative">
      <Link href={showHref(show.id)} className="block rounded-lg focus-visible:outline-offset-4">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-card-2">
          <Poster src={show.image} initial={show.name} sizes="(max-width: 640px) 45vw, 18vw" />
          <span className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-full bg-stage/85 px-2 py-0.5 text-xs font-semibold text-gold tabular-nums">
            {show.rating == null ? "–" : show.rating.toFixed(1)}
          </span>
        </div>
        <h2 className="mt-2 line-clamp-2 font-display text-sm leading-snug text-ink">{show.name}</h2>
        <p className="mt-1 text-xs text-muted">
          <span>{year ?? "Year unknown"}</span>
          {genre ? <span> · {genre}</span> : null}
          {show.status === "Running" ? <span className="text-ticket"> · {statusLabel(show.status).toLowerCase()}</span> : null}
        </p>
      </Link>
      <FavoriteButton show={show} className="absolute top-2 right-2 z-10" />
    </article>
  );
}
