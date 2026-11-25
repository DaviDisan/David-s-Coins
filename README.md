# David's Coins & Collectibles — website

Static site deployed on Vercel from this GitHub repo. Every push to `main` goes live automatically.

## Pages
`index.html` (home), `inventory.html`, `sell.html`, `appraisals.html`, `prices.html`, `supplies.html`, `about.html`, `contact.html`.
Each page carries its own copy of the header, footer and inquiry dialog, so a change to those needs making in every page.
`vercel.json` turns on clean URLs, so `/inventory` serves `inventory.html`.

## Business details and inquiry email
Edit the `BUSINESS` block at the top of `assets/js/main.js`:
- `email` is shown on the site and is where every inquiry form is delivered.
- `phone` is hidden everywhere while it's empty; fill it in to show it.

Forms are emailed through FormSubmit (formsubmit.co). The first submission from the live site sends an
"Activate Form" email to that address; click its link once and every later inquiry arrives as a normal email
(reply goes straight to the customer).

## Change inventory
In `inventory.html`, each `<article class="coin-card">` is one item:
- `data-cat`: `eagles`, `dollars`, `certified`, `bullion` or `sets` (controls the filter buttons)
- `data-front` / `data-back`: photo names in `assets/img/photos/` (without `.jpg`)
- optional `data-wide` for landscape photos, `data-labels="Label 1,Label 2"` for the viewer's toggle names
- After replacing photos, bump `PHOTO_VERSION` in `main.js` so browsers don't show the old cached ones.

The home page shows four featured coins; edit those cards in `index.html`.

## Live prices
Spot prices come from the free gold-api.com feed and refresh every 60 seconds. If the feed is down, the page shows "Price on request".
