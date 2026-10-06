# Takeoff film source

The optional HyperFrames composition visits all 120 cities in an interleaved
six-region route. It runs for **504 seconds** at **1054 × 720**, with 4.2 seconds
per city, a cursor-free window animation, photo attribution on every scene,
and original synthesized ambient audio.

Requires Node.js 22+, Chrome, and FFmpeg. The website itself needs none of the
video dependencies.

```sh
cd video
npm ci
npm run check
npm run preview
npm run render
```

`sync.mjs` copies the website's shared scene, catalog, original photo files,
and full credit page into ignored build folders. It also generates the WAV
soundtrack from `public/ambient.js`. No external audio service or soundtrack
download is used.

The composition pins HyperFrames 0.8.135 and GSAP 3.14.2. These tools retain
their upstream licenses; their code is installed from npm and is not included
under this project's MIT grant. Check the project after changing a tool pin.

Photo authors and individual license names appear in the film, with a
reference to `credits.html#CITY_ID`. When distributing a rendered film,
include the generated `credits.html` and `THIRD_PARTY_NOTICES.md`, or provide
an accessible equivalent with every photo's source and license links. The
film's photographs retain their own terms, including applicable share-alike
conditions; the MIT grant applies to original project work.

The rendered MP4 is written to `deliverables/takeoff-global.mp4`, which is
ignored by Git. The source reference recording and its soundtrack are not used.
