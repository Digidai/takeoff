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
<img src="assets/{escape(c['image'])}" loading="lazy" alt="{escape(c['zh'])}的照片">
<div><h2>{escape(c['zh'])} <span>{escape(c['name'])}</span></h2><p>{escape(c['country'])} · {regions[c['region']]} · {escape(c['landmark'])}</p>
<p class="artist">作者：{escape(c['artist'])}</p><p>{a(c['photoSource'],c['photoFile'])} · {a(c['licenseUrl'],c['license'])}</p>
<p>{a(c['citySource'],'城市资料')} · {a(c['landmarkSource'],'地标资料')} · {a(c['coordinateSource'],'坐标来源')}{official}</p>
<p class="note">{escape(c['coordinates'])}；城市参考位置。原照片未改写，页面与视频以等比裁切展示。</p></div></article>''')
counts=Counter(c['region'] for c in catalog)
html='''<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>城市资料与照片署名 · Takeoff</title><link rel="icon" href="favicon.svg"><style>
*{box-sizing:border-box}body{margin:0;background:#0b0a08;color:#ccbaa0;font:13px/1.8 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}main{max-width:1040px;margin:auto;padding:48px 24px}a{color:#d3ad79;text-underline-offset:4px;overflow-wrap:anywhere}h1{font-size:30px;font-weight:400;color:#efddc1;line-height:1.3}header{margin-bottom:32px}header>p{max-width:750px;color:#aa9273}nav{display:flex;flex-wrap:wrap;gap:12px}nav a{padding:5px 12px;border:1px solid #54412d;border-radius:20px;text-decoration:none;font-size:11px}article{display:flex;gap:24px;padding:26px 0;border-top:1px solid #382c1e;scroll-margin-top:24px}article img{width:132px;height:145px;object-fit:cover;border-radius:8px;flex-shrink:0}article>div{min-width:0}h2{font-size:17px;font-weight:400;margin:0;color:#e3caaa}h2 span{font-family:Georgia,serif;color:#b39a78;margin-left:12px}article p{margin:5px 0}.artist{overflow-wrap:anywhere}.note{color:#8d785d;font-size:10px}footer{border-top:1px solid #382c1e;padding-top:24px;color:#9b8567}@media(max-width:600px){main{padding:30px 18px}article{gap:14px}article img{width:80px;height:100px}h2 span{display:block;margin:3px 0}article p{font-size:11px}h1{font-size:25px}}:focus-visible{outline:2px solid #efca90;outline-offset:4px}
</style></head><body><main><header><a href="index.html">← 返回机窗</a><h1>每一扇窗外，都有真实的来处。</h1><p>CATALOG_SUMMARY资料采集日期：2026 年 10 月 6 日。照片拍摄时间不等于采集日期，也不表示城市当前的实时景象。各文件分别遵循下列许可证，完整署名与原始说明可通过文件链接查看。</p><p>坐标是城市参考位置，不是照片拍摄点或机场位置。旅行短句为本项目原创；照片作者署名来自 Wikimedia Commons。环境音、矢量机窗与程序纹理为本项目原创，使用 MIT 许可。本站不包含参考视频的音轨或截取画面。</p><nav>'''
for region,title in regions.items():
    first=next(c for c in catalog if c['region']==region)
    html+=a('#'+first['id'],title+' '+str(counts[region]))
html+='</nav></header>'+''.join(cards)+'''<footer>资料与照片来源：Wikimedia Commons、Wikipedia、Wikidata；少量代表地标额外核对官方机构资料。照片保留独立作者与许可，不以本站名称替代署名。<br><a href="https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia">Commons 素材使用说明</a> · <a href="index.html">继续起飞 ↗</a></footer></main></body></html>'''
html=html.replace('CATALOG_SUMMARY',f"{len(catalog)} 座城市 · {len({c['country'] for c in catalog})} 个国家／地区标签 · {len(counts)} 大洲。")
(ROOT/'public/credits.html').write_text(html)

def cell(value):
    return str(value).replace('|','\\|').replace('\n',' ')

notice=['# Third-party photographs and metadata','', 'Original project code and synthesis are MIT licensed. The photographs below retain their individual licenses and are excluded from that grant. Downloaded pixels are unchanged; the interface and film use proportional display crops. Any rights in the photo presentation remain subject to the photo license, including applicable share-alike terms.', '', 'Keep the author, source, and license notices when redistributing these files. Commons file pages provide the original descriptions and full attribution. Wikimedia-derived metadata retains its source terms; the MIT grant does not relicense third-party metadata.', '', 'Research date: 2026-10-06. City coordinates identify the city, not the camera or airport.', '', '| File / city | Author | License | Source |', '| --- | --- | --- | --- |']
for c in catalog:
    notice.append(f"| `public/assets/{cell(c['image'])}` / {cell(c['name'])} | {cell(c['artist'])} | [{cell(c['license'])}]({c['licenseUrl']}) | [Commons file]({c['photoSource']}) |")
notice.extend(['', 'City, landmark, and coordinate source links are in `public/cities.js`, the dated research catalog, and `public/credits.html`. The supplied reference recording and its soundtrack are not distributed.'])
(ROOT/'THIRD_PARTY_NOTICES.md').write_text('\n'.join(notice)+'\n')
print('Compiled',len(catalog),'cities and complete credits;',sum(c['bytes'] for c in catalog),'photo bytes.')
