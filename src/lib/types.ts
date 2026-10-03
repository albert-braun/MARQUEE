export type ShowImage = {
  medium: string;
  original: string;
} | null;

export type Show = {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  schedule: { time: string; days: string[] };
  rating: { average: number | null };
  network: { name: string } | null;
  webChannel: { name: string } | null;
  image: ShowImage;
  summary: string | null;
};

export type SavedShow = {
  id: number;
  name: string;
  image: string | null;
  rating: number | null;
  genres: string[];
  premiered: string | null;
  status: string;
};

export type CastCredit = {
  person: { id: number; name: string; image: ShowImage };
  character: { id: number; name: string };
};

export type Episode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string;
  runtime: number | null;
  summary: string | null;
};

export type SortKey = "listed" | "rating" | "year";
export type Density = "regular" | "compact";
