async (page) => {
  const base = new URL(page.url()).origin;
  const context = await page.context().browser().newContext({ viewport:{width:390,height:844}, hasTouch:true, isMobile:true, deviceScaleFactor:2 });
  const mobile = await context.newPage();
  const result = { checks:[], viewports:[], errors:[], titleChecks:0 };
  mobile.on('pageerror', error => result.errors.push(error.message));
  const assert = (condition, message) => { if (!condition) throw new Error(message); result.checks.push(message); };
  const settle = () => mobile.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  try {
    await mobile.goto(base + '/?city=rio-de-janeiro');
    assert(await mobile.evaluate(() => matchMedia('(pointer:coarse)').matches), 'Browser emulates touch input');
    for (const [width,height] of [[320,568],[360,640],[375,667],[390,844],[393,852],[430,932],[568,320],[667,375],[844,390],[932,430],[768,1024],[820,1180],[1024,768],[1366,1024]]) {
      await mobile.setViewportSize({width,height}); await settle();
      const layout = await mobile.evaluate(() => {
        const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
        const range = document.createRange(); range.selectNodeContents(document.querySelector('.scene-title'));
        return { window:box('#window-control'), dock:box('.interface'), info:box('#current-info'), title:range.getBoundingClientRect().toJSON(), overflow:document.documentElement.scrollWidth>innerWidth,
          targets:[...document.querySelectorAll('.interface button')].map(button => ({id:button.id,...button.getBoundingClientRect().toJSON()})) };
      });
      const inside = rect => rect.left>=-1 && rect.top>=-1 && rect.right<=width+1 && rect.bottom<=height+1;
      assert(!layout.overflow && inside(layout.window) && inside(layout.dock) && inside(layout.info) && inside(layout.title), 'Scene and controls fit ' + width + '×' + height);
      assert(layout.targets.every(button => button.width>=43.5 && button.height>=43.5), 'Main touch targets are at least 44px at ' + width + '×' + height);
      const overlaps = (a,b) => Math.min(a.right,b.right)>Math.max(a.left,b.left)+1 && Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1;
      assert(!overlaps(layout.window,layout.dock) && !overlaps(layout.info,layout.dock), 'Window, details, and dock stay separate at ' + width + '×' + height);
      await mobile.getByRole('button',{name:'探索世界'}).tap(); await settle();
      assert(await mobile.evaluate(() => document.activeElement.id !== 'search'), 'Opening the atlas does not focus the mobile keyboard at ' + width + '×' + height);
      const atlas = await mobile.locator('#atlas').boundingBox();
      assert(atlas.x>=-1 && atlas.y>=-1 && atlas.x+atlas.width<=width+1 && atlas.y+atlas.height<=height+1, 'Atlas fits ' + width + '×' + height);
      assert(await mobile.locator('#search').evaluate(element => parseFloat(getComputedStyle(element).fontSize)>=16), 'Search text is at least 16px at ' + width + '×' + height);
      await mobile.getByRole('button',{name:'关闭目的地目录'}).tap();
      result.viewports.push({width,height,layout});
    }
    await mobile.setViewportSize({width:390,height:844}); await settle();
    await mobile.evaluate(() => {
      document.documentElement.style.setProperty('--safe-top','47px');
      document.documentElement.style.setProperty('--safe-bottom','34px');
      dispatchEvent(new Event('resize'));
    }); await settle();
    const safe = await mobile.evaluate(() => ({brand:document.querySelector('.seat-label').getBoundingClientRect().toJSON(),dock:document.querySelector('.interface').getBoundingClientRect().toJSON()}));
    assert(safe.brand.top>=47 && safe.dock.bottom<=844-34, 'Simulated top and bottom safe areas are respected');
    await mobile.screenshot({path:'output/playwright/mobile-safe-area.png'});
    await mobile.evaluate(() => { document.documentElement.style.removeProperty('--safe-top'); document.documentElement.style.removeProperty('--safe-bottom'); dispatchEvent(new Event('resize')); });
    await mobile.getByRole('button',{name:'探索世界'}).tap();
    await mobile.getByRole('searchbox',{name:'搜索目的地'}).tap();
    await mobile.setViewportSize({width:390,height:420}); await settle();
    await mobile.getByRole('searchbox',{name:'搜索目的地'}).fill('京都');
    const keyboard = await mobile.evaluate(() => ({compact:document.body.classList.contains('keyboard-open'),search:document.querySelector('#search').getBoundingClientRect().toJSON(),card:document.querySelector('.city-card').getBoundingClientRect().toJSON()}));
    assert(keyboard.compact && keyboard.search.top>=0 && keyboard.search.bottom<420 && keyboard.card.top<420, 'Reduced keyboard viewport keeps search and results accessible');
    await mobile.screenshot({path:'output/playwright/mobile-keyboard.png'});
    await mobile.getByRole('button',{name:'前往京都',exact:true}).tap();
    await mobile.setViewportSize({width:390,height:844}); await mobile.waitForTimeout(1700); await settle();
    assert(await mobile.evaluate(() => takeoff.getState().cityId==='kyoto'), 'Touch search selection travels to the requested city');
    const shade = await mobile.locator('#window-control').boundingBox();
    const cdp = await context.newCDPSession(mobile);
    const x=shade.x+shade.width/2,y=shade.y+shade.height*.8;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-shade.height*.72*i/12}]});
    assert(await mobile.evaluate(() => takeoff.getState().openness<.32), 'A real touch gesture closes the shade');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await mobile.waitForTimeout(1700);
    assert(await mobile.evaluate(() => takeoff.getState().cityId!=='kyoto' && takeoff.getState().openness>.99), 'Touch release travels to the next city and reopens');
    await mobile.emulateMedia({reducedMotion:'reduce'});
    for (const [width,height] of [[320,568],[390,844],[568,320]]) {
      await mobile.setViewportSize({width,height}); await settle();
      const count=await mobile.evaluate(()=>TakeoffCities.length);
      for(let index=0;index<count;index++) {
        await mobile.evaluate(index=>takeoff.travel(index),index);
        const title = await mobile.evaluate(() => { const range=document.createRange();range.selectNodeContents(document.querySelector('.scene-title'));const r=range.getBoundingClientRect();return {name:document.querySelector('.scene-title').textContent,left:r.left,right:r.right}; });
        if(title.left < -1 || title.right > width+1)throw new Error('City title clipped: '+title.name+' at '+width+'×'+height);
        result.titleChecks++;
      }
      assert(true, 'All 120 city titles fit ' + width + '×' + height);
    }
    assert(result.errors.length===0, 'No runtime errors during mobile acceptance');
    return result;
  } finally { await context.close(); }
}
