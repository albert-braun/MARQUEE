import type { Episode, SavedShow, Show, SortKey } from "@/lib/types";

const GENRE_LABEL: Record<string, string> = {
  "Science-Fiction": "Sci-fi",
};

const DAY_EN: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  laquo: "«",
  raquo: "»",
};

export const GENRE_OPTIONS = [
  "Drama",
  "Comedy",
  "Action",
  "Thriller",
  "Crime",
  "Science-Fiction",
  "Horror",
  "Fantasy",
  "Romance",
  "Mystery",
  "Adventure",
  "Anime",
  "Family",
  "Supernatural",
] as const;

export const SEARCH_HINTS = ["Dark", "Chernobyl", "Fleabag", "Arcane", "The Bear"] as const;

export const VISIBLE_STEP = 24;

export function genreLabel(genre: string) {
  return GENRE_LABEL[genre] ?? genre;
}

export function statusLabel(status: string) {
  switch (status) {
    case "Running":
      return "Airing";
    case "Ended":
      return "Ended";
    case "To Be Determined":
      return "To be determined";
    case "In Development":
      return "In development";
    default:
      return status;
  }
}

export function languageLabel(language: string | null) {
  return language;
}

export function yearOf(premiered: string | null) {
  return premiered?.slice(0, 4) ?? null;
}

export function channelOf(show: Show) {
  return show.network?.name ?? show.webChannel?.name ?? null;
}

export function runtimeOf(show: Show) {
  return show.averageRuntime ?? show.runtime;
}

export function scheduleLabel(show: Show) {
  const days = show.schedule.days.map((day) => DAY_EN[day] ?? day);
  const time = show.schedule.time;
  if (days.length === 0 && !time) return null;
  if (days.length === 0) return time;
  if (!time) return days.join(", ");
  return `${days.join(", ")} · ${time}`;
}

export function plainText(html: string | null | undefined) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(text: string, max = 280) {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max).replace(/\s+\S*$/, "");
  return `${sliced}…`;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function toSaved(show: Show): SavedShow {
  return {
    id: show.id,
    name: show.name,
    image: show.image?.medium ?? null,
    rating: show.rating.average,
    genres: show.genres,
    premiered: show.premiered,
    status: show.status,
  };
}

export function uniqueShows(shows: Show[]) {
  const seen = new Set<number>();
  return shows.filter((show) => {
    if (seen.has(show.id)) return false;
    seen.add(show.id);
    return true;
  });
}

export function arrange(shows: Show[], genre: string | null, hideEnded: boolean, sort: SortKey) {
  const filtered = shows.filter((show) => {
    if (genre && !show.genres.includes(genre)) return false;
    if (hideEnded && show.status === "Ended") return false;
    return true;
  });
  if (sort === "rating") {
    return [...filtered].sort(
      (a, b) => (b.rating.average ?? -1) - (a.rating.average ?? -1) || a.name.localeCompare(b.name),
    );
  }
  if (sort === "year") {
    return [...filtered].sort(
      (a, b) => (b.premiered ?? "").localeCompare(a.premiered ?? "") || a.name.localeCompare(b.name),
    );
  }
  return filtered;
}

export function groupEpisodes(episodes: Episode[]) {
  const map = new Map<number, Episode[]>();
  for (const episode of episodes) {
    const list = map.get(episode.season) ?? [];
    list.push(episode);
    map.set(episode.season, list);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

export function episodeCode(episode: Episode) {
  if (episode.number == null) return `S${episode.season}`;
  return `${episode.season}×${episode.number}`;
}
