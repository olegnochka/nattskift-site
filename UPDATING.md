# Updating nattskiftgames.com

The site is an Astro project. Every push to `main` on GitHub
(`olegnochka/nattskift-site`) is built and published by Netlify in about
30 seconds. There is no other deploy step.

Local copy: `~/Desktop/Xcode projects/nattskift-site`

## Where things live

| To change | Edit |
|---|---|
| A game's page (text, prices, facts, FAQ, privacy, press) | `src/content/games/<game>.json` |
| A game's images (key art, background, pillars, screens) | `src/content/games/art/` (named in that JSON) |
| Add a new game | Copy an existing JSON in `src/content/games/`, rename it, add its art. That one file creates the game page, its homepage card, footer links and press section |
| Game order on the homepage and /games | `"order"` in each game's JSON (lowest first) |
| Released vs coming soon | `"comingSoon"`: `false` shows the App Store badge, `true` shows a notify-me form |
| Support / privacy hosted elsewhere | `"supportUrl"` / `"privacyUrl"` in the JSON (otherwise the site makes its own pages from `support` / `privacy`) |
| Homepage text and the three promises | `src/pages/index.astro` (the `promises` list near the top) |
| About page, "How the money works", "Things this studio will never do" | `src/pages/about.astro` |
| Games list intro ("Five titles...") | `src/pages/games/index.astro` |
| Press page | `src/pages/press.astro` (per-game press text is the `press` block in each JSON) |
| Header / footer | `src/components/Header.astro`, `src/components/Footer.astro` |
| Social preview images (generated) | `scripts/generate-og.mjs` |
| Devlog notes | Markdown files in `src/content/notes/` |
| Fields a game JSON must have | `src/content.config.ts` (a missing field fails the build and names it) |

## Steps

```bash
cd ~/Desktop/"Xcode projects"/nattskift-site
git pull                      # get the latest
# edit files
npm run build                 # must finish with "page(s) built"
npm run linkcheck             # must say "all resolve"
npm run preview               # check it at http://localhost:4321
git add -A && git commit -m "What changed"
git push                      # live in ~30 seconds
```

Then open the changed page on https://nattskiftgames.com to confirm.

## Tips

- Images: JPEG or PNG; Astro converts and resizes them. Pillar images are
  3:2 (e.g. 1800x1200), screenshots are phone-shaped (about 600x1304).
- Keep each game's "The deal" honest and exact - prices, what's paid, and
  what the paid currency buys. The homepage promises must stay true for every
  game.
- To undo a bad publish: `git revert HEAD && git push`.
