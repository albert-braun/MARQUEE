"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { Poster } from "@/components/poster";
import {
  channelOf,
  episodeCode,
  excerpt,
  formatDate,
  genreLabel,
  groupEpisodes,
  languageLabel,
  plainText,
  runtimeOf,
  scheduleLabel,
  statusLabel,
  toSaved,
  yearOf,
} from "@/lib/present";
import type { Show } from "@/lib/types";
import { ApiError, fetchCast, fetchEpisodes, fetchShow } from "@/lib/tvmaze";
import { useLibrary } from "@/store/library";

export function ShowScreen({
  id,
  initial,
  missing,
}: {
  id: number;
  initial: Show | null;
  missing: boolean;
}) {
  const valid = Number.isInteger(id) && id > 0 && !missing;
  const showQuery = useQuery({
    queryKey: ["show", id],
    queryFn: ({ signal }) => fetchShow(id, signal),
    enabled: valid,
    initialData: initial ?? undefined,
  });
  const castQuery = useQuery({
    queryKey: ["cast", id],
    queryFn: ({ signal }) => fetchCast(id, signal),
    enabled: valid,
  });
  const episodeQuery = useQuery({
    queryKey: ["episodes", id],
    queryFn: ({ signal }) => fetchEpisodes(id, signal),
    enabled: valid,
  });
  const remember = useLibrary((state) => state.remember);

  useEffect(() => {
    if (showQuery.data) remember(toSaved(showQuery.data));
  }, [remember, showQuery.data]);

  useEffect(() => {
    if (!showQuery.data) return;
    document.title = `${showQuery.data.name} — MARQUEE`;
    return () => {
      document.title = "MARQUEE — a series guide";
    };
  }, [showQuery.data]);

  if (!valid) {
    return <Missing />;
  }

  if (showQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="h-4 w-24 animate-pulse rounded bg-card-2" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="aspect-[2/3] animate-pulse rounded-xl bg-card-2" />
          <div className="space-y-3">
            <div className="h-10 w-2/3 animate-pulse rounded bg-card-2" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-card-2" />
            <div className="h-24 animate-pulse rounded bg-card-2" />
          </div>
        </div>
      </div>
    );
  }

  if (showQuery.isError || !showQuery.data) {
    const notFound = showQuery.error instanceof ApiError && showQuery.error.status === 404;
    if (notFound) return <Missing />;
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p>The title did not load.</p>
        <button type="button" onClick={() => void showQuery.refetch()} className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
          Try again
        </button>
      </div>
    );
  }

  const show = showQuery.data;
  const summary = plainText(show.summary);
  const runtime = runtimeOf(show);
  const channel = channelOf(show);
  const schedule = scheduleLabel(show);
  const language = languageLabel(show.language);
  const site = safeHttp(show.officialSite);
  const poster = show.image?.original ?? show.image?.medium ?? null;
  const seasons = groupEpisodes(episodeQuery.data ?? []);
  const cast = (castQuery.data ?? []).slice(0, 18);

  return (
    <article className="relative">
      {poster ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 overflow-hidden">
          <div className="absolute inset-0 scale-110 blur-3xl">
            <Image src={poster} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-45" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-stage/20 to-stage" />
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/" className="text-sm text-muted hover:text-gold">
          ← Back to listings
        </Link>
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[280px_1fr]">
          <div className="relative mx-auto aspect-[2/3] w-56 overflow-hidden rounded-xl bg-card-2 shadow-2xl sm:w-full">
            <Poster src={poster} initial={show.name} sizes="280px" priority />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">{show.name}</h1>
              <FavoriteButton show={toSaved(show)} />
            </div>
            <p className="mt-3 text-sm text-muted">
              {[yearOf(show.premiered), runtime ? `${runtime} min` : null, language, channel, statusLabel(show.status)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-4 font-display text-4xl text-gold tabular-nums">
              {show.rating.average == null ? "–" : show.rating.average.toFixed(1)}
              <span className="ml-2 align-middle font-sans text-xs font-medium tracking-normal text-muted">TVMaze rating</span>
            </p>
            {summary ? <p className="mt-5 max-w-2xl text-base leading-7">{summary}</p> : <p className="mt-5 text-muted">No description in the catalog.</p>}
            {schedule ? <p className="mt-4 text-sm text-muted">Airs: {schedule}</p> : null}
            {show.genres.length > 0 ? <GenreLinks genres={show.genres} /> : null}
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              {site ? (
                <a href={site} target="_blank" rel="noreferrer" className="text-gold hover:underline">
Official site
              </a>
              ) : null}
              <a href={show.url} target="_blank" rel="noreferrer" className="text-muted hover:text-gold">
                TVMaze page
              </a>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Cast</h2>
          {castQuery.isLoading ? <p className="mt-4 text-sm text-muted">Loading the cast…</p> : null}
          {castQuery.isError ? (
            <button type="button" onClick={() => void castQuery.refetch()} className="mt-4 text-sm text-gold">
              The cast did not load. Try again
            </button>
          ) : null}
          {castQuery.isSuccess && cast.length === 0 ? <p className="mt-4 text-sm text-muted">No cast listed.</p> : null}
          {cast.length > 0 ? (
            <ul className="chip-row mt-4 flex gap-4 overflow-x-auto pb-2">
              {cast.map((credit) => (
                <li key={`${credit.person.id}-${credit.character.id}`} className="w-24 shrink-0">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-card-2">
                    <Poster src={credit.person.image?.medium ?? null} initial={credit.person.name} sizes="96px" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{credit.person.name}</p>
                  <p className="line-clamp-2 text-xs text-muted">{credit.character.name}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Episodes</h2>
          {episodeQuery.isLoading ? <p className="mt-4 text-sm text-muted">Loading episodes…</p> : null}
          {episodeQuery.isError ? (
            <button type="button" onClick={() => void episodeQuery.refetch()} className="mt-4 text-sm text-gold">
              The episodes did not load. Try again
            </button>
          ) : null}
          {episodeQuery.isSuccess && seasons.length === 0 ? <p className="mt-4 text-sm text-muted">The episode list has not been published.</p> : null}
          {seasons.length > 0 ? <SeasonList seasons={seasons} /> : null}
        </section>
      </div>
    </article>
  );
}

function GenreLinks({ genres }: { genres: string[] }) {
  const router = useRouter();
  const setGenre = useLibrary((state) => state.setGenre);

  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {genres.map((genre) => (
        <li key={genre}>
          <button
            type="button"
            onClick={() => {
              setGenre(genre);
              router.push("/");
            }}
            className="rounded-full border border-line px-3 py-1 text-sm text-ink hover:border-gold"
          >
            {genreLabel(genre)}
          </button>
        </li>
      ))}
    </ul>
  );
}

function SeasonList({ seasons }: { seasons: ReturnType<typeof groupEpisodes> }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const active = seasons.some(([season]) => season === chosen) ? chosen : seasons[0][0];
  const episodes = seasons.find(([season]) => season === active)?.[1] ?? [];

  return (
    <div className="mt-4">
      <div className="chip-row flex gap-2 overflow-x-auto pb-2">
        {seasons.map(([season, list]) => (
          <button
            key={season}
            type="button"
            aria-pressed={season === active}
            onClick={() => setChosen(season)}
            className={season === active ? "shrink-0 rounded-full bg-gold px-3 py-1.5 text-sm text-stage" : "shrink-0 rounded-full border border-line px-3 py-1.5 text-sm"}
          >
            Season {season}
            <span className="ml-1 tabular-nums opacity-70">{list.length}</span>
          </button>
        ))}
      </div>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {episodes.map((episode) => {
          const text = excerpt(plainText(episode.summary), 180);
          return (
            <li key={episode.id} className="grid gap-1 py-3 sm:grid-cols-[4.5rem_1fr_auto] sm:items-baseline sm:gap-4">
              <span className="text-sm text-gold tabular-nums">{episodeCode(episode)}</span>
              <div>
                <p className="text-sm">{episode.name}</p>
                {text ? <p className="mt-1 text-sm leading-6 text-muted">{text}</p> : null}
              </div>
              <span className="text-xs text-muted">{formatDate(episode.airdate)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Missing() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl">This show is not in the catalog</h1>
      <p className="mt-3 text-muted">The link is out of date, or the id is not from TVMaze.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
        Back to the listings
      </Link>
    </div>
  );
}

function safeHttp(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
