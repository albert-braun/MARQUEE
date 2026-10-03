# MARQUEE

The guide is published at [albert-braun.github.io/MARQUEE](https://albert-braun.github.io/MARQUEE/).

A guide to series and shows. The catalog comes from [TVMaze](https://www.tvmaze.com/api), a public API that does not need a key, so anyone who clones the project can open it.

TVMaze stands in for TMDB for one reason: TMDB needs a personal key, and without it a portfolio demo does not start. The behavior is the same: a paged catalog, search, and a detail page.

## What it shows

- **React Query** loads catalog pages (`useInfiniteQuery`), plus search, the detail page, cast, and episodes (`useQuery`).
- **Infinite list** shows 24 posters at a time. Reaching the bottom reveals the next batch, and when the local buffer runs out the app requests the next API page. The “More titles” button does the same thing from the keyboard.
- **Paused search** sends the request 0.4s after typing stops, and only when the field has at least two characters. Until then, a line under the field says the request has not been sent. The address bar receives `?q=`.
- **LocalStorage** keeps the watchlist, recently opened titles, genre, sort, grid density, and “hide ended.” The key is `marquee-library`.

## Run

```bash
npm install
npm run dev
```

The site opens at [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run lint
```

## What to click in a demo

1. Scroll the listings to “More titles.” The list continues without a reload.
2. Type `Dark` and watch the line under the field: the request does not fire on every letter.
3. Press the heart and open Watchlist. Reload the page. The show is still there.
4. Pick a genre or “Hide ended,” then reload. The setting stays.
5. Open a title: rating, cast, and episodes by season.
