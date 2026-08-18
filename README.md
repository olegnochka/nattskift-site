# nattskift.games

Static marketing site for Nattskift Games — one person, Los Angeles, iOS
games with no ads, no energy timers, no dark patterns. Astro 7 + Tailwind 4,
static HTML only, no client-side JavaScript required to read anything.

## Local development

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # generates favicons + OG images, then builds to dist/
npm run preview    # serves the production build
npm run linkcheck  # verifies every internal link in dist/ (build first)
npm run contrast   # recomputes the WCAG contrast table (see AUDIT.md)
```

Node 20+ recommended (developed on 24). No environment variables.

## Add a game with one file

Drop one JSON file into `src/content/games/` (copy `last-light.json` as a
starting point) and put its art next to it in `src/content/games/art/`.
That single file produces:

- `/games/<filename>` — the nine-section game page
- `/games/<filename>/support` — support page with FAQ (Apple-required)
- `/games/<filename>/privacy` — privacy policy (Apple-required)
- a card on the homepage slate and `/games`, footer links, a press section,
  and a generated OG image set

The schema is typed and validated at build time — a missing field fails the
build with a message naming the field; see `src/content.config.ts` for every
field and what it feeds. Image paths in the JSON are relative to the file
(`./art/...`) and run through Astro's image pipeline, so swapping the
placeholder SVGs for PNG/JPEG needs no code change.

Devlog notes are markdown files in `src/content/notes/` with `title`,
`date`, and `description` frontmatter. While that folder is empty the
homepage's latest-note section and the notes index render an honest nothing.

## Deploy (Netlify)

The repo carries a `netlify.toml`, so Netlify needs no manual build
configuration:

1. app.netlify.com → Add new project → Import an existing project →
   GitHub → pick `olegnochka/nattskift-site`.
2. Netlify reads `netlify.toml` (build `npm run build`, publish `dist`,
   Node 22). Just click Deploy.
3. Every push to `main` deploys automatically; `404.html` is served for
   unknown routes out of the box.
4. Custom domain (registered at Squarespace): Netlify → Domain management →
   Add custom domain, then in Squarespace's DNS settings add the records
   Netlify shows (an `A` record for the apex and a `CNAME` for `www`).
   HTTPS is provisioned automatically once DNS resolves.
5. After the domain is live, update `site` in `astro.config.mjs` and the
   sitemap line in `public/robots.txt` if the domain differs from
   `nattskift.games`.

Every deploy regenerates favicons and OG images from source
(`scripts/generate-favicons.mjs`, `scripts/generate-og.mjs`) — they are
gitignored on purpose.

## Where the design tokens live

`src/styles/global.css`, in the `@theme` block at the top. Colors, fonts,
radii, and easing are defined there and nowhere else; the default Tailwind
palette is wiped so only brief-approved colors can be used. The type scale
(`type-hero` … `type-micro`), the grain overlay, motion gating, and focus
styles are in the same file. `--royal` is fill-only — it fails contrast as
text (2.62:1) and every purple text/border uses `--royal-light` instead.

Fonts are self-hosted woff2 Latin subsets in `public/fonts/` (Archivo
variable with the width axis, IBM Plex Sans 400/500, IBM Plex Mono 400,
all SIL OFL). `scripts/fonts/` holds TTF copies used only at build time to
render OG-image text.

## Placeholders to replace before launch

| Placeholder | Where |
| --- | --- |
| App Store ids (`0000000000`) | `appStoreId` in each `src/content/games/*.json` (feeds the badge link and the Smart App Banner meta) |
| Trailer embed URLs (`.../embed/PLACEHOLDER`) | `trailer.embedUrl` in each game JSON |
| All art (key art, pillars, screenshots) | hand-built placeholder SVGs in `src/content/games/art/` — swap for real captures, same filenames or update the JSON |
| Domain | live at `nattskiftgames.com` (primary/canonical); `nattskift.games`, `.store`, `.studio`, and `nattskift.netlify.app` redirect to it via Netlify domain aliases |
| Bluesky handle | `src/components/Footer.astro` and homepage JSON-LD `sameAs` |
| Contact addresses (`hello@` / `press@`) | grep for `nattskift.games` mailtos once the real domain and mailboxes exist |
| Release dates, sizes, versions in the facts tables | each game JSON — currently plausible fiction |

## Audit

`AUDIT.md` holds the full audit: computed contrast ratios, Lighthouse
scores (99/100/100/100 on both audited pages, CLS 0), keyboard and
reduced-motion verification, and the honest list of known limitations.
