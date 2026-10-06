"""Fetch auditable city coordinates and licensed, local Wikimedia photographs.

Run from the project root. Responses and metadata are cached; reruns are safe.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
import json, urllib.request, urllib.parse, time, re, hashlib, math

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / 'research/global-cities-20261006'
RAW = RESEARCH / 'raw'
ASSETS = ROOT / 'public/assets/cities'
RAW.mkdir(exist_ok=True); ASSETS.mkdir(exist_ok=True)
UA = 'TakeoffWorld/2.0 (local visual travel research; Wikimedia attribution retained)'

def fetch(url, binary=False):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=45) as r:
                content = r.read()
                return content if binary else json.loads(content)
        except Exception:
            if attempt == 3: raise
            time.sleep(2 + attempt * 3)

def api(host, params):
    url = f'https://{host}/w/api.php?' + urllib.parse.urlencode({'action':'query','format':'json','formatversion':2,**params})
    key = hashlib.sha256(url.encode()).hexdigest()[:20]
    path = RAW / (key + '.json')
    if path.exists(): return json.loads(path.read_text())
    data = fetch(url)
    if 'error' in data: raise RuntimeError(data['error'])
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    return data

def plain(value):
    return re.sub(r'\s+', ' ', unescape(re.sub('<[^>]+>', '', str(value)))).strip()

fields = ['id','name','zh','country','region','cityArticle','landmarkArticle','landmark','line']
seeds = [dict(zip(fields, l.split('|'))) for l in (RESEARCH/'city-seeds.tsv').read_text().splitlines() if l]
overridePath=RESEARCH/'photo-overrides.json'
overrides=json.loads(overridePath.read_text()) if overridePath.exists() else {}
titles = list(dict.fromkeys(s[k] for s in seeds for k in ['cityArticle','landmarkArticle']))
pages = {}; aliases = {}
for start in range(0,len(titles),35):
    data = api('en.wikipedia.org', {'titles':'|'.join(titles[start:start+35]),'redirects':1,'prop':'pageimages|coordinates|pageterms','piprop':'name|thumbnail','pilicense':'free','pithumbsize':640,'colimit':'max','wbptterms':'description'})
    for p in data.get('query',{}).get('pages',[]): pages[p['title']] = p
    for kind in ['normalized','redirects']:
        for p in data.get('query',{}).get(kind,[]): aliases[p['from']] = p['to']
    print(f'Article research {min(start+35,len(titles))}/{len(titles)}', flush=True)

def page(title):
    for _ in range(8):
        if title not in aliases: break
        title=aliases[title]
    return pages.get(title,{})

filenames=list(dict.fromkeys([p['pageimage'] for p in pages.values() if p.get('pageimage')]+[o['file'] for o in overrides.values()]))
files={}
for start in range(0,len(filenames),30):
    data=api('commons.wikimedia.org', {'titles':'|'.join('File:'+x for x in filenames[start:start+30]),'prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':640,'iiextmetadatafilter':'Artist|Credit|LicenseShortName|LicenseUrl|UsageTerms|AttributionRequired|Copyrighted|ImageDescription|Restrictions','iilimit':1})
    for p in data.get('query',{}).get('pages',[]):
        if p.get('imageinfo'): files[p['title'].removeprefix('File:').replace(' ','_')] = p['imageinfo'][0]
    print(f'Image provenance {min(start+30,len(filenames))}/{len(filenames)}', flush=True)

def viable(info):
    if not info: return False
    meta=info.get('extmetadata',{})
    license=plain(meta.get('LicenseShortName',{}).get('value',''))
    photographic=not re.search(r'(?:logo|flag|\bmap\b|map_|collage|montage)',plain(meta.get('ObjectName',{}).get('value',info.get('url',''))),re.I)
    return photographic and bool(re.search(r'CC BY(?:-SA)?|CC0|Public domain',license,re.I)) and not re.search(r'NC|ND',license) and bool(re.search(r'\.(?:jpe?g|png|webp)(?:\?|$)',info.get('url',''),re.I))

def distance(a,b):
    r1,r2=math.radians(a['lat']),math.radians(b['lat'])
    d1,d2=math.radians(b['lat']-a['lat']),math.radians(b['lon']-a['lon'])
    return 6371*2*math.asin(min(1,math.sqrt(math.sin(d1/2)**2+math.cos(r1)*math.cos(r2)*math.sin(d2/2)**2)))

catalog=[]; issues=[]
for s in seeds:
    city=page(s['cityArticle']); landmark=page(s['landmarkArticle'])
    coords=(city.get('coordinates') or [{}])[0]
    coordinateSource='https://en.wikipedia.org/wiki/'+urllib.parse.quote(city.get('title',s['cityArticle']).replace(' ','_'))
    if 'lat' not in coords:
        props=api('en.wikipedia.org',{'titles':s['cityArticle'],'prop':'pageprops'})
        item=props['query']['pages'][0].get('pageprops',{}).get('wikibase_item')
        if item:
            entity=api('www.wikidata.org',{'action':'wbgetentities','ids':item,'props':'claims'})['entities'][item]
            claims=entity.get('claims',{}).get('P625',[])
            if claims:
                value=claims[0]['mainsnak']['datavalue']['value'];coords={'lat':value['latitude'],'lon':value['longitude']};coordinateSource='https://www.wikidata.org/wiki/'+item
    if 'lat' not in coords: issues.append({'id':s['id'],'issue':'missing city coordinates'}); continue
    candidates=[('landmark',landmark),('city',city)]
    if s['id'] in overrides:candidates.insert(0,('landmark',{'title':s['landmarkArticle'],'pageimage':overrides[s['id']]['file']}))
    chosen=next(((kind,p,files.get(p.get('pageimage'))) for kind,p in candidates if viable(files.get(p.get('pageimage')))),None)
    if not chosen: issues.append({'id':s['id'],'issue':'no approved photographic asset','cityImage':city.get('pageimage'),'landmarkImage':landmark.get('pageimage')}); continue
    kind,p,info=chosen
    meta=info['extmetadata']; author=plain(meta.get('Artist',{}).get('value',''))
    credit=plain(meta.get('Credit',{}).get('value',''))
    license=plain(meta.get('LicenseShortName',{}).get('value',''))
    if not author: author=credit or 'See original file description'
    thumb=info.get('thumburl',info['url']).split('?')[0]
    suffix='.png' if '.png' in info['url'].lower() else '.webp' if '.webp' in info['url'].lower() else '.jpg'
    c={**s,'lat':round(coords['lat'],6),'lon':round(coords['lon'],6),'image':'cities/'+s['id']+suffix,'imageKind':kind,'photoArticle':p['title'],'photoFile':p['pageimage'],'photoUrl':thumb,'photoSource':info['descriptionurl'],'artist':author,'credit':credit,'license':license,'licenseUrl':meta.get('LicenseUrl',{}).get('value','') or 'https://commons.wikimedia.org/wiki/Commons:Public_domain','photoDescription':plain(meta.get('ImageDescription',{}).get('value','')),'photoWidth':info.get('thumbwidth',info['width']),'photoHeight':info.get('thumbheight',info['height']),'sourceWidth':info['width'],'sourceHeight':info['height'],'citySource':'https://en.wikipedia.org/wiki/'+urllib.parse.quote(city['title'].replace(' ','_')),'landmarkSource':'https://en.wikipedia.org/wiki/'+urllib.parse.quote(landmark.get('title',s['landmarkArticle']).replace(' ','_')),'coordinateSource':coordinateSource,'coordinateMeaning':'City reference coordinate, not camera location','researchDate':'2026-10-06'}
    if landmark.get('coordinates'):
        c['landmarkDistanceKm']=round(distance(coords,landmark['coordinates'][0]),1)
        if c['landmarkDistanceKm']>45: issues.append({'id':s['id'],'issue':'landmark far from city coordinate','distanceKm':c['landmarkDistanceKm']})
    catalog.append(c)

def download(c):
    dest=ROOT/'public/assets'/c['image']
    receipt=RAW/(c['id']+'-download-url.txt')
    if not dest.exists() or not receipt.exists() or receipt.read_text()!=c['photoUrl']:
        payload=fetch(c['photoUrl'],binary=True)
        if payload[:2] not in [b'\xff\xd8',b'\x89P'] and not payload.startswith(b'RIFF'): raise RuntimeError('Unexpected media for '+c['id'])
        dest.write_bytes(payload)
        receipt.write_text(c['photoUrl'])
    c['bytes']=dest.stat().st_size
    c['sha256']=hashlib.sha256(dest.read_bytes()).hexdigest()
    return c['id']

with ThreadPoolExecutor(max_workers=4) as pool:
    pending={pool.submit(download,c):c for c in catalog}
    for n,f in enumerate(as_completed(pending),1):
        try: f.result()
        except Exception as e: issues.append({'id':pending[f]['id'],'issue':'download failed','error':str(e)})
        if n%12==0 or n==len(catalog):print(f'Local photos {n}/{len(catalog)}',flush=True)
(RESEARCH/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
(RESEARCH/'issues.json').write_text(json.dumps(issues,ensure_ascii=False,indent=2)+'\n')
print('Done:',len(catalog),'cities,',len(issues),'review issues',flush=True)
for issue in issues:print(json.dumps(issue,ensure_ascii=False),flush=True)
