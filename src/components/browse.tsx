"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Featured } from "@/components/featured";
import { GridSkeleton } from "@/components/grid-skeleton";
import { ShowCard } from "@/components/show-card";
import { useLibraryHydrated } from "@/hooks/use-library-hydrated";
import { cn } from "@/lib/cn";
import { GENRE_OPTIONS, SEARCH_HINTS, VISIBLE_STEP, arrange, genreLabel, toSaved, uniqueShows } from "@/lib/present";
import { fetchShowPage, searchShows } from "@/lib/tvmaze";
import { useLibrary } from "@/store/library";

export function Browse() {
  const params = useSearchParams();
  const query = (params.get("q") ?? "").trim();
  const searching = query.length >= 2;
  const hydrated = useLibraryHydrated();
  const genre = useLibrary((state) => state.genre);
  const sort = useLibrary((state) => state.sort);
  const density = useLibrary((state) => state.density);
  const hideEnded = useLibrary((state) => state.hideEnded);
  const setGenre = useLibrary((state) => state.setGenre);
  const setSort = useLibrary((state) => state.setSort);
  const setDensity = useLibrary((state) => state.setDensity);
  const setHideEnded = useLibrary((state) => state.setHideEnded);
  const recent = useLibrary((state) => state.recent);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const sentinelRef = useRef<HTMLButtonElement>(null);
  const lockRef = useRef(false);
  const loadMoreRef = useRef<(source: "auto" | "click") => void>(() => {});

  const catalog = useInfiniteQuery({
    queryKey: ["catalog"],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => fetchShowPage(pageParam, signal),
    getNextPageParam: (lastPage, _pages, pageParam) => (lastPage.length < 250 ? undefined : pageParam + 1),
    staleTime: 10 * 60 * 1000,
  });

  const search = useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => searchShows(query, signal),
    enabled: searching,
    placeholderData: keepPreviousData,
  });

  const activeGenre = hydrated ? genre : null;
  const activeSort = hydrated ? sort : "listed";
  const activeDensity = hydrated ? density : "regular";
  const activeHideEnded = hydrated ? hideEnded : false;

  const prepared = useMemo(() => {
    const source = searching ? (search.data ?? []) : (catalog.data?.pages.flat() ?? []);
    return arrange(uniqueShows(source), activeGenre, activeHideEnded, activeSort);
  }, [activeGenre, activeHideEnded, activeSort, catalog.data, search.data, searching]);

  const featured = useMemo(() => {
    if (searching) return null;
    const firstPage = catalog.data?.pages[0] ?? [];
    return arrange(firstPage, activeGenre, activeHideEnded, "rating")[0] ?? null;
  }, [activeGenre, activeHideEnded, catalog.data, searching]);

  const gridShows = featured ? prepared.filter((show) => show.id !== featured.id) : prepared;
  const visible = searching ? gridShows : gridShows.slice(0, visibleCount);
  const hasBuffered = !searching && visibleCount < gridShows.length;
  const hasNextPage = !searching && Boolean(catalog.hasNextPage);
  const hasMore = hasBuffered || hasNextPage;
  const pageCount = catalog.data?.pages.length ?? 0;

  useEffect(() => {
    setVisibleCount(VISIBLE_STEP);
  }, [query, activeGenre, activeSort, activeHideEnded]);

  useEffect(() => {
    lockRef.current = false;
  }, [visibleCount, catalog.isFetchingNextPage]);

  loadMoreRef.current = (source) => {
    if (searching || lockRef.current) return;
    const thinFilter = Boolean(activeGenre || activeHideEnded) && gridShows.length < 8 && pageCount >= 10;
    if (source === "auto" && thinFilter) return;
    if (visibleCount < gridShows.length) {
      lockRef.current = true;
      setVisibleCount((count) => Math.min(count + VISIBLE_STEP, gridShows.length));
      return;
    }
    if (catalog.hasNextPage && !catalog.isFetchingNextPage) {
      lockRef.current = true;
      void catalog.fetchNextPage();
    }
  };

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMoreRef.current("auto");
      },
      { rootMargin: "320px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, pageCount, searching, catalog.isFetchingNextPage, gridShows.length]);

  const status = statusLine({
    searching,
    query,
    pending: searching && (search.isLoading || search.isPlaceholderData),
    shown: visible.length,
    matched: searching && search.isPlaceholderData ? 0 : gridShows.length,
    hasMore,
    loadingPage: catalog.isFetchingNextPage,
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">Listings</p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Series from a live catalog</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          The list loads the next page as you reach the bottom. Search waits until you pause. Genre, sort, and the watchlist stay in this browser.
        </p>
        {!searching ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {SEARCH_HINTS.map((hint) => (
              <Link
                key={hint}
                href={`/?q=${encodeURIComponent(hint)}`}
                className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:border-gold hover:text-ink"
              >
                {hint}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <div className="mt-8 flex flex-col gap-4 border-y border-line py-4">
        <div className="chip-row flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={activeGenre == null} onClick={() => setGenre(null)}>
            All genres
          </FilterChip>
          {GENRE_OPTIONS.map((option) => (
            <FilterChip key={option} active={activeGenre === option} onClick={() => setGenre(activeGenre === option ? null : option)}>
              {genreLabel(option)}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted">
            Sort
            <select
              value={activeSort}
              onChange={(event) => setSort(event.target.value as typeof activeSort)}
              className="h-10 rounded-full border border-line bg-card px-3 text-ink"
            >
              <option value="listed">As listed</option>
              <option value="rating">By rating</option>
              <option value="year">By year</option>
            </select>
          </label>
          <div className="flex rounded-full border border-line p-1">
            <DensityButton active={activeDensity === "regular"} onClick={() => setDensity("regular")}>
              Larger
            </DensityButton>
            <DensityButton active={activeDensity === "compact"} onClick={() => setDensity("compact")}>
              Denser
            </DensityButton>
          </div>
          <button
            type="button"
            aria-pressed={activeHideEnded}
            onClick={() => setHideEnded(!activeHideEnded)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm",
              activeHideEnded ? "border-gold bg-gold text-stage" : "border-line text-ink hover:border-gold",
            )}
          >
            Hide ended
          </button>
        </div>
      </div>

      {hydrated && recent.length > 0 && !searching ? (
        <section className="mt-8">
          <h2 className="font-display text-lg">Recently opened</h2>
          <ul className="chip-row mt-3 flex gap-3 overflow-x-auto pb-2">
            {recent.map((show) => (
              <li key={show.id} className="w-36 shrink-0">
                <ShowCard show={show} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {featured ? (
        <div className="mt-8">
          <Featured show={featured} />
        </div>
      ) : null}

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {status}
      </p>

      {!searching && catalog.isLoading ? <div className="mt-6"><GridSkeleton compact={activeDensity === "compact"} /></div> : null}
      {searching && search.isLoading ? <div className="mt-6"><GridSkeleton compact={activeDensity === "compact"} /></div> : null}

      {catalog.isError && !catalog.data ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p className="text-ink">TVMaze did not respond.</p>
          <button type="button" onClick={() => void catalog.refetch()} className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
            Try again
          </button>
        </div>
      ) : null}

      {search.isError && searching ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <p>Search did not respond.</p>
          <button type="button" onClick={() => void search.refetch()} className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-stage">
            Try again
          </button>
        </div>
      ) : null}

      {!catalog.isLoading && !search.isLoading && visible.length === 0 && !catalog.isError && !(searching && search.isError) ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-8 text-muted">
          {searching
            ? `Nothing matches “${query}”. The catalog uses original titles.`
            : "Nothing in the pages loaded so far. Load the next page or clear the filter."}
        </div>
      ) : null}

      {visible.length > 0 ? (
        <ul
          className={cn(
            "mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
            activeDensity === "compact" ? "xl:grid-cols-6" : "xl:grid-cols-5",
            searching && search.isPlaceholderData && "opacity-60",
          )}
        >
          {visible.map((show) => (
            <li key={show.id}>
              <ShowCard show={toSaved(show)} />
            </li>
          ))}
        </ul>
      ) : null}

      {catalog.isFetchNextPageError ? <p className="mt-6 text-center text-sm text-ticket">That page did not load. Press the button again.</p> : null}

      {!searching && !catalog.isLoading && !catalog.isError ? (
        <div className="mt-8 flex justify-center">
          <button
            ref={sentinelRef}
            type="button"
            onClick={() => loadMoreRef.current("click")}
            disabled={!hasMore || catalog.isFetchingNextPage}
            className="rounded-full border border-line px-5 py-2 text-sm text-ink enabled:hover:border-gold disabled:text-muted"
          >
            {catalog.isFetchingNextPage
              ? "Loading the next page…"
              : hasMore
                ? "More titles"
                : "End of the catalog"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm",
        active ? "border-gold bg-gold text-stage" : "border-line text-ink hover:border-gold",
      )}
    >
      {children}
    </button>
  );
}

function DensityButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn("rounded-full px-3 py-1.5 text-sm", active ? "bg-gold text-stage" : "text-muted")}
    >
      {children}
    </button>
  );
}

function statusLine({
  searching,
  query,
  pending,
  shown,
  matched,
  hasMore,
  loadingPage,
}: {
  searching: boolean;
  query: string;
  pending: boolean;
  shown: number;
  matched: number;
  hasMore: boolean;
  loadingPage: boolean;
}) {
  if (searching && pending) return `Searching for “${query}”…`;
  if (searching) return matched === 0 ? `No results for “${query}”.` : `${matched} results for “${query}”.`;
  if (loadingPage) return `Showing ${shown}. Loading another catalog page.`;
  if (shown === 0) return "Waiting for the first page.";
  if (hasMore) return `Showing ${shown} of ${matched} matches. Scroll for more.`;
  return `Showing the full selection: ${shown}.`;
}
