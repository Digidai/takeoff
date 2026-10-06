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
assert(!index.includes('original-audio') && !index.includes('<audio'), 'Reference soundtrack must not be published');
for (const file of ['index.html', 'style.css', 'scene.css', 'scene.js', 'app.js']) {
  assert(!/source-grain|aperture\.png|original-audio/.test(await read('public/' + file)), 'Reference-derived media in ' + file);
}
for (const file of ['public/app.js', 'public/scene.js', 'public/ambient.js', 'scripts/build.mjs', 'scripts/serve.mjs']) {
  const result = spawnSync(process.execPath, ['--check', new URL(file, root).pathname], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
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
console.log(`Validated ${cities.length} cities, ${bytes} photo bytes, complete credits, script syntax, and original ambient synthesis (RMS ${rms.toFixed(4)}).`);
