"""Persist built-in imagegen output and encode WebP without changing its composition."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--id', required=True)
parser.add_argument('--source', required=True, type=Path)
args = parser.parse_args()
prompts = json.loads((ROOT / 'research/illustrations-20261006/prompts.json').read_text())
prompt = next(city['prompt'] for city in prompts['cities'] if city['id'] == args.id)
original = ROOT / 'output/imagegen/originals' / (args.id + '.png')
target = ROOT / 'public/assets/illustrations' / (args.id + '.webp')
receipt = ROOT / 'research/illustrations-20261006/receipts' / (args.id + '.json')
for path in (original, target, receipt):
    path.parent.mkdir(parents=True, exist_ok=True)
shutil.copy2(args.source, original)
with Image.open(original) as artwork:
    artwork.load()
    width, height = artwork.size
    # File-format compression only: no cropping, resizing, repainting, or retouching.
    artwork.save(target, format='WEBP', quality=90, method=6)
record = {
    'id': args.id, 'image': 'illustrations/' + target.name,
    'generator': 'OpenAI built-in imagegen', 'generationId': args.source.stem,
    'promptSha256': hashlib.sha256(prompt.encode()).hexdigest(),
    'originalSha256': hashlib.sha256(original.read_bytes()).hexdigest(),
    'originalBytes': original.stat().st_size, 'width': width, 'height': height,
    'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size,
    'encoding': 'WebP quality 90; original dimensions and composition preserved'
}
receipt.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'id':args.id, 'bytes':record['bytes'], 'width':width, 'height':height}))
