(function () {
  'use strict';
  const $=s=>document.querySelector(s),cities=TakeoffScene.cities;
  const regions=[['all','全部'],['asia','亚洲'],['europe','欧洲'],['africa','非洲'],['north-america','北美洲'],['south-america','南美洲'],['oceania','大洋洲']];
  const label=id=>regions.find(r=>r[0]===id)?.[1]||id;
  const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const indices=cities.map((_,i)=>i);
  function interleave(){
    const buckets=regions.slice(1).map(([id])=>indices.filter(i=>cities[i].region===id));
    const result=[];for(let n=0;result.length<cities.length;n++)for(const b of buckets)if(b[n]!==undefined)result.push(b[n]);
    return result;
  }
  const scene=TakeoffScene.mount($('#stage'));
  const media=matchMedia('(prefers-reduced-motion: reduce)'),shade=$('#window-control'),audio=TakeoffAmbient.create();
  const params=new URLSearchParams(location.search);
  let scale=1,city=Math.max(0,cities.findIndex(c=>c.id===params.get('city'))),openness=1,playing=false,elapsed=0,previous=0,raf=0,transitionToken=0,sound=false,drag=null,immersive=false,manualPose=true;
  let route=interleave(),routeName='环球漫游',selectedRegion='all',lastCity=-1,visible=[],recent=[],rendered=false;
  const seconds=5;
  if(params.has('clean'))document.body.classList.add('clean');
  const regionParam=params.get('region');
  if(regions.some(r=>r[0]===regionParam)&&regionParam!=='all'){
    route=indices.filter(i=>cities[i].region===regionParam);routeName=label(regionParam)+'漫游';selectedRegion=regionParam;
    if(!route.includes(city))city=route[0];
  }
  const statCountries=new Set(cities.map(c=>c.country)).size;
  $('#city-total').textContent=cities.length;
  $('#atlas-summary').textContent=`${cities.length} 座城市 · ${statCountries} 个国家／地区 · 6 大洲`;
  $('#region-filters').innerHTML=regions.map(([id,title])=>`<button data-region="${id}" aria-pressed="${id==='all'}">${title}<span>${id==='all'?cities.length:cities.filter(c=>c.region===id).length}</span></button>`).join('');
  $('#world-dots').innerHTML=`<path d="M0 90h720M360 0v180M0 45h720M0 135h720" class="map-guide"/>`+cities.map((c,i)=>`<circle data-point="${i}" cx="${((c.lon+180)/360*680+20).toFixed(2)}" cy="${((85-c.lat)/170*160+10).toFixed(2)}" r="2.4"><title>${escape(c.zh)}</title></circle>`).join('');
  let fullHeight=innerHeight,lastWidth=innerWidth;
  const art=scene.element.querySelector('.window-art'),sceneText=scene.element.querySelector('.scene-text'),sceneTitle=scene.element.querySelector('.scene-title');
  function resize(){
    const viewport=window.visualViewport,w=innerWidth,h=Math.min(innerHeight,viewport?.height||innerHeight);
    if(Math.abs(w-lastWidth)>32)fullHeight=h;else fullHeight=Math.max(fullHeight,h);lastWidth=w;
    const landscape=w>480&&w<=960&&h<=500&&w>h,portrait=!landscape&&(matchMedia('(pointer:coarse)').matches||w<=600||(w<=900&&h>w));
    document.documentElement.style.setProperty('--visual-height',h+'px');
    document.documentElement.style.setProperty('--visual-top',(viewport?.offsetTop||0)+'px');
    document.body.classList.toggle('mobile-portrait',portrait);document.body.classList.toggle('mobile-landscape',landscape);
    document.body.classList.toggle('keyboard-open',portrait&&document.activeElement?.id==='search'&&(fullHeight-h>120||h<480));
    const dock=$('#interface');dock.style.top='';dock.style.left='';dock.style.bottom='';dock.style.transform='';
    scene.element.style.left=w/2+'px';scene.element.style.top=h/2+'px';
    art.style.top='';sceneText.style.top='';sceneText.style.left='';sceneText.style.width='';sceneTitle.style.fontSize='';
    sceneTitle.textContent=cities[city].name;
    if(portrait){
      const headerBottom=$('.seat-label').getBoundingClientRect().bottom+16,dockTop=dock.getBoundingClientRect().top;
      const available=dockTop-headerBottom-12;
      scale=Math.max(.25,Math.min(w>600?1.3:1.12,(w-64)/212,(available-92)/376));
      document.documentElement.style.setProperty('--scene-scale',scale);
      const textWidth=(w-36)/scale;sceneText.style.width=textWidth+'px';sceneText.style.left=(527-textWidth/2)+'px';
      const range=document.createRange();range.selectNodeContents(sceneTitle);const width=range.getBoundingClientRect().width;
      if(width>w-36)sceneTitle.style.fontSize=40*(w-36)/width+'px';
      const titleHeight=sceneText.offsetHeight*scale,total=titleHeight+292*scale+44+34;
      const titleTop=headerBottom+Math.max(0,(available-total)/2),windowTop=titleTop+titleHeight+24;
      sceneText.style.top=(360+(titleTop-h/2)/scale)+'px';art.style.top=(360+(windowTop-h/2)/scale)+'px';
      $('#current-info').style.top=windowTop+292*scale+10+'px';
    }else if(landscape){
      const safe=getComputedStyle(document.documentElement),safeTop=parseFloat(safe.getPropertyValue('--safe-top'))||0,safeBottom=parseFloat(safe.getPropertyValue('--safe-bottom'))||0,safeRight=parseFloat(safe.getPropertyValue('--safe-right'))||0;
      scale=Math.min(1.12,Math.max(.35,(h-safeTop-safeBottom-48)/292));
      document.documentElement.style.setProperty('--scene-scale',scale);
      const windowCenter=w*.28,rightCenter=w-Math.max(24,safeRight+12)-dock.offsetWidth/2,windowTop=safeTop+(h-safeTop-safeBottom-292*scale)/2;
      scene.element.style.left=windowCenter+'px';art.style.top=(360+(windowTop-h/2)/scale)+'px';
      const textWidth=(dock.offsetWidth+8)/scale;sceneText.style.width=textWidth+'px';sceneText.style.left=(527+(rightCenter-windowCenter)/scale-textWidth/2)+'px';
      const range=document.createRange();range.selectNodeContents(sceneTitle);const width=range.getBoundingClientRect().width;
      if(width>dock.offsetWidth)sceneTitle.style.fontSize=40*dock.offsetWidth/width+'px';
      const titleHeight=sceneText.offsetHeight*scale,total=titleHeight+44+dock.offsetHeight+20,titleTop=safeTop+Math.max(8,(h-safeTop-safeBottom-total)/2);
      sceneText.style.top=(360+(titleTop-h/2)/scale)+'px';
      $('#current-info').style.top=titleTop+titleHeight+6+'px';$('#current-info').style.left=rightCenter+'px';
      dock.style.top=titleTop+titleHeight+44+14+'px';dock.style.left=rightCenter+'px';dock.style.bottom='auto';dock.style.transform='translateX(-50%)';
    }else{
      scale=Math.min(h/720,w/1054);document.documentElement.style.setProperty('--scene-scale',scale);
      $('#current-info').style.top=h/2+(568-360)*scale+'px';
    }
    if(!landscape)$('#current-info').style.left='';
    const box=art.getBoundingClientRect();shade.style.left=box.left+'px';shade.style.top=box.top+'px';shade.style.width=box.width+'px';shade.style.height=box.height+'px';
  }
  function ambient(){document.documentElement.style.setProperty('--ambient',Math.pow(openness,.68));}
  function update(){
    ambient();$('#play').setAttribute('aria-pressed',playing);$('#play-label').textContent=playing?'暂停漫游':'自动漫游';$('#play-symbol').textContent=playing?'Ⅱ':'▷';
    $('#hint').textContent=playing?`${routeName}，下一站就在窗外`:'向上轻推遮光板，去下一站';
    $('#route-name').textContent=routeName;$('#route-counter').textContent=`${String(route.indexOf(city)+1).padStart(2,'0')} / ${route.length}`;
    if(lastCity!==city){
      const c=cities[city];$('#current-place').textContent=`${c.zh} · ${c.country}`;$('#current-landmark').textContent=c.landmark;
      $('#current-info').setAttribute('aria-label',`查看${c.zh}与照片来源`);
      if(rendered)$('#city-grid').querySelectorAll('[data-destination]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.destination)===city));
      $('#world-dots').querySelectorAll('circle').forEach(p=>p.classList.toggle('active',Number(p.dataset.point)===city));
      const next=route[(route.indexOf(city)+1)%route.length];scene.prepare(next).catch(()=>{});lastCity=city;resize();
    }
  }
  function paint(o=openness,extra={}){openness=o;scene.setState({city,openness:o,...extra});ambient();$('#current-info').style.opacity=Math.max(0,(o-.55)/.45);}
  function pause(){playing=false;transitionToken++;cancelAnimationFrame(raf);previous=0;audio.setActive(false);update();}
  function frame(now){
    if(!playing)return;if(previous)elapsed+=(now-previous)/1000;previous=now;
    const duration=route.length*seconds;if(elapsed>=duration)elapsed%=duration;
    const state=TakeoffScene.tourAt(elapsed,route,seconds);city=state.city;openness=state.openness;scene.setState(state);$('#current-info').style.opacity=state.titleOpacity;update();
    raf=requestAnimationFrame(frame);
  }
  async function syncAudio(){
    const token=transitionToken;
    try{await audio.setActive(sound&&playing);}
    catch{if(token===transitionToken){sound=false;audio.setActive(false);updateSound();}}
  }
  async function play(){
    if(playing)return;const token=++transitionToken;playing=true;previous=0;update();
    if(manualPose){if(openness<.999&&!await tween(1,450,token))return;if(token!==transitionToken)return;elapsed=Math.max(0,route.indexOf(city))*seconds+1.25;manualPose=false;}
    syncAudio();raf=requestAnimationFrame(frame);
  }
  function tween(to,duration,token,reveal=false){
    if(media.matches){paint(to);return Promise.resolve(token===transitionToken);}
    const from=openness,start=performance.now();return new Promise(resolve=>{
      function tick(now){
        if(token!==transitionToken)return resolve(false);
        const p=Math.min(1,(now-start)/duration),move=Math.min(1,(now-start)/Math.min(duration,850)),e=move*move*(3-2*move);
        paint(from+(to-from)*e,reveal?{titleOpacity:1-(1-Math.min(1,p*2.5))**3,titleOffset:8*(1-Math.min(1,p*2))**3,coordinateProgress:Math.max(0,Math.min(1,(p-.15)/.75))}:{});
        if(p<1)requestAnimationFrame(tick);else resolve(true);
      }requestAnimationFrame(tick);
    });
  }
  async function travel(target){
    if(!Number.isInteger(target))return false;target=((target%cities.length)+cities.length)%cities.length;
    pause();manualPose=true;const token=++transitionToken;
    try{
      const [closed]=await Promise.all([tween(0,430,token),scene.prepare(target)]);if(!closed||token!==transitionToken)return false;
      city=target;update();paint(0);recent=[...recent.slice(-4),city];
      if(!await tween(1,1100,token,true))return false;
      elapsed=Math.max(0,route.indexOf(city))*seconds+1.25;manualPose=false;$('#announcement').textContent=`已抵达${cities[city].zh}，${cities[city].country}`;return true;
    }catch{
      if(token===transitionToken){await tween(1,350,token);$('#hint').textContent='这张照片暂时未能打开，请再试一次';}return false;
    }
  }
  function nextIndex(step){return route[(Math.max(0,route.indexOf(city))+step+route.length)%route.length];}
  function updateSound(){
    $('#sound').setAttribute('aria-pressed',sound);$('#sound').setAttribute('aria-label',sound?'关闭环境音':'开启环境音');$('#sound-waves').setAttribute('d',sound?'M17 8q4 4 0 8m3-11q7 7 0 14':'m17 9 5 6m0-6-5 6');
  }
  function setImmersive(value){immersive=value;document.body.classList.toggle('immersive',value);$(value?'#exit-immersive':'#immersive').focus();}
  function renderGrid(){
    const q=normalize($('#search').value.trim());visible=indices.filter(i=>(selectedRegion==='all'||cities[i].region===selectedRegion)&&normalize([cities[i].zh,cities[i].name,cities[i].country,cities[i].landmark,cities[i].landmarkArticle].join(' ')).includes(q));
    $('#region-filters').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.region===selectedRegion));
    $('#city-grid').innerHTML=visible.map(i=>{const c=cities[i];return `<button class="city-card" data-destination="${i}" aria-pressed="${i===city}" aria-label="前往${escape(c.zh)}"><span class="card-photo"><img src="assets/${c.image}" loading="lazy" decoding="async" alt="${escape(c.imageKind==='city'?c.zh+'城市景观':c.landmark)}"><span class="card-region">${label(c.region)}</span><span class="card-arrow">↗</span></span><span class="card-caption"><strong>${escape(c.zh)}</strong><span>${escape(c.name)}</span><small>${escape(c.country)} · ${escape(c.landmark)}</small></span></button>`;}).join('');
    $('#no-results').hidden=visible.length>0;$('#results-count').textContent=`${visible.length} 个目的地`;
    $('#tour-region').textContent=`漫游这 ${visible.length} 座城市 →`;$('#tour-region').disabled=visible.length===0;rendered=true;
  }
  function openAtlas(){pause();renderGrid();$('#atlas').showModal();if(innerWidth<=900||matchMedia('(pointer:coarse)').matches)$('#atlas .close-dialog').focus({preventScroll:true});else $('#search').focus();resize();}
  function openDetails(){
    pause();const c=cities[city];$('#detail-content').innerHTML=`<img class="detail-photo" src="assets/${c.image}" alt="${escape(c.imageKind==='city'?c.zh+'城市景观':c.landmark)}"><p class="eyebrow">${label(c.region)} · ${escape(c.country)}</p><h2 id="detail-title">${escape(c.zh)}<span>${escape(c.name)}</span></h2><p class="detail-line">${escape(c.line)}</p><div class="detail-landmark">${escape(c.landmark)}<span>${escape(c.coordinates)}</span></div><div class="source-links"><a href="${escape(c.citySource)}" target="_blank" rel="noopener">城市资料 ↗</a><a href="${escape(c.landmarkSource)}" target="_blank" rel="noopener">地标资料 ↗</a></div><div class="photo-credit"><p>照片：${escape(c.artist)}</p><p><a href="${escape(c.photoSource)}" target="_blank" rel="noopener">查看原始照片 ↗</a> · <a href="${escape(c.licenseUrl)}" target="_blank" rel="noopener">${escape(c.license)}</a></p><p>机窗按比例裁切展示；坐标为城市位置。</p></div>`;$('#place-details').showModal();
  }
  $('#browse').addEventListener('click',openAtlas);$('#current-info').addEventListener('click',openDetails);
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
  [$('#atlas'),$('#place-details')].forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#search').addEventListener('input',renderGrid);
  $('#region-filters').addEventListener('click',e=>{const b=e.target.closest('[data-region]');if(b){selectedRegion=b.dataset.region;renderGrid();}});
  $('#city-grid').addEventListener('click',e=>{const b=e.target.closest('[data-destination]');if(b){route=selectedRegion==='all'?interleave():indices.filter(i=>cities[i].region===selectedRegion);routeName=selectedRegion==='all'?'环球漫游':label(selectedRegion)+'漫游';$('#atlas').close();travel(Number(b.dataset.destination));}});
  $('#tour-region').addEventListener('click',async()=>{
    if(!visible.length)return;route=[...visible];routeName=selectedRegion==='all'&&visible.length===cities.length?'环球漫游':selectedRegion==='all'?'精选漫游':label(selectedRegion)+'漫游';$('#atlas').close();if(await travel(route.includes(city)?city:route[0]))play();
  });
  $('#random').addEventListener('click',()=>{const choices=route.filter(i=>i!==city&&!recent.includes(i));const list=choices.length?choices:route.filter(i=>i!==city);if(list.length)travel(list[Math.floor(Math.random()*list.length)]);});
  $('#play').addEventListener('click',()=>playing?pause():play());$('#prev').addEventListener('click',()=>travel(nextIndex(-1)));$('#next').addEventListener('click',()=>travel(nextIndex(1)));
  $('#sound').addEventListener('click',()=>{sound=!sound;updateSound();if(sound&&!playing)play();else syncAudio();});$('#immersive').addEventListener('click',()=>setImmersive(true));$('#exit-immersive').addEventListener('click',()=>setImmersive(false));
  shade.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;pause();manualPose=true;transitionToken++;shade.setPointerCapture(e.pointerId);drag={id:e.pointerId,y:e.clientY,open:openness,moved:false};});
  shade.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dy=(e.clientY-drag.y)/scale;if(Math.abs(dy)>4)drag.moved=true;paint(Math.max(0,Math.min(1,drag.open+dy/244)));});
  shade.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(!moved||openness<.32)travel(nextIndex(1));else tween(1,420,++transitionToken);});
  shade.addEventListener('pointercancel',e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;tween(1,350,++transitionToken);});shade.addEventListener('click',e=>{if(e.detail===0)travel(nextIndex(1));});
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea,select'))return;
    if($('#atlas').open||$('#place-details').open)return;
    if(e.key==='Escape'&&immersive){setImmersive(false);return;}
    if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;
    if(e.key==='/'){e.preventDefault();openAtlas();}else if(e.key==='ArrowRight'){e.preventDefault();travel(nextIndex(1));}else if(e.key==='ArrowLeft'){e.preventDefault();travel(nextIndex(-1));}else if(e.key===' '){e.preventDefault();playing?pause():play();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause();});addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);$('#search').addEventListener('focus',resize);$('#search').addEventListener('blur',()=>requestAnimationFrame(resize));
  paint(1);resize();update();scene.prepare(city).catch(()=>{});
  if(params.has('autoplay')&&!media.matches)play();
  window.takeoff={scene,getAudioState:audio.getState,getState:()=>({city,cityId:cities[city].id,openness,playing,elapsed,sound,immersive,route:[...route],selectedRegion}),travel};
})();
