"use client";

import { HeartIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useLibraryHydrated } from "@/hooks/use-library-hydrated";
import type { SavedShow } from "@/lib/types";
import { useLibrary } from "@/store/library";

export function FavoriteButton({ show, className }: { show: SavedShow; className?: string }) {
  const hydrated = useLibraryHydrated();
  const active = useLibrary((state) => state.favorites.some((item) => item.id === show.id));
  const toggleFavorite = useLibrary((state) => state.toggleFavorite);
  const pressed = hydrated && active;

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={pressed ? `Remove “${show.name}” from the watchlist` : `Save “${show.name}” to the watchlist`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(show);
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-stage/80 text-ink backdrop-blur transition hover:text-gold",
        pressed && "text-ticket",
        className,
      )}
    >
      <HeartIcon filled={pressed} />
    </button>
  );
}
