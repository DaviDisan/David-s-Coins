# David's Coins & Collectibles — website

Static site: open `index.html` in a browser, or upload the whole `site/` folder to any host (Netlify, GitHub Pages, Cloudflare Pages, GoDaddy, etc.).

## Fill in your business details
Edit the `BUSINESS` block at the top of `assets/js/main.js` (phone and email). Every place on the page updates automatically. Also replace the `(000) 000-0000` / `info@example.com` fallbacks in `index.html` so they show correctly for search engines. The business is online-only, so the site has no address or store hours.

## Change inventory
In `index.html`, each `<article class="coin-card">` is one item:
- `data-cat`: `eagles`, `bullion`, or `sets` (controls the filter buttons)
- `data-front` / `data-back`: photo names in `assets/img/photos/` (without `.jpg`)
- After replacing photos, bump `PHOTO_VERSION` in `main.js` so browsers don't show the old cached ones.

## Live prices
Spot prices come from the free gold-api.com feed and refresh every 60 seconds. If the feed is down, the page shows "Call for price".

## Contact form
The form opens the visitor's email app, addressed to `BUSINESS.email`. To receive submissions directly, point the form at a service like Formspree or Netlify Forms.

## Files
- `assets/img/logo-mark.svg`: refreshed DC coin-medallion logo (gold + silver)
- `assets/img/logo-original.png`: your original logo
- Design tokens: `../design-system/davids-coins-and-collectibles/MASTER.md`
