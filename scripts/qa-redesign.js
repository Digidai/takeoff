async (page) => {
  const base = new URL(page.url()).origin;
  const result = {checks:[], errors:[], contrast:[]};
  const assert = (condition,message) => { if (!condition) throw new Error(message); result.checks.push(message); };
  const state = () => page.evaluate(() => takeoff.getState());
  page.on('pageerror',error => result.errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(base+'/');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  const visual = await page.evaluate(() => ({fonts:[...document.fonts].map(font => ({family:font.family,status:font.status})),window:document.querySelector('#window-control').getBoundingClientRect().toJSON(),copy:document.querySelector('.destination-panel').getBoundingClientRect().toJSON(),hint:document.querySelector('#hint-text').textContent}));
  assert(visual.fonts.length===2 && visual.fonts.every(font=>font.status==='loaded'),'Both locally hosted typefaces load');
  assert(Math.abs((visual.window.left+visual.window.right)/2-720)<1 && visual.window.width>240 && visual.copy.bottom<visual.window.top,'A single large window centers below the city title');
  assert(!await page.getByRole('combobox',{name:'漫游停留时间'}).isVisible() && !await page.getByRole('button',{name:'开启环境音'}).isVisible() && !await page.locator('.route-progress').isVisible(),'Preferences and route progress stay hidden on the default page');
  assert(visual.hint.includes('轻推'),'Window hint explains the upward gesture from the reference layout');
  assert((await state()).secondsPerCity===8,'The new tour defaults to eight seconds per city');
  await page.getByRole('button',{name:'观景设置'}).click();
  await page.getByRole('combobox',{name:'漫游停留时间'}).selectOption('12');
  assert((await state()).secondsPerCity===12 && (await page.locator('#route-duration').textContent()).includes('24 分钟'),'Changing pace updates the route duration');
  await page.getByRole('combobox',{name:'漫游停留时间'}).selectOption('5');
  await page.getByRole('button',{name:'关闭观景设置'}).click();
  assert(await page.locator('#settings-toggle').evaluate(element=>element===document.activeElement),'Closing preferences restores focus to their entry');
  await page.getByRole('button',{name:'开始漫游',exact:true}).click();
  await page.waitForTimeout(200);
  const progressA=Number(await page.locator('.route-progress').getAttribute('aria-valuenow'));
  await page.waitForTimeout(200);
  const progressB=Number(await page.locator('.route-progress').getAttribute('aria-valuenow'));
  assert(progressB>progressA && progressB<100,'Tour progress moves while viewing a city');
  await page.waitForFunction(()=>takeoff.getState().openness<.6,{},{timeout:6000});
  const cityBeforePause=(await state()).cityId;
  await page.getByRole('button',{name:'暂停漫游',exact:true}).click();
  await page.waitForTimeout(380);
  assert(!(await state()).playing && (await state()).openness>.99 && (await state()).cityId===cityBeforePause,'Pausing a closing shade restores the same city to an open view');
  const pausedProgress=await page.locator('.route-progress').getAttribute('aria-valuenow');
  await page.waitForTimeout(200);
  assert(await page.locator('.route-progress').getAttribute('aria-valuenow')===pausedProgress,'Progress remains stable while paused');

  await page.goto(base+'/?city=sydney&region=oceania');
  await page.getByRole('button',{name:'下一站',exact:true}).click();
  await page.waitForTimeout(80);
  await page.getByRole('button',{name:'下一站',exact:true}).click();
  await page.waitForTimeout(1250);
  assert((await state()).cityId==='brisbane' && (await state()).openness>.99,'Two rapid next clicks advance two stops');
  await page.getByRole('button',{name:'观景设置'}).click();
  await page.getByRole('button',{name:'进入沉浸模式'}).click();
  const immersive=await page.locator('#window-control').boundingBox();
  assert(immersive.height>visual.window.height && await page.getByRole('button',{name:'退出沉浸模式'}).isVisible(),'Immersive mode enlarges the window and provides an exit');
  await page.keyboard.press('Escape');
  assert(!(await state()).immersive && await page.locator('#settings-toggle').evaluate(element=>element===document.activeElement),'Escape exits immersive mode and restores focus to preferences');

  await page.getByRole('button',{name:'探索世界'}).click();
  await page.getByRole('searchbox',{name:'搜索目的地'}).fill('no-such-destination');
  assert(await page.locator('#no-results').isVisible() && await page.getByRole('button',{name:'漫游这 0 座城市 →'}).isDisabled(),'Empty results explain what to do and disable an empty tour');
  await page.getByRole('button',{name:'查看全部城市'}).click();
  assert(await page.getByRole('button',{name:/^前往/}).count()===120 && await page.getByRole('searchbox',{name:'搜索目的地'}).inputValue()==='','The empty-state action restores all destinations');
  await page.keyboard.press('Escape');
  assert(!await page.locator('#atlas').evaluate(dialog=>dialog.open) && await page.locator('#browse').evaluate(element=>element===document.activeElement),'Closing the directory restores focus to its entry');
  await page.locator('#window-control').focus();
  await page.keyboard.press('Enter'); await page.waitForTimeout(1250);
  assert((await state()).cityId==='perth','The redesigned window is operable with Enter');

  async function contrast(selectors) {
    const measurements=await page.evaluate(selectors => {
      const rgba=value=>{const parts=value.match(/[\d.]+/g)?.map(Number)||[0,0,0,0];return [parts[0],parts[1],parts[2],parts[3]??1];};
      const luminance=color=>color.slice(0,3).map(channel=>{const s=channel/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
      return selectors.flatMap(selector=>[...document.querySelectorAll(selector)].filter(element=>element.getBoundingClientRect().height>0).map(element=>{
        const lineage=[];for(let parent=element;parent;parent=parent.parentElement)lineage.unshift(parent);
        let background=[255,255,255];
        for(const parent of lineage){const color=rgba(getComputedStyle(parent).backgroundColor);background=background.map((value,index)=>color[index]*color[3]+value*(1-color[3]));}
        const style=getComputedStyle(element),foreground=rgba(style.color);
        const front=luminance(foreground),back=luminance(background);
        return {selector,text:element.textContent.trim().slice(0,45),ratio:(Math.max(front,back)+.05)/(Math.min(front,back)+.05)};
      }));
    },selectors);
    result.contrast.push(...measurements);
    const failures=measurements.filter(measurement=>measurement.ratio<4.5);
    assert(failures.length===0,'Readable text contrast: '+measurements.length+' samples'+(failures.length?' '+JSON.stringify(failures):''));
  }
  await page.goto(base+'/'); await page.waitForTimeout(900);
  await contrast(['.scene-coordinates','.city-place','#play-label','#browse','#hint-text','.landmark-caption']);
  await page.screenshot({path:'output/playwright/redesign-desktop.png'});
  await page.getByRole('button',{name:'观景设置'}).click(); await page.waitForTimeout(350);
  await contrast(['.settings-heading p','.journey-status','#route-duration','.preference-row strong','.preference-row small','.preference-row select','#sound','.settings-footer']);
  await page.screenshot({path:'output/playwright/redesign-settings.png'});
  await page.getByRole('button',{name:'关闭观景设置'}).click();
  await page.getByRole('button',{name:'探索世界'}).click(); await page.waitForTimeout(400);
  await contrast(['#atlas-summary','.search-wrap input','.region-filters button','.region-filters span','#results-count','#tour-region','#random','.card-caption strong','.card-caption>span','.card-caption small','.atlas-footer a']);
  await page.screenshot({path:'output/playwright/redesign-atlas.png'});
  await page.getByRole('button',{name:'关闭目的地目录'}).click();

  const context=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const failure=await context.newPage();
  failure.on('pageerror',error=>result.errors.push(error.message));
  try {
    await failure.goto(base+'/?city=sydney&region=oceania');
    const filename=await failure.evaluate(()=>TakeoffDestinations.find(city=>city.id==='tokyo').image);
    const pattern='**/assets/'+filename;
    await failure.route(pattern,route=>route.abort());
    await failure.getByRole('button',{name:'探索世界'}).tap();
    await failure.getByRole('button',{name:/^全部\s*120$/}).tap();
    await failure.getByRole('searchbox',{name:'搜索目的地'}).fill('Tokyo');
    await failure.getByRole('button',{name:'前往东京',exact:true}).tap();
    await failure.waitForTimeout(900);
    const recovered=await failure.evaluate(()=>({state:takeoff.getState(),busy:document.querySelector('#stage').getAttribute('aria-busy'),hint:document.querySelector('#hint-text').textContent}));
    assert(recovered.state.cityId==='sydney' && recovered.state.openness>.99 && recovered.busy==='false' && recovered.hint.includes('未能打开'),'A failed image request preserves the previous city and offers a retry');
    await failure.unroute(pattern);
    await failure.getByRole('button',{name:'探索世界'}).tap();
    await failure.getByRole('button',{name:'前往东京',exact:true}).tap();
    await failure.waitForTimeout(1300);
    assert(await failure.evaluate(()=>takeoff.getState().cityId==='tokyo' && takeoff.getState().openness>.99),'The failed destination succeeds after retry');
    await failure.goto(base+'/?city=kyoto'); await failure.waitForTimeout(900);
    await failure.screenshot({path:'output/playwright/redesign-mobile.png'});
    await failure.setViewportSize({width:568,height:320}); await failure.waitForTimeout(200);
    await failure.screenshot({path:'output/playwright/redesign-landscape.png'});
    await failure.emulateMedia({reducedMotion:'reduce'});
    await failure.goto(base+'/?city=kyoto&autoplay=1');
    assert(await failure.evaluate(()=>!takeoff.getState().playing),'Reduced-motion preference prevents automatic startup');
    await failure.getByRole('button',{name:'下一站',exact:true}).tap();
    await failure.waitForTimeout(100);
    assert(await failure.evaluate(()=>takeoff.getState().openness>.99 && takeoff.getState().cityId!=='kyoto'),'Reduced-motion travel completes without waiting for an animation');
  } finally { await context.close(); }
  assert(result.errors.length===0,'No runtime errors during the redesigned experience');
  return result;
}
