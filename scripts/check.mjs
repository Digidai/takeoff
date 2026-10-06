import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const context = { window: {} };
vm.runInNewContext(await read('public/cities.js'), context);
const cities = JSON.parse(JSON.stringify(context.window.TakeoffCities));
const catalog = JSON.parse(await read('research/global-cities-20261006/site-catalog.json'));
const seeds = (await read('research/global-cities-20261006/city-seeds.tsv')).trim().split('\n');
assert.deepEqual(cities, catalog, 'Generated browser catalog must match research records');
assert.equal(cities.length, seeds.length, 'Every researched seed must be published');
assert.equal(new Set(cities.map(c => c.id)).size, cities.length, 'Duplicate destination IDs');
assert.equal(new Set(cities.map(c => c.region)).size, 6, 'Six regions are required');
const credits = await read('public/credits.html');
const notices = await read('THIRD_PARTY_NOTICES.md');
let bytes = 0;
for (const city of cities) {
  assert.match(city.image, /^cities\/[a-z0-9-]+\.(jpg|png|webp)$/);
  assert(city.artist && city.license && city.photoSource && city.citySource && city.landmarkSource);
  assert.match(city.license, /^(?:CC BY(?:-SA)? [234]\.\d(?: [a-z]+)?|CC0|Public domain)$/);
  assert(Number.isFinite(city.lat) && Math.abs(city.lat) <= 90);
  assert(Number.isFinite(city.lon) && Math.abs(city.lon) <= 180);
  for (const key of ['photoSource', 'licenseUrl', 'citySource', 'landmarkSource']) {
    assert.equal(new URL(city[key]).protocol, 'https:');
  }
  const image = await readFile(new URL('public/assets/' + city.image, root));
  assert.equal(image.length, city.bytes, `${city.id}: image size differs from research`);
  assert.equal(createHash('sha256').update(image).digest('hex'), city.sha256, `${city.id}: image hash mismatch`);
  assert(credits.includes(`id="${city.id}"`) && credits.includes(city.photoSource), `${city.id}: missing credits`);
  assert(notices.includes('public/assets/' + city.image) && notices.includes(city.photoSource), `${city.id}: missing license notice`);
  bytes += image.length;
}
assert.equal((await readdir(new URL('public/assets/cities/', root))).length, cities.length);
const index = await read('public/index.html');
const illustrations = JSON.parse(await read('public/illustrations.json'));
vm.runInNewContext(await read('public/illustrations.js'),context);
assert.deepEqual(JSON.parse(JSON.stringify(context.window.TakeoffIllustrations)),Object.fromEntries(illustrations.cities.map(art => [art.id,art])));
const prompts = JSON.parse(await read('research/illustrations-20261006/prompts.json')).cities;
assert.equal(illustrations.count, cities.length);
assert.equal(illustrations.cities.length, cities.length);
assert.equal(prompts.length, cities.length);
assert.equal(new Set(illustrations.cities.map(art => art.sha256)).size, cities.length, 'Every city must have a distinct illustration');
let artworkBytes = 0;
for (const city of cities) {
  const art = illustrations.cities.find(art => art.id === city.id);
  assert(art && art.generator === 'OpenAI built-in imagegen', `${city.id}: missing generated artwork`);
  assert.equal(art.image, `illustrations/${city.id}.webp`);
  const image = await readFile(new URL('public/assets/' + art.image, root));
  assert.equal(image.subarray(0,4).toString(), 'RIFF');
  assert.equal(image.subarray(8,12).toString(), 'WEBP');
  assert(art.width >= 768 && art.height > art.width, `${city.id}: artwork must be portrait`);
  assert.equal(image.length, art.bytes);
  assert.equal(createHash('sha256').update(image).digest('hex'), art.sha256);
  const prompt = prompts.find(prompt => prompt.id === city.id);
  assert.equal(createHash('sha256').update(prompt.prompt).digest('hex'), art.promptSha256);
  assert(credits.includes(`assets/${art.image}`), `${city.id}: missing illustration credit record`);
  artworkBytes += image.length;
}
assert.equal((await readdir(new URL('public/assets/illustrations/', root))).length, cities.length);
assert(!index.includes('original-audio') && !index.includes('<audio'), 'Reference soundtrack must not be published');
for (const file of ['index.html', 'style.css', 'scene.css', 'scene.js', 'app.js']) {
  assert(!/source-grain|aperture\.png|original-audio/.test(await read('public/' + file)), 'Reference-derived media in ' + file);
}
for (const file of ['public/app.js', 'public/illustrations.js', 'public/cabin.js', 'public/scene.js', 'public/ambient.js', 'scripts/build.mjs', 'scripts/serve.mjs']) {
  const result = spawnSync(process.execPath, ['--check', new URL(file, root).pathname], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
}
for (const font of JSON.parse(await read('public/assets/fonts/sources.json'))) {
  const file = await readFile(new URL('public/assets/fonts/' + font.file, root));
  assert.equal(file.subarray(0,4).toString(), 'wOF2');
  assert.equal(file.length, font.bytes);
  assert.equal(createHash('sha256').update(file).digest('hex'), font.sha256);
  assert((await read('public/assets/fonts/OFL-' + font.family + '.txt')).includes('SIL OPEN FONT LICENSE'));
  assert(notices.includes(font.license_source), 'Missing bundled font license notice');
}
await import('../public/ambient.js');
const pcm = globalThis.TakeoffAmbient.createSamples();
let energy = 0, peak = 0;
for (const sample of pcm) {
  assert(Number.isFinite(sample)); energy += sample * sample; peak = Math.max(peak, Math.abs(sample));
}
const rms = Math.sqrt(energy / pcm.length);
assert(rms > 0.005 && rms < 0.1 && peak < 0.3, 'Ambient sound must be audible and below clipping');
assert(Math.abs(pcm[0] - pcm.at(-1)) < 0.005, 'Ambient loop has a discontinuous boundary');
console.log(`Validated ${cities.length} cities and distinct illustrations (${artworkBytes} bytes), ${bytes} retained research photo bytes, complete credits, script syntax, and original ambient synthesis (RMS ${rms.toFixed(4)}).`);
