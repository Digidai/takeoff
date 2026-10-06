"""Compile the completed set of individually generated city illustrations."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
research = ROOT / 'research/illustrations-20261006'
prompts = json.loads((research / 'prompts.json').read_text())['cities']
records = []
for city in prompts:
    record = json.loads((research / 'receipts' / (city['id'] + '.json')).read_text())
    data = (ROOT / 'public/assets' / record['image']).read_bytes()
    assert record['id'] == city['id']
    assert record['sha256'] == hashlib.sha256(data).hexdigest()
    assert record['promptSha256'] == hashlib.sha256(city['prompt'].encode()).hexdigest()
    assert record['bytes'] == len(data)
    records.append(record)
assert len(records) == len(prompts) and len({r['sha256'] for r in records}) == len(records)
manifest = {'generator':'OpenAI built-in imagegen', 'count':len(records), 'cities':records}
(ROOT / 'public/illustrations.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT / 'public/illustrations.js').write_text('// Generated illustration metadata; rebuild with scripts/compile-illustrations.py.\nwindow.TakeoffIllustrations = '+json.dumps({record['id']:record for record in records},ensure_ascii=False,separators=(',',':'))+';\n')
print('Compiled',len(records),'distinct city illustrations;',sum(r['bytes'] for r in records),'WebP bytes.')
