"""Compile the researched catalog into an offline website and credit register."""
from pathlib import Path
from html import escape
from collections import Counter
import json

ROOT=Path(__file__).resolve().parents[1]
R=ROOT/'research/global-cities-20261006'
catalog=json.loads((R/'catalog.json').read_text())
presentation=json.loads((R/'presentation.json').read_text())
regions={'asia':'亚洲','europe':'欧洲','africa':'非洲','north-america':'北美洲','south-america':'南美洲','oceania':'大洋洲'}
tones={'asia':('#c9834c','#98603c'),'europe':('#b78575','#976455'),'africa':('#c69358','#977243'),'north-america':('#7c9aa9','#546d7b'),'south-america':('#bd8957','#966742'),'oceania':('#739b9c','#596b6b')}

def coord(v,positive,negative):
    return f"{positive if v>=0 else negative}  {abs(v):.4f}°"

for c in catalog:
    c.update(presentation.get(c['id'],{}))
    if c['licenseUrl'].startswith('http://creativecommons.org/'):
        c['licenseUrl']=c['licenseUrl'].replace('http://','https://',1)
    c['artistRaw']=c['artist']
    c['artist']=c.get('creditName',c['artist'])
    c['coordinates']=coord(c['lat'],'N','S')+'    '+coord(c['lon'],'E','W')
    c['tone'],c['rim']=tones[c['region']]
    c.setdefault('align','xMidYMid slice')
    c['regionName']=regions[c['region']]
    c['photoTreatment']='Original downloaded pixels unchanged; proportional crop in the window'
assert catalog and len({c['id'] for c in catalog})==len(catalog)
assert all((ROOT/'public/assets'/c['image']).is_file() for c in catalog)
(ROOT/'public/cities.js').write_text('// Generated from the dated research catalog. Run scripts/compile-cities.py to rebuild.\nwindow.TakeoffCities = '+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n')
(R/'site-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')

def a(url,label):
    extra='' if url.startswith('#') else ' target="_blank" rel="noopener"'
    return '<a href="'+escape(url,quote=True)+'"'+extra+'>'+escape(label)+'</a>'

cards=[]
for c in catalog:
    official=' · '+a(c['officialSource'],'官方资料') if c.get('officialSource') else ''
    cards.append(f'''<article id="{c['id']}" data-region="{c['region']}">
<img src="assets/illustrations/{c['id']}.webp" loading="lazy" alt="{escape(c['zh'])}城市插画">
<div><h2>{escape(c['zh'])} <span>{escape(c['name'])}</span></h2><p>{escape(c['country'])} · {regions[c['region']]} · {escape(c['landmark'])}</p>
<p class="artist">城市插画：OpenAI imagegen 生成 · 地标与视角为艺术化表现</p><p>{a('https://github.com/Digidai/takeoff/tree/main/research/illustrations-20261006','生成提示词与文件校验记录')}</p>
<p>{a(c['citySource'],'城市资料')} · {a(c['landmarkSource'],'地标资料')} · {a(c['coordinateSource'],'坐标来源')}{official}</p>
<p class="note">{escape(c['coordinates'])}；城市参考位置。机窗按比例裁切展示城市插画。</p>
<details><summary>研究用照片与原版影片的素材署名</summary><p>作者：{escape(c['artist'])}</p><p>{a(c['photoSource'],c['photoFile'])} · {a(c['licenseUrl'],c['license'])}</p><p>原照片保留在开源仓库，遵循独立许可。</p></details></div></article>''')
counts=Counter(c['region'] for c in catalog)
html='''<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#0c1013"><title>城市插画与研究资料 · Takeoff</title><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="credits.css"></head><body><main><header><a class="back-link" href="index.html">← 返回机窗</a><p class="eyebrow">TAKEOFF / CITY ILLUSTRATIONS</p><h1>一座城市，<br>一幅旅行插画。</h1><p>CATALOG_SUMMARY每座城市分别由 OpenAI imagegen 生成一张插画，以城市与地标资料为依据。地标组合、光线与视角为艺术化表现。完整提示词、原始输出校验值与网站文件校验值保存在公开仓库。</p><p>坐标是城市参考位置。网页使用城市插画；研究用原始照片和原版影片素材保留独立作者与许可，署名可在各城市记录中展开查阅。环境音、矢量机窗与程序纹理为本项目原创。本站不包含参考视频的音轨或截取画面。</p><p>本地托管的 Newsreader 与 Manrope 字体遵循 <a href="assets/fonts/OFL-Newsreader.txt">Newsreader OFL</a> 与 <a href="assets/fonts/OFL-Manrope.txt">Manrope OFL</a> 许可。</p><nav>'''
for region,title in regions.items():
    first=next(c for c in catalog if c['region']==region)
    html+=a('#'+first['id'],title+' '+str(counts[region]))
html+='</nav></header>'+''.join(cards)+'''<footer>城市与地标资料来源：Wikipedia、Wikidata；少量代表地标额外核对官方机构资料。城市插画由 OpenAI imagegen 逐城生成。研究用照片来源于 Wikimedia Commons，保留独立作者与许可。<br><a href="https://github.com/Digidai/takeoff/tree/main/research/illustrations-20261006">插画生成记录</a> · <a href="index.html">继续起飞 ↗</a></footer></main></body></html>'''
html=html.replace('CATALOG_SUMMARY',f"{len(catalog)} 座城市 · {len({c['country'] for c in catalog})} 个国家／地区标签 · {len(counts)} 大洲。")
(ROOT/'public/credits.html').write_text(html)

def cell(value):
    return str(value).replace('|','\\|').replace('\n',' ')

notice=['# Third-party assets and metadata','', 'Original project code and synthesis are MIT licensed. The photographs below retain their individual licenses and are excluded from that grant. Downloaded pixels are unchanged; the interface and film use proportional display crops. Any rights in the photo presentation remain subject to the photo license, including applicable share-alike terms.', '', 'Keep the author, source, and license notices when redistributing these files. Commons file pages provide the original descriptions and full attribution. Wikimedia-derived metadata retains its source terms; the MIT grant does not relicense third-party metadata.', '', 'Research date: 2026-10-06. City coordinates identify the city, not the camera or airport.', '', '| File / city | Author | License | Source |', '| --- | --- | --- | --- |']
for c in catalog:
    notice.append(f"| `public/assets/{cell(c['image'])}` / {cell(c['name'])} | {cell(c['artist'])} | [{cell(c['license'])}]({c['licenseUrl']}) | [Commons file]({c['photoSource']}) |")
notice.extend(['', 'City, landmark, and coordinate source links are in `public/cities.js`, the dated research catalog, and `public/credits.html`. The supplied reference recording and its soundtrack are not distributed.'])
notice.extend(['', '## Generated city illustrations', '', 'The interactive website uses 120 separate city illustrations generated with the OpenAI built-in imagegen tool. The generated illustration files are distributed with the project under LICENSE. They do not inherit the licenses of the separately retained research photographs. Generation prompts and asset receipts are in `research/illustrations-20261006/`; web asset checksums are in `public/illustrations.json`. Architectural combinations, lighting, and viewpoints are artistic interpretations.'])
notice.extend(['', '## Bundled fonts', '', 'Newsreader and Manrope are distributed under the SIL Open Font License 1.1, outside the MIT grant. Fonts are locally hosted. Only lossless TTF-to-WOFF2 container compression was performed; no glyph changes or subsetting.', ''])
for font in json.loads((ROOT/'public/assets/fonts/sources.json').read_text()):
    notice.append(f"- **{font['family']}**: [upstream font]({font['source']}), [upstream license]({font['license_source']}); bundled license: `public/assets/fonts/OFL-{font['family']}.txt`.")
(ROOT/'THIRD_PARTY_NOTICES.md').write_text('\n'.join(notice)+'\n')
print('Compiled',len(catalog),'cities and complete credits;',sum(c['bytes'] for c in catalog),'photo bytes.')
