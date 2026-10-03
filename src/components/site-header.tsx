"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useLibraryHydrated } from "@/hooks/use-library-hydrated";
import { cn } from "@/lib/cn";
import { useLibrary } from "@/store/library";

const PAUSE_MS = 400;

function publishedQuery(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= 2 ? trimmed : "";
}

export function HeaderFallback() {
  return (
    <div className="sticky top-0 z-30 border-b border-line bg-stage/90">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="font-display text-lg tracking-wide text-gold">MARQUEE</div>
        <div className="h-11 flex-1 rounded-full bg-card" />
        <div className="h-10 w-28 rounded-full bg-card" />
      </div>
      <div className="bulb-row" />
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const debounced = useDebounce(value, PAUSE_MS);
  const hydrated = useLibraryHydrated();
  const favoriteCount = useLibrary((state) => state.favorites.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  const urlQueryRef = useRef(urlQuery);
  const pathnameRef = useRef(pathname);
  const ownWrite = useRef(false);
  valueRef.current = value;
  urlQueryRef.current = urlQuery;
  pathnameRef.current = pathname;
  const pending = publishedQuery(value) !== urlQuery;

  useEffect(() => {
    if (ownWrite.current) {
      ownWrite.current = false;
      return;
    }
    setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const next = publishedQuery(debounced);
    if (next === urlQueryRef.current) return;
    if (debounced !== valueRef.current) return;
    ownWrite.current = true;
    const href = next ? `/?q=${encodeURIComponent(next)}` : "/";
    if (pathnameRef.current === "/") router.replace(href, { scroll: false });
    else router.push(href);
  }, [debounced, router]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-stage/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg tracking-wide text-gold">
          MARQUEE
        </Link>
        <form
          className="relative min-w-[16rem] flex-1"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            inputRef.current?.blur();
          }}
        >
          <label htmlFor="catalog-search" className="sr-only">
            Search by title
          </label>
          <input
            id="catalog-search"
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Title, for example Dark"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-full border border-line bg-card pr-16 pl-4 text-sm text-ink outline-none placeholder:text-muted"
          />
          {value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-2 text-sm text-muted hover:text-ink"
              aria-label="Clear search"
            >
              clear
            </button>
          ) : (
            <span className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 text-xs text-muted sm:inline">/</span>
          )}
        </form>
        <Link
          href="/watchlist"
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm",
            pathname.startsWith("/watchlist") ? "border-gold text-gold" : "border-line text-ink hover:border-gold",
          )}
        >
          Watchlist
          {hydrated && favoriteCount > 0 ? (
            <span className="rounded-full bg-gold px-1.5 text-xs font-semibold text-stage tabular-nums">{favoriteCount}</span>
          ) : null}
        </Link>
        <p className={cn("text-xs text-gold", pending ? "basis-full sm:pl-[5.6rem]" : "sr-only")} aria-live="polite">
          {pending ? "Waiting 0.4s — the request has not been sent" : "Search is ready"}
        </p>
      </div>
      <div className="bulb-row" />
    </header>
  );
}
