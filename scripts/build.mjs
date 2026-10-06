import { cp, rm, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const dist = new URL('../dist/', import.meta.url);
await rm(dist, {recursive:true,force:true});
await cp(new URL('../public/', import.meta.url), dist, {recursive:true});
const git = spawnSync('git', ['rev-parse', 'HEAD'], {cwd:fileURLToPath(new URL('../', import.meta.url)),encoding:'utf8'});
const commit = git.status === 0 ? git.stdout.trim() : null;
const catalog = await readFile(new URL('../research/global-cities-20261006/site-catalog.json', import.meta.url));
await writeFile(new URL('version.json', dist), JSON.stringify({
  name:'takeoff', version:'1.0.0', commit,
  cities:JSON.parse(catalog).length,
  catalog_sha256:createHash('sha256').update(catalog).digest('hex')
},null,2)+'\n');
console.log('Static website built in dist/');
