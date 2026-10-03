import type { CastCredit, Episode, Show } from "@/lib/types";

const API = "https://api.tvmaze.com";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();
  return data as T;
}

export async function fetchShowPage(page: number, signal?: AbortSignal): Promise<Show[]> {
  const response = await fetch(`${API}/shows?page=${page}`, { signal });
  if (response.status === 404) return [];
  if (!response.ok) throw new ApiError("The catalog did not respond", response.status);
  const data = await readJson<unknown>(response);
  if (!Array.isArray(data)) throw new ApiError("The catalog returned an unexpected response", response.status);
  return data as Show[];
}

export async function searchShows(query: string, signal?: AbortSignal): Promise<Show[]> {
  const response = await fetch(`${API}/search/shows?q=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) throw new ApiError("Search did not respond", response.status);
  const data = await readJson<unknown>(response);
  if (!Array.isArray(data)) throw new ApiError("Search returned an unexpected response", response.status);
  return data.map((hit) => {
    const row = hit as { show?: Show };
    return row.show;
  }).filter((show): show is Show => show != null);
}

export async function fetchShow(id: number, signal?: AbortSignal): Promise<Show> {
  const response = await fetch(`${API}/shows/${id}`, { signal });
  if (response.status === 404) throw new ApiError("This show is not in the catalog", 404);
  if (!response.ok) throw new ApiError("The title did not load", response.status);
  return readJson<Show>(response);
}

export async function fetchCast(id: number, signal?: AbortSignal): Promise<CastCredit[]> {
  const response = await fetch(`${API}/shows/${id}/cast`, { signal });
  if (response.status === 404) return [];
  if (!response.ok) throw new ApiError("The cast did not load", response.status);
  const data = await readJson<unknown>(response);
  return Array.isArray(data) ? (data as CastCredit[]) : [];
}

export async function fetchEpisodes(id: number, signal?: AbortSignal): Promise<Episode[]> {
  const response = await fetch(`${API}/shows/${id}/episodes`, { signal });
  if (response.status === 404) return [];
  if (!response.ok) throw new ApiError("The episodes did not load", response.status);
  const data = await readJson<unknown>(response);
  return Array.isArray(data) ? (data as Episode[]) : [];
}
