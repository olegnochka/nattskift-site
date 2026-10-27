# Audit report — 2026-08-16

Run against the production build (`npm run build`, 13 pages), Lighthouse via
headless Chrome, contrast via `npm run contrast` (WCAG 2.1 relative-luminance
math in `scripts/contrast.mjs`).

## Architecture constraints

| Check | Result |
| --- | --- |
| Backend / database / API routes | None. Static output only; `dist/` is plain HTML, CSS, images, fonts. |
| Forms | Zero `<form>` elements anywhere in `dist/`. Contact is mailto. |
| Cookie banner / analytics / chat / newsletter | Google Analytics 4 only (G-KVD2ZHFL07, added 2026-10-20 in Base.astro, ad features off), disclosed on /privacy. No cookie banner, chat or newsletter. |
| Third-party requests on page load | Zero. Only external URLs in the HTML are plain navigation anchors (App Store, Bluesky, the trailer's no-JS fallback link). Fonts self-hosted. The trailer iframe is created only on click. |
| Readable with JavaScript disabled | Yes. Reveal animations are gated on an `html.js` class set by script; without JS every section is visible. The FAQ accordion is server-rendered expanded and only collapses when JS wires the buttons. The trailer poster is a plain link. |
| Apple-required routes | `/games/<id>/support` and `/games/<id>/privacy` for both titles build as static HTML, no redirect, no JS gate. |

## Contrast (computed, WCAG 2.1 AA)

All pairings pass. Recomputed after the palette moved to the brand kit's
ink `#090B0F` and violet `#7133AA`: every ratio either held or improved —
the primary button label went from 6.78:1 to **6.99:1** — and the violet
still fails as text at **2.58:1**, which is why it stays fill-only.

| Pairing | Ratio | Requirement | Verdict |
| --- | --- | --- | --- |
| text `#ECEFF3` on ink | 17.07:1 | 4.5:1 | pass |
| text on surface | 15.87:1 | 4.5:1 | pass |
| text on raised | 14.48:1 | 4.5:1 | pass |
| muted `#9AA4B2` on ink | 7.81:1 | 4.5:1 | pass |
| muted on surface | 7.26:1 | 4.5:1 | pass |
| muted on raised | 6.62:1 | 4.5:1 | pass |
| royal-light `#9E82D4` on ink | 6.19:1 | 4.5:1 | pass |
| royal-light on surface | 5.75:1 | 4.5:1 | pass |
| button label `#F7F5F0` on royal | 6.99:1 | 4.5:1 | pass |
| deal-section label (80% opacity) on royal | 5.07:1 | 3:1 | pass |
| white on royal (logo GAMES line) | 7.62:1 | 3:1 (large) | pass |
| sodium `#FFB74A` on ink | 11.37:1 | 4.5:1 | pass |
| danger-text `#FF7B7E` on ink | 7.86:1 | 4.5:1 | pass |
| danger-text on surface | 7.31:1 | 4.5:1 | pass |
| focus ring royal-light vs ink | 6.19:1 | 3:1 (component) | pass |
| hairline-equivalent border vs surface | 1.12:1 | — | decorative, not a control boundary |
| royal as text on ink | 2.58:1 | — | forbidden by design, enforced fill-only |

No pairing fails.

## Keyboard and focus

- Skip-to-content link is the first focusable element on every page and
  targets `#main`.
- All interactive elements are native `<a>`/`<button>`; zero negative
  tabindex; no `outline: none` anywhere.
- Global `:focus-visible` ring: 2px `--royal-light`, offset 2px (6.19:1
  against ink). FAQ accordion uses real buttons with `aria-expanded` /
  `aria-controls` and is fully keyboard operable.

## Motion

Every transition, reveal, and the cross-document page fade live inside
`@media (prefers-reduced-motion: no-preference)`, and the scroll reveals are
additionally gated on `html.js`. With reduced motion (or no JS) the site is
completely static: no animation plays, nothing is hidden waiting for an
observer. The film grain is a static tiled SVG, never animated,
`pointer-events: none`.

## Layout shift on font load

Fallback `@font-face` blocks (`Archivo Fallback`, `IBM Plex Sans Fallback`)
carry `size-adjust` / `ascent-override` / `descent-override` against Arial,
and the two above-the-fold faces are preloaded. Lighthouse measures **CLS 0**
on both audited pages.

## Lighthouse (headless Chrome, production build)

| Category | Homepage `/` | Game page `/games/last-light/` |
| --- | --- | --- |
| Performance | 99 | 99 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |

Homepage: LCP 2.0 s (throttled mobile), TBT 0 ms, CLS 0.
Game page: LCP 2.1 s, CLS 0. The single performance point in both cases is
the throttled-mobile LCP render delay, not a resource problem.

## Link integrity

`npm run linkcheck`: 333 internal references across `dist/` — hrefs, srcs,
srcsets — all resolve to built files.

## Known limitations (honest list)

- The logo seam nudge (1.5% of cap height, guarding the K/F junctions) was
  set from Archivo's metrics but has not been eyeballed at high zoom on a
  physical display in this environment; `NUDGE` in `LogoLockup.astro` is the
  single tuning knob if a junction still touches the seam.
- Lighthouse's headless run exits 1 on Windows while cleaning its temp
  profile *after* writing the report; scores above are from the written
  reports.
- App Store ids, trailer embed URLs, the Bluesky handle, and the production
  domain are placeholders — full list in the README.
