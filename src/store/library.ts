"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Density, SavedShow, SortKey } from "@/lib/types";

type LibraryState = {
  favorites: SavedShow[];
  recent: SavedShow[];
  genre: string | null;
  sort: SortKey;
  density: Density;
  hideEnded: boolean;
  toggleFavorite: (show: SavedShow) => void;
  remember: (show: SavedShow) => void;
  setGenre: (genre: string | null) => void;
  setSort: (sort: SortKey) => void;
  setDensity: (density: Density) => void;
  setHideEnded: (hideEnded: boolean) => void;
};

type StoredLibrary = Pick<LibraryState, "favorites" | "recent" | "genre" | "sort" | "density" | "hideEnded">;

function isSavedShow(value: unknown): value is SavedShow {
  if (!value || typeof value !== "object") return false;
  const show = value as Partial<SavedShow>;
  return typeof show.id === "number" && typeof show.name === "string" && Array.isArray(show.genres);
}

function readStored(persisted: unknown): Partial<StoredLibrary> {
  if (!persisted || typeof persisted !== "object") return {};
  return persisted as Partial<StoredLibrary>;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      favorites: [],
      recent: [],
      genre: null,
      sort: "listed",
      density: "regular",
      hideEnded: false,
      toggleFavorite: (show) =>
        set((state) => {
          const exists = state.favorites.some((item) => item.id === show.id);
          return {
            favorites: exists ? state.favorites.filter((item) => item.id !== show.id) : [show, ...state.favorites],
          };
        }),
      remember: (show) =>
        set((state) => ({
          recent: [show, ...state.recent.filter((item) => item.id !== show.id)].slice(0, 8),
        })),
      setGenre: (genre) => set({ genre }),
      setSort: (sort) => set({ sort }),
      setDensity: (density) => set({ density }),
      setHideEnded: (hideEnded) => set({ hideEnded }),
    }),
    {
      name: "marquee-library",
      skipHydration: true,
      partialize: (state) => ({
        favorites: state.favorites,
        recent: state.recent,
        genre: state.genre,
        sort: state.sort,
        density: state.density,
        hideEnded: state.hideEnded,
      }),
      merge: (persisted, current) => {
        const data = readStored(persisted);
        const sort = data.sort === "rating" || data.sort === "year" || data.sort === "listed" ? data.sort : current.sort;
        return {
          ...current,
          favorites: Array.isArray(data.favorites) ? data.favorites.filter(isSavedShow) : [],
          recent: Array.isArray(data.recent) ? data.recent.filter(isSavedShow) : [],
          genre: typeof data.genre === "string" ? data.genre : null,
          sort,
          density: data.density === "compact" ? "compact" : "regular",
          hideEnded: Boolean(data.hideEnded),
        };
      },
    },
  ),
);
