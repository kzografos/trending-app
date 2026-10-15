# ZenithFlix

This is my solution to the Front-End Developer assessment. I built the home page of a small streaming platform:

- a **Trending Now** row with a loading skeleton, error and empty states
- a **detail modal** with a video player (and a fallback when the video can't play)
- **watch history** saved in `localStorage`, shown as progress bars and a **Recently Watched** row
- **search and genre filters** for the Trending row (bonus)

I also reviewed the provided `ContentBrowser.tsx` (Part 1) and fixed every issue I found in my own code.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · CSS Modules · Jest + React Testing Library

---

## 1. Setup

**Requirements:** Node.js 20.9+ (I developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script                        | What it does                              |
| ----------------------------- | ----------------------------------------- |
| `npm run dev`                 | Development server                        |
| `npm run build` / `npm start` | Production build / server                 |
| `npm test`                    | Unit tests (Jest + React Testing Library) |
| `npm run lint`                | ESLint                                    |

### How to try it

- **Video and watch history:** open **Echoes of Orion**. It is the only title with a playable video (`/videos/sample.mp4`). Play it for a few seconds: the progress appears on the tile and in **Recently Watched**. The other titles use unavailable video URLs, like the sample data, so they show the fallback.
- **Search and filters:** type in "Search titles" (for example `orion`), or pick a genre chip. Both can be combined. Try `zzz` to see the "no results" state with **Clear filters**.
- **Loading, error and empty states:** the mock API (`src/app/api/content/route.ts`) reads a `scenario` cookie. Run one of these in the browser console, then reload:

  ```js
  document.cookie = "scenario=slow; path=/"; // 5 s delay → skeleton
  document.cookie = "scenario=error; path=/"; // HTTP 500 → error + Retry
  document.cookie = "scenario=empty; path=/"; // no titles → empty state
  document.cookie = "scenario=no-categories; path=/"; // broken response shape
  document.cookie = "scenario=null-trending; path=/"; // broken response shape
  document.cookie = "scenario=; path=/; max-age=0"; // back to normal
  ```

- **Part 1 (the original component):** it runs unchanged at [`/review`](http://localhost:3000/review), so every finding below can be reproduced. I excluded it from ESLint on purpose (`eslint.config.mjs`), because I kept the original code as it was given.

---

## 2. How I structured the app

```
app/layout.tsx (Server)       Header (Server: no JavaScript sent to the browser)
app/page.tsx   (Server)
  └── Browse  ("use client")   loads the data, keeps the history, the filters and the open item
        ├── BrowseToolbar      search + genre chips
        ├── TrendingRow        loading / error / empty / tiles
        ├── HistoryRow         "Recently Watched"
        └── ContentModal       <dialog> + VideoPlayer
```

```
src/
  app/            pages, layout, mock API (api/content), Part 1 page (review)
  components/     UI components, each with its own CSS Module
  hooks/          useTrending, useWatchHistory
  lib/            API client, formatters, filters, watch-history store (plain TypeScript, no React)
  data/           mock content
  types/          ContentItem, ApiResponse, WatchHistory
```

- **Server Components by default.** The layout, the page and the header render on the server. `Browse` is the only component marked `"use client"`, because it is the only one that needs state. Everything it imports also runs in the browser.
- **Data flow.** `fetchTrending()` loads the data **and checks its shape**. `useTrending()` handles the React side: state, cancelling old requests, retry. The rows only display what they receive as props and report clicks back with `onSelect` / `onRetry`.
- **Filtered results are calculated, not stored.** `Browse` keeps only the search text and the selected genre in state. The filtered list is calculated from them on every render (`filterItems(items, { query, genre })`). I didn't store it in a second state synced with a `useEffect`: that adds an extra render, can show stale data for a moment, and is the same "setState inside an effect" pattern as in the Part 1 code. The filtering logic is a plain function, so it is unit-tested without React.
- **Types match the API exactly**, including the mixed naming (`video_url`, `watchProgress`). I chose this so there is no extra mapping layer to maintain. The cost is that the mixed naming appears in the code.
- **Styling.** CSS Modules only, mobile-first, breakpoints at 768 / 1024 / 1280 px, dark theme, a few CSS variables (`--background`, `--foreground`, `--accent`). The horizontal rows keep a thin, subtle scrollbar instead of hiding it. On desktop it is the only visible hint that there is more content (and the only way to scroll for a mouse without horizontal scrolling).
- **Images.** `next/image` with `sizes` that match the tile widths, so the browser downloads small WebP files (~2 KB each) instead of the 500 px originals. `width`/`height` reserve the space, so the page doesn't jump. The first posters of the Trending row load immediately, because they are visible on first paint. The rest load lazily. The placeholder service returns SVG by default, which `next/image` doesn't optimise, so I request PNG (`/png`) and allow `placehold.co` in `next.config.ts`.
- **Accessibility.**
  - Every clickable element is a real `<button>` or `<a>`, with a visible focus style.
  - There is a "Skip to content" link.
  - Loading is announced to screen readers.
  - Decorative graphics are hidden from screen readers, and where meaning is only visual (rating star, progress bar) there is a text alternative.
  - Hover animations respect "reduced motion", and zoom is not blocked.

---

## 3. Key Decisions

### 3.1 I used the browser's `<dialog>` instead of building my own modal

**What:** the modal is a native `<dialog>` opened with `showModal()`. A small effect keeps React state and the dialog in sync.

**Why:** in Part 1, the hand-made modal had most of the accessibility bugs I found (#9, #11). The browser's `<dialog>` already does the hard parts correctly:

- it shows on top of everything
- it makes the page behind it inactive
- Escape closes it
- focus moves into it, and goes back to the tile when it closes

I added only what was missing:

- **Keeping Tab inside the modal.** An invisible "focus guard" at the end sends focus back to the start, and Shift+Tab on the first element goes to the last one. I used a guard instead of checking "is this the last element?", because the video controls count as a single element for the page.
- Closing on a backdrop click.
- Stopping the page behind from scrolling.

**Trade-off:** I have less control over how it works internally, and the test environment (jsdom) doesn't support `showModal()`. So I tested the modal by hand instead of with unit tests.

### 3.2 I used `useSyncExternalStore` for the watch history (instead of `useState` + `useEffect`)

**The problem:** `localStorage` only exists in the browser, but Next also renders the page on the server. If a component reads `localStorage` while rendering, the server HTML and the browser HTML are different, and React reports a hydration error. The usual fix is to read it in a `useEffect` after the first render, but that is exactly the "setState inside an effect" pattern the linter flags in the Part 1 code.

**What I did:**

- `src/lib/watchHistoryStore.ts` is a small store in plain TypeScript: read, write, and notify on changes.
- `useWatchHistory()` connects it to React with `useSyncExternalStore`, a React hook made for data that lives outside React.

**Why it works better:**

- On the server the history is empty, and React switches to the real data after hydration, so there is no mismatch.
- **Every component stays in sync without a Context.** While the video plays, the tile's progress bar and the Recently Watched row update immediately. Other open tabs update too.
- Stored data is treated like API data: it is validated, and wrapped in `try/catch`. If someone corrupts it, or storage is blocked, the page still works. One broken entry doesn't break the others.

**Trade-off:** more concepts to understand than a simple `useEffect`, and an extra file.

### 3.3 One component owns the data; the rows only display it

**What:** `Browse` owns the data, the history and the selected item. `TrendingRow`, `HistoryRow` and `ContentTile` only receive props. The loading state is one value, `status: "loading" | "error" | "success"`, instead of separate `loading` / `error` booleans.

**Why:**

- **One request and one modal** for both rows.
- The UI **can't be "loading" and "error" at the same time**. The type doesn't allow it.
- **The rows are easy to test.** To test the error state I just pass `status="error"`. No fetch mocking needed.

**Trade-off:** an extra component and more props to pass. I had to refactor when I added the history row.

---

## 4. Code review findings (Part 1: `ContentBrowser.tsx`)

**How I worked:**

1. I read the code and wrote down what I thought could break.
2. I reproduced each suspicion in the browser: the cookie scenarios, a slow network, keyboard only, the mobile view, dev and production builds, Lighthouse.
3. I fixed each one, and checked that the fix works.

I implemented every fix in my Part 2 code, and kept the original unchanged at `/review`, so each problem can be compared side by side with its fix.

> Lighthouse gave the original component an Accessibility score of **100**, but it still had serious keyboard bugs (#8, #11). Automated tools check HTML attributes, not behaviour, so I tested the keyboard flows by hand.

### Summary

| #   | What breaks                                                                                                                           | Severity |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 7   | `trending: null` from the API crashes the **whole page**, and reloading doesn't help                                                  | High     |
| 6   | The response shape is never checked. A successful (200) response with the wrong shape shows "Failed to load"                          | High     |
| 8   | Tiles are `<div onClick>`, so they can't be reached or opened with the keyboard                                                       | High     |
| 9   | The "modal" isn't a real modal: it appears below the list, has no overlay, Escape doesn't close it, and on mobile it opens off-screen | High     |
| 11  | Focus isn't moved into the modal, isn't kept inside it, and is lost when it closes                                                    | High     |
| 2   | When a request is cancelled, it still turns off the loading indicator of the next request                                             | Medium   |
| 1   | The first render shows an empty row with no loading indicator                                                                         | Medium   |
| 3   | After an error there is no way to retry                                                                                               | Medium   |
| 4   | Errors are never logged, so real bugs disappear silently                                                                              | Medium   |
| 12  | Not responsive: 500 px images on a 375 px screen, and the page jumps when they load                                                   | Medium   |
| 5   | No empty state: "no titles" looks the same as "loading" and "broken"                                                                  | Low      |
| 10  | The modal shows only the title (no year, rating, description, video)                                                                  | Low      |
| 13  | The loading message is added together with its live region, so many screen readers don't announce it                                  | Low      |

Smaller issues: `setPage` is never used (pagination is unfinished), `useCallback` adds nothing here (the handler is wrapped in a new arrow function on every render anyway), inline styles, `overflowX: "scroll"` always shows a scrollbar on Windows, and `<div role="main">` instead of `<main>`.

### The most important ones in detail

**#7: one bad field crashes the whole page.**
If the API returns `trending: null`, saving it to state works fine. The crash happens later, while rendering (`null.map`), where nothing catches it. React removes the whole page, and in production the user sees "This page couldn't load". Reloading fetches the same data and crashes again.
_Why it matters:_ on a streaming home page with many rows, one bad field in one row takes down everything.

**#6: the response shape is never checked.**
`Promise<ApiResponse>` only tells TypeScript what to expect. It doesn't check anything at runtime. A 200 response without `categories` throws inside `.then`, and the user sees "Failed to load content", even though the network was fine. The real cause is lost (#4).

```ts
// Before (ContentBrowser.tsx)
.then((data) => {
  setTrendingContent(data.categories.trending);
})

// After (src/lib/api.ts): check the data before using it
const items = data?.categories?.trending;
if (!Array.isArray(items)) {
  throw new Error("Invalid data format: 'categories.trending' is not an array");
}
return items;
```

**#2: a cancelled request hides the loading indicator.**
When a request is cancelled (React does this in development, and it also happens when the page changes during a request), `catch` returns early, but `finally` still runs `setLoading(false)`, while the new request is still loading. I reproduced it with the `slow` scenario: the console showed `catch: AbortError` and then `finally` right away, and the loading message disappeared for the remaining 5 seconds.
_Why it matters:_ the user sees an empty or old row with no sign that something is loading.

```ts
// Before
.catch((err) => { if (err.name === "AbortError") return; setError("..."); })
.finally(() => setLoading(false));

// After (src/hooks/useTrending.ts): a cancelled request never changes state
.then((data) => {
  if (controller.signal.aborted) return;
  setItems(data);
  setStatus("success");
})
.catch((err) => {
  if (controller.signal.aborted) return;
  console.error("Error fetching trending content:", err);
  setStatus("error");
});
```

**#8: the tiles don't work with a keyboard.**
A `<div>` with `onClick` can't receive focus, ignores Enter and Space, and screen readers don't announce it as a button. The Close button in the same component works without any extra code, simply because it is a `<button>`.

```tsx
// Before
<div key={item.id} onClick={() => handleItemClick(item)}>

// After (src/components/ContentTile.tsx)
<button type="button" className={styles.tile} onClick={() => onSelect(item)}>
```

**#9 / #11: the modal and focus.**
`role="dialog"` and `aria-modal="true"` promise behaviour that the code never implements. Focus doesn't move into the dialog (the first Tab landing on Close is only a coincidence of the HTML order), Tab leaves the dialog, and closing it removes the focused button, so focus is lost. _Fix:_ the native `<dialog>` with a focus guard (Key Decision 3.1). I checked it with the keyboard: Enter opens with focus on ×, Tab and Shift+Tab stay inside, and Escape or × returns focus to the same tile.

**#1: no loading state on first render.**
`useState(false)` means the HTML from the server (view source) shows an empty row and no "Loading" text until the JavaScript loads and the effect runs.

```ts
// Before
const [loading, setLoading] = useState(false);

// After: the server HTML already contains the skeleton
const [status, setStatus] = useState<Status>("loading");
```

---

## 5. Assumptions

**Data / API**

- `rating` is on a 0–10 scale, shown with one decimal (`8` → "8.0").
- `duration` is in minutes (`155` → "2h 35m", `45` → "45m", `120` → "2h").
- `watchProgress` from the API is always 0. Real progress comes from the local watch history.
- There is no pagination, so `?page=` is ignored.
- The mock error response is plain text with status 500, like many real servers send.
- Placeholder images are requested as PNG instead of the sample's SVG, so that `next/image` can optimise them.

**UX**

- Dark theme only, as is common for streaming platforms.
- **Progress means the last playback position** (like Netflix and YouTube), not the furthest point reached. I calculate it from the video file itself (`currentTime / duration`), not from the API's `duration`.
- **No resume.** The brief excludes it, so videos always start from the beginning.
- I named the history row **"Recently Watched"**, not "Continue Watching", because it doesn't resume playback. It is sorted by most recent and sits **below** Trending, so it doesn't push content down when it appears. It shows a short hint when it is empty, and only lists titles that exist in the catalogue.
- When a video can't load, a message appears in a box of the same size (no jump). I didn't add "Try again", because retrying doesn't help when the file doesn't exist.
- The one playable video is my own screen recording, so there are no licensing issues.

**Search and filters (bonus)**

- The search and genre chips sit **just above the Trending row**, because they only filter that row. "Recently Watched" is your own list, so it doesn't disappear while you search.
- Results update **as you type**. With a small catalogue loaded in the browser, there is no need for a Search button.
- The search matches the **title** and ignores letter case and spaces at the start or end (`" ORION "` finds _Echoes of Orion_).
- The genre chips are **built from the data**, not hard-coded, so a new genre from the API appears automatically. One genre at a time, plus "All". Search and genre are combined.
- "No results" has its own message and a **Clear filters** button, because, unlike an empty catalogue, the user can fix it.
- Accessibility: the bar is a `search` landmark, the input has a label (not just a placeholder), the chips are toggle buttons (`aria-pressed`), and the number of results is announced to screen readers. The chip's "selected" style comes from the same `aria-pressed` attribute, so what you see and what a screen reader hears can't disagree.

---

## 6. Testing

```bash
npm test   # 4 suites, 22 tests
```

**What I tested and why:**

- **`TrendingRow`**, the main UI component. Normal case: titles render as buttons, and clicking one calls `onSelect` with the right item. Edge cases: error + Retry, empty list, loading (the status is announced and the skeleton is hidden from screen readers), and progress included in the tile's name.
- **`parseHistory`**, where outside data (`localStorage`) enters the app. Edge cases: corrupted JSON, a value that isn't an object, and invalid entries dropped while valid ones are kept.
- **`filterItems` / `getGenres`**: no filter, letter case, extra spaces, genre only, search and genre combined (they must both match), no matches, unique genres in A–Z order.
- **`formatDuration` / `formatRating`**: minutes only, whole hours, one decimal place.

I query elements the way a user or a screen reader finds them (`getByRole("button", { name: ... })`), so the tests also check accessibility. If a tile were a `<div>` again, they would fail.

**What I didn't unit-test, and why:** the modal, the focus trap and the video. The test environment has no `showModal()` and can't play media, so these need a real browser. I tested them by hand, and they are the first thing I would cover with end-to-end tests.

---

## 7. Next steps

**Scope:** I first delivered the required features complete, accessible and tested. Then I added one bonus that fits the existing architecture well: search and genre filters. I left out login and the user menu on purpose, because I would rather not ship a half-done authentication flow.

**Authentication (planned, not implemented).** This is how I would add login with a JWT:

- A login form posts to a Route Handler (`app/api/auth/login`), which checks the credentials on the server and signs a short-lived JWT.
- The token goes into an **`httpOnly`, `Secure`, `SameSite=Lax` cookie**, **not** `localStorage`. JavaScript on the page can't read an `httpOnly` cookie, so an XSS bug can't steal the token.
- Server Components (the header, protected pages) read and verify the cookie on the server. So the user state ("Sign in" or the avatar menu) is correct in the first HTML, with no flash of the wrong state.
- Logout is a Route Handler that clears the cookie. A refresh-token flow would follow for longer sessions.
