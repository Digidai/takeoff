async (page) => {
  const base=new URL(page.url()).origin;
  const result={errors:[],checks:[],viewports:[]};
  page.on('pageerror',e=>result.errors.push(e.message));
  const assert=(value,description)=>{if(!value)throw new Error(description);result.checks.push(description);};
  const state=()=>page.evaluate(()=>window.takeoff.getState());
  await page.goto(base+'/');
  await page.setViewportSize({width:1440,height:900});
  const data=await page.evaluate(async()=>{
    const cities=window.TakeoffCities;
    const loaded=await Promise.all(cities.map(c=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({id:c.id,width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>resolve({id:c.id,error:true});image.src='assets/'+c.image;})));
    return {count:cities.length,ids:new Set(cities.map(c=>c.id)).size,regions:new Set(cities.map(c=>c.region)).size,countries:new Set(cities.map(c=>c.country)).size,loaded,metadataComplete:cities.every(c=>Number.isFinite(c.lat)&&Number.isFinite(c.lon)&&c.artist&&c.license&&c.licenseUrl&&c.photoSource&&c.citySource&&c.landmarkSource)};
  });
  assert(data.count===120&&data.ids===120&&data.regions===6,'120 unique cities covering six regions');
  assert(data.metadataComplete,'Every city has coordinates, source links, photo author and license');
  assert(data.loaded.every(c=>!c.error&&c.width>0&&c.height>0),'All 120 photos decode in Chromium');
  result.catalog=data;
  const originalRoute=(await state()).route;
  assert(originalRoute.length===120&&new Set(originalRoute).size===120,'Global route visits every city exactly once');
  assert((await page.evaluate(route=>new Set(route.slice(0,6).map(i=>TakeoffCities[i].region)).size,originalRoute))===6,'First six global stops cover all six regions');
  const open=()=>page.getByRole('button',{name:'探索世界'}).click();
  await open();
  assert(await page.getByRole('button',{name:/^前往/}).count()===120,'Atlas contains all 120 destinations');
  const search=page.getByRole('searchbox',{name:'搜索目的地'});
  for(const [query,name] of [['京都','京都'],['sao paulo','圣保罗'],['金阁寺','京都'],['不丹','廷布']]){
    await search.fill(query);assert(await page.getByRole('button',{name:'前往'+name,exact:true}).count()===1,'Search finds '+query);
  }
  await search.fill('a-city-that-is-not-in-the-catalog');
  assert(await page.getByRole('button',{name:/^前往/}).count()===0&&await page.locator('#no-results').isVisible(),'Empty search shows a readable empty state');
  await search.fill('');
  for(const [region,count] of [['亚洲',36],['欧洲',30],['非洲',16],['北美洲',16],['南美洲',14],['大洋洲',8]]){
    await page.getByRole('button',{name:region+count,exact:true}).click();assert(await page.getByRole('button',{name:/^前往/}).count()===count,'Filter '+region+' returns '+count+' cities');
  }
  await page.getByRole('button',{name:'前往惠灵顿',exact:true}).click();
  await page.waitForTimeout(1750);
  assert((await state()).cityId==='wellington'&&(await state()).route.length===8,'Selecting a city uses the selected region route');
  await page.getByRole('button',{name:'下一站',exact:true}).click();await page.waitForTimeout(1700);
  assert((await state()).cityId==='suva','Next follows the eight-city Oceania route');
  await page.getByRole('button',{name:'下一站',exact:true}).click();await page.waitForTimeout(1700);
  await page.getByRole('button',{name:'下一站',exact:true}).click();await page.waitForTimeout(1700);
  assert((await state()).cityId==='sydney','Region route wraps to its first city');
  await page.getByRole('button',{name:'自动漫游'}).click();await page.waitForTimeout(1100);
  assert((await state()).playing,'Automatic tour starts');
  await page.getByRole('button',{name:'暂停漫游'}).click();const paused=(await state()).elapsed;await page.waitForTimeout(300);
  assert(!(await state()).playing&&Math.abs((await state()).elapsed-paused)<.01,'Pause freezes the tour');
  const box=await page.getByRole('button',{name:'拖动遮光板，或点按前往下一座城市'}).boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height*.7);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+box.height*.7-250,{steps:12});
  assert((await state()).openness<.32,'Pointer drag closes the shade');
  await page.mouse.up();await page.waitForTimeout(1750);
  assert((await state()).cityId==='melbourne'&&(await state()).openness>.99,'Releasing the closed shade travels and reopens');
  await page.getByRole('button',{name:'自动漫游'}).click();await page.waitForTimeout(130);
  assert((await state()).cityId==='melbourne'&&(await state()).openness>.98,'Resume after dragging preserves the current open city');
  await page.getByRole('button',{name:'暂停漫游'}).click();
  await page.getByRole('button',{name:'下一站',exact:true}).click();await page.waitForTimeout(130);await page.getByRole('button',{name:'下一站',exact:true}).click();await page.waitForTimeout(1800);
  assert(Number.isInteger((await state()).city)&&(await state()).openness>.99,'Rapid interrupted transitions settle in a valid open city');
  await page.getByRole('button',{name:'进入沉浸模式'}).click();assert((await state()).immersive,'Immersive mode enters');
  await page.keyboard.press('Escape');assert(!(await state()).immersive,'Escape exits immersive mode');
  await page.getByRole('button',{name:/^查看.+与照片来源$/}).click();
  assert(await page.getByRole('link',{name:'查看原始照片'}).count()===1,'City details show the original photograph source');
  await page.getByRole('button',{name:'关闭城市详情'}).click();
  await open();await page.getByRole('button',{name:'全部120',exact:true}).click();await search.fill('不丹');
  await page.getByRole('button',{name:'漫游这 1 座城市 →'}).click();await page.waitForTimeout(1900);
  assert((await state()).cityId==='thimphu'&&(await state()).route.length===1&&(await state()).playing,'Search results can become a one-city tour');
  await page.getByRole('button',{name:'暂停漫游'}).click();
  await page.getByRole('button',{name:'随便飞'}).click();assert((await state()).cityId==='thimphu','Random handles a one-city route');
  for(const [width,height] of [[1054,720],[390,844],[360,640],[844,390]]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,window:document.querySelector('#window-control').getBoundingClientRect().toJSON(),controls:document.querySelector('.interface').getBoundingClientRect().toJSON(),info:document.querySelector('#current-info').getBoundingClientRect().toJSON()}));
    assert(!layout.overflow&&layout.window.left>=0&&layout.window.right<=width&&layout.window.top>=0&&layout.window.bottom<=height,'Window fits '+width+'×'+height);
    await page.screenshot({path:'output/playwright/global-home-'+width+'x'+height+'.png'});
    await open();const modal=await page.locator('#atlas').boundingBox();assert(modal.x>=-1&&modal.y>=-1&&modal.x+modal.width<=width+1&&modal.y+modal.height<=height+1,'Atlas fits '+width+'×'+height);
    await page.screenshot({path:'output/playwright/global-atlas-'+width+'x'+height+'.png'});await page.getByRole('button',{name:'关闭目的地目录'}).click();result.viewports.push({width,height,layout});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/?city=paris&region=europe');
  await page.getByRole('button',{name:'下一站',exact:true}).click();await page.waitForTimeout(100);
  assert((await state()).cityId==='london'&&(await state()).openness>.99,'Reduced-motion travel is immediate and region query works');
  await page.goto(base+'/credits.html');
  assert(await page.locator('article').count()===120,'Credits page contains 120 full attribution records');
  await page.goto(base+'/?city=kyoto');await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:900});
  assert(result.errors.length===0,'No JavaScript runtime errors during the full acceptance flow');
  return result;
}
