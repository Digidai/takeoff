"""Find alternatives for missing, locally restricted or non-photographic lead images."""
import json, urllib.request, urllib.parse, hashlib, re, time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
root=Path(__file__).resolve().parents[1]
directory=root/'research/global-cities-20261006';raw=directory/'raw'
seeds={s[0]:s for s in [l.split('|') for l in (directory/'city-seeds.tsv').read_text().splitlines()]}
catalog=json.loads((directory/'catalog.json').read_text())
ids=[c['id'] for c in catalog if c['imageKind']=='city' and c['id'] not in ['taipei','suva','port-moresby']]+['hong-kong','baku']
def search(id):
    s=seeds[id];term=s[6].replace(' (',' ').replace(')','')
    if id=='hong-kong':term='Victoria Harbour skyline'
    if id=='kuala-lumpur':term='Petronas Twin Towers'
    params={'action':'query','format':'json','formatversion':2,'generator':'search','gsrnamespace':6,'gsrlimit':8,'gsrsearch':f'filetype:bitmap "{term}" -logo -flag -map -montage','prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':640,'iiextmetadatafilter':'Artist|Credit|LicenseShortName|LicenseUrl|ImageDescription'}
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
    path=raw/('search-'+id+'.json')
    if path.exists():x=json.loads(path.read_text())
    else:
        for attempt in range(4):
            try:
                with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'TakeoffWorld/2.0 (local visual travel research)'}),timeout=45) as response:x=json.load(response)
                break
            except Exception:
                if attempt==3:raise
                time.sleep(8+attempt*5)
        path.write_text(json.dumps(x,ensure_ascii=False,indent=2))
    candidates=[]
    for p in sorted(x.get('query',{}).get('pages',[]),key=lambda p:p.get('index',999)):
        i=(p.get('imageinfo') or [{}])[0];m=i.get('extmetadata',{});license=m.get('LicenseShortName',{}).get('value','')
        if re.search(r'CC BY(?:-SA)?|CC0|Public domain',license,re.I) and re.search(r'\.(?:jpe?g|png)(?:\?|$)',i.get('url',''),re.I):candidates.append({'file':p['title'].removeprefix('File:').replace(' ','_'),'license':license,'url':i.get('thumburl',i['url']).split('?')[0],'source':i.get('descriptionurl'),'width':i.get('thumbwidth'),'height':i.get('thumbheight')})
    return id,candidates
found={}
with ThreadPoolExecutor(max_workers=1) as pool:
    for f in as_completed([pool.submit(search,id) for id in ids]):
        id,candidates=f.result();found[id]=candidates;print(id,len(candidates),candidates[0]['file'] if candidates else '',flush=True)
(directory/'photo-alternatives.json').write_text(json.dumps(found,ensure_ascii=False,indent=2)+'\n')
print('Candidate list saved. Inspect photographs before manually editing photo-overrides.json; approved choices are never overwritten.')
