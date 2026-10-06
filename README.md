# Takeoff ↗

**从一扇机窗出发，去看世界。**

A quiet airplane window to 120 cities across six continents. Push up the shade,
pick a destination, or let the world drift past your window. A vintage travel
experience in deep charcoal and warm brass, centered on one cabin window.
Every city has its own individually generated gouache illustration.

[开始起飞 / Open Takeoff](https://takeoff.genedai.me) ·
[插画与资料 / Artwork and sources](https://takeoff.genedai.me/credits) ·
[研究资料 / Research](research/README.md) ·
[发布验收 / Verification](docs/deployment.md)

## Explore

- 120 cities, 75 country/region display labels, and six regions.
- A shade you push up to travel, gentle city transitions, and a 16-minute world tour.
- City name and coordinates above one centered window; city information and actions below.
- Hidden window-seat preferences: 5, 8, or 12 seconds per city, route progress,
  ambient sound, and immersive viewing. Opening preferences preserves playback.
- Chinese and English search, landmark search, region filters, and custom tours.
- Random destinations, immersive mode, keyboard controls, and reduced-motion support.
- A dedicated touch layout with 44px controls, safe-area support, landscape composition,
  and a keyboard-aware city picker.
- 120 distinct, locally hosted city illustrations with saved generation prompts and hashes.
- Optional original procedural ambient sound. Enable it in preferences, then start the tour.

The interface is in Chinese; city names and source records include English.
The views are AI-generated city illustrations. Landmark combinations, light, and viewpoints
are artistic interpretations; coordinates describe the city. Research photographs and their
individual credits remain available in the repository for the original optional film.

## Run locally

Requires Node.js 22 or newer. The website has no runtime dependencies.

```sh
git clone https://github.com/Digidai/takeoff.git
cd takeoff
npm run dev
```

Open `http://127.0.0.1:4173`. Use `PORT=4174 npm run dev` to change the port.

```sh
npm run check
npm run build
```

The build writes a standalone website to `dist/`. Any static host can serve it.
Cloudflare uses `_headers` for the supplied response headers. `no-transform`
preserves original photo bytes and avoids automatic HTML script injection.

## Deploy to Cloudflare

This project uses Workers Static Assets and a Custom Domain. Follow
[Cloudflare's static-site guide](https://developers.cloudflare.com/workers/static-assets/get-started/)
and [Custom Domains documentation](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

For your own deployment, change `account_id`, `name`, and `routes` in
`wrangler.jsonc`, then update the canonical URLs in `public/index.html`,
`public/robots.txt`, and `public/sitemap.xml`.

```sh
npm ci
npx wrangler login
npx wrangler whoami
npm run deploy
```

The GitHub workflow validates data integrity and the static build. Deployment
is an explicit local command; no Cloudflare credentials are stored in this repo.

## Project

| Path | Purpose |
| --- | --- |
| `public/` | The entire website, shared SVG scene, city catalog, and photos |
| `public/ambient.js` | Original deterministic cabin sound synthesis |
| `public/cabin.js` | Sculpted window for the redesigned interactive website |
| `public/scene.js`, `public/scene.css` | Original shared scene for the optional film |
| `public/assets/fonts/` | Locally hosted Newsreader and Manrope, with OFL notices |
| `public/assets/illustrations/` | 120 individually generated city illustrations |
| `public/illustrations.json` | Generator, dimensions, and checksums for every illustration |
| `research/illustrations-20261006/` | Exact generation prompts and original-output receipts |
| `scripts/` | Local server, build, validation, and research tooling |
| `research/` | Dated city research, photo selection, and source metadata |
| `video/` | Optional 120-city film composition and render instructions |
| `THIRD_PARTY_NOTICES.md` | Every photograph's author, source, and license |

Press `←` / `→` to travel, `Space` to play or pause, `/` to search, and `Esc`
to leave immersive mode. The application stores no account or travel history,
sets no cookies, and includes no analytics, external fonts, or remote image requests.

## Add destinations

The dated catalog lives in `research/global-cities-20261006/`. Add a researched
row to `city-seeds.tsv`, select a suitable licensed photograph in
`photo-overrides.json`, and set any presentation adjustments in
`presentation.json`. The fetching tool saves responses in an ignored `raw/`
cache and preserves downloaded image bytes.

```sh
python3 scripts/research-cities.py
npm run catalog
npm run check
```

Generate a separate portrait illustration for each new city with the built-in imagegen tool,
using the recorded prompts as a style reference. Save its output with
`scripts/store-illustration.py` (requires Pillow), then run
`python3 scripts/compile-illustrations.py` to rebuild the illustration manifest before checking.

Retain photo authors, source pages, license links, and hashes when adding or
replacing images. See the research notes for coordinate and framing conventions.

## License

Original code, vector graphics, editorial copy, and sound synthesis use the
[MIT license](LICENSE). Photographs, bundled fonts, and third-party metadata keep their own
licenses, listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the
[credit page](public/credits.html). Preserve those notices when redistributing.

The supplied reference recording, its soundtrack, and early extracted frames
are not included in this public repository or deployment. The public project
uses independently sourced Wikimedia photographs and original procedural sound.
