async (page) => {
  const base = new URL(page.url()).origin;
  await page.goto(base+'/');
  const cities = await page.evaluate(()=>TakeoffDestinations.map(city=>({id:city.id,name:city.zh,landmark:city.landmark,image:city.image})));
  const context = await page.context().browser().newContext({viewport:{width:840,height:1000},deviceScaleFactor:1});
  const gallery = await context.newPage();
  const result = {groups:[],artworks:0};
  try {
    await gallery.goto(base+'/credits.html');
    for(let start=0;start<cities.length;start+=12) {
      const group=cities.slice(start,start+12);
      await gallery.setContent(`<html lang="zh-CN"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#0c1013;color:#e6e0d2;font:12px sans-serif;padding:16px}h1{font-size:14px;font-weight:400;margin:0 0 14px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}figure{margin:0;min-width:0}img{display:block;width:100%;height:270px;object-fit:contain;background:#171d20}figcaption{height:32px;line-height:16px;margin-top:5px}small{color:#a7a79b;font-size:10px}</style></head><body><h1>Takeoff · 城市插画 ${start+1}–${start+group.length}</h1><main>${group.map(city=>`<figure><img src="${base}/assets/${city.image}" alt="${city.name}"><figcaption>${city.name}<br><small>${city.landmark}</small></figcaption></figure>`).join('')}</main></body></html>`);
      await gallery.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
      const path='output/playwright/artwork-review-'+String(start/12+1).padStart(2,'0')+'.png';
      await gallery.screenshot({path});
      result.groups.push({path,cities:group.map(city=>city.id)});result.artworks+=group.length;
    }
    return result;
  } finally { await context.close(); }
}
