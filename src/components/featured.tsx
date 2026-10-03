import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { Poster } from "@/components/poster";
import { channelOf, excerpt, genreLabel, plainText, statusLabel, toSaved, yearOf } from "@/lib/present";
import { showHref } from "@/lib/routes";
import type { Show } from "@/lib/types";

export function Featured({ show }: { show: Show }) {
  const saved = toSaved(show);
  const year = yearOf(show.premiered);
  const summary = excerpt(plainText(show.summary), 320);
  const channel = channelOf(show);

  return (
    <section className="grid gap-6 rounded-2xl border border-line bg-card p-4 sm:p-6 lg:grid-cols-[220px_1fr] lg:items-center">
      <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-xl bg-card-2 sm:w-full">
        <Poster src={show.image?.original ?? show.image?.medium ?? null} initial={show.name} sizes="220px" priority />
      </div>
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">Now showing</p>
        <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
          <Link href={showHref(show.id)} className="hover:text-gold">
            {show.name}
          </Link>
        </h2>
        <p className="mt-3 text-sm text-muted">
          {[year, channel, statusLabel(show.status)].filter(Boolean).join(" · ")}
        </p>
        {summary ? <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/90">{summary}</p> : null}
        {show.genres.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {show.genres.slice(0, 4).map((genre) => (
              <li key={genre} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                {genreLabel(genre)}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex items-center gap-3">
          <Link href={showHref(show.id)} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
            Open title
          </Link>
          <FavoriteButton show={saved} />
          <span className="text-sm font-semibold text-gold tabular-nums">
            {show.rating.average == null ? "Unrated" : show.rating.average.toFixed(1)}
          </span>
        </div>
      </div>
    </section>
  );
}
