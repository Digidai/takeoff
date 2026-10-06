(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const geography = ['id','name','zh','country','region','regionName','lat','lon','coordinates','line','landmark','landmarkArticle','citySource','landmarkSource','coordinateSource','officialSource'];
  const cities = window.TakeoffCities.map(current => ({
    ...Object.fromEntries(geography.map(key => [key,current[key]])),
    ...(window.TakeoffIllustrations?.[current.id] || {id:current.id,image:`illustrations/${current.id}.webp`}),
    imageKind:'illustration',align:'xMidYMid slice',
    researchPhoto:{image:current.image,sha256:current.sha256,bytes:current.bytes,artist:current.artist,license:current.license,licenseUrl:current.licenseUrl,photoSource:current.photoSource}
  }));
  window.TakeoffDestinations = cities;
  const regions = [['all','全部'],['asia','亚洲'],['europe','欧洲'],['africa','非洲'],['north-america','北美洲'],['south-america','南美洲'],['oceania','大洋洲']];
  const label = id => regions.find(region => region[0] === id)?.[1] || id;
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const indices = cities.map((_,index) => index);
  const clamp = value => Math.max(0,Math.min(1,value));
  function interleave() {
    const buckets = regions.slice(1).map(([id]) => indices.filter(index => cities[index].region === id));
    const route = [];
    for (let row = 0; route.length < cities.length; row++) for (const bucket of buckets) if (bucket[row] !== undefined) route.push(bucket[row]);
    return route;
  }

  const scene = TakeoffCabin.mount($('#stage'),{cities});
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const shade = $('#window-control');
  const audio = TakeoffAmbient.create();
  const params = new URLSearchParams(location.search);
  let city = Math.max(0,cities.findIndex(candidate => candidate.id === params.get('city')));
  let openness = 1, playing = false, elapsed = 0, previous = 0, raf = 0, transitionToken = 0;
  let sound = false, drag = null, immersive = false, manualPose = true, scale = 1, hasPlayed = false;
  let seconds = 8, route = interleave(), routeName = '环球漫游', selectedRegion = 'all';
  let visible = [], recent = [], lastCity = -1, rendered = false, progressValue = -1, pendingCity = null;
  let fullHeight = innerHeight, lastWidth = innerWidth, resizeFrame = 0;
  let arrivalAnimations = [];
  if (params.has('clean')) document.body.classList.add('clean');
  const regionParam = params.get('region');
  if (regions.some(([id]) => id === regionParam) && regionParam !== 'all') {
    route = indices.filter(index => cities[index].region === regionParam);
    selectedRegion = regionParam; routeName = label(regionParam) + '漫游';
    if (!route.includes(city)) city = route[0];
  }

  $('#city-total').textContent = cities.length;
  $('#atlas-summary').textContent = `${cities.length} 座城市 · ${new Set(cities.map(candidate => candidate.country)).size} 个国家／地区 · 6 大洲`;
  $('#region-filters').innerHTML = regions.map(([id,title]) => `<button data-region="${id}" aria-pressed="${id === selectedRegion}">${title}<span>${id === 'all' ? cities.length : cities.filter(candidate => candidate.region === id).length}</span></button>`).join('');
  $('#world-dots').innerHTML = '<path d="M0 90h720M360 0v180M0 45h720M0 135h720" class="map-guide"/>' + cities.map((candidate,index) => `<circle data-point="${index}" cx="${((candidate.lon+180)/360*680+20).toFixed(2)}" cy="${((85-candidate.lat)/170*160+10).toFixed(2)}" r="2.4"/>`).join('');

  function resize() {
    const viewport = window.visualViewport;
    const width = innerWidth, height = Math.min(innerHeight,viewport?.height || innerHeight);
    if (Math.abs(width-lastWidth) > 32) fullHeight = height;
    else fullHeight = Math.max(fullHeight,height);
    lastWidth = width;
    const landscape = width > 480 && width <= 1180 && height <= 540 && width > height;
    const portrait = !landscape && (width <= 600 || (width <= 900 && height > width));
    document.documentElement.style.setProperty('--visual-height',height + 'px');
    document.documentElement.style.setProperty('--visual-top',(viewport?.offsetTop || 0) + 'px');
    document.body.classList.toggle('mobile-portrait',portrait);
    document.body.classList.toggle('mobile-landscape',landscape);
    document.body.classList.toggle('keyboard-open',portrait && document.activeElement?.id === 'search' && (fullHeight-height > 120 || height < 480));
    const area = scene.element.getBoundingClientRect();
    const maximum = immersive || params.has('clean') ? 1.5 : portrait ? 1.02 : landscape ? 1.32 : Math.min(1.16,Math.max(.82,width*.19/TakeoffCabin.width));
    scale = Math.max(.1,Math.min((area.width-36)/TakeoffCabin.width,(area.height-24)/TakeoffCabin.height,maximum));
    scene.art.style.width = TakeoffCabin.width*scale + 'px';
    scene.art.style.height = TakeoffCabin.height*scale + 'px';
    const art = scene.art.getBoundingClientRect(), stage = $('#stage').getBoundingClientRect();
    shade.style.left = art.left-stage.left + 'px';
    shade.style.top = art.top-stage.top + 'px';
    shade.style.width = art.width + 'px';
    shade.style.height = art.height + 'px';
  }
  function scheduleResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }

  function setProgress(value) {
    const percent = Math.round(clamp(value)*100);
    $('#stop-progress').style.transform = `scaleX(${clamp(value)})`;
    if (percent !== progressValue) {
      $('.route-progress').setAttribute('aria-valuenow',percent);
      progressValue = percent;
    }
  }
  function updateControls() {
    $('#play').setAttribute('aria-pressed',String(playing));
    $('#play-label').textContent = playing ? '暂停漫游' : hasPlayed ? '继续漫游' : '开始漫游';
    $('#play').setAttribute('aria-label',$('#play-label').textContent);
    $('#play-symbol').innerHTML = playing ? '<path d="M8 5h3v14H8zM15 5h3v14h-3z"/>' : '<path d="m9 5 11 7-11 7z"/>';
    $('#route-name').textContent = routeName;
    $('#route-counter').textContent = `${String(Math.max(0,route.indexOf(city))+1).padStart(2,'0')} / ${route.length}`;
    const total = route.length*seconds;
    $('#route-duration').textContent = `${route.length} 座城市 · 约 ${total < 60 ? total + ' 秒' : Math.round(total/60) + ' 分钟'}`;
    $('#hint-text').textContent = immersive ? `${cities[city].zh} · ${cities[city].country}` : playing ? '世界正在经过你的窗。' : '向上轻推遮光板，去下一站';
  }
  function animateArrival() {
    arrivalAnimations.forEach(animation => animation.cancel());
    arrivalAnimations = [];
    if (media.matches) return;
    ['.city-heading','.landmark-caption'].forEach((selector,index) => {
      const frames = selector === '.landmark-caption' ? [{opacity:0},{opacity:1}] : [{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}];
      arrivalAnimations.push($(selector).animate(frames,{duration:460,delay:index*40,easing:'cubic-bezier(.22,1,.36,1)'}));
    });
  }
  function updateCity() {
    if (lastCity === city) return;
    const current = cities[city];
    $('#city-name').textContent = current.name;
    $('#current-place').textContent = `${current.zh} · ${current.country}`;
    $('#coordinates').textContent = current.coordinates;
    $('#current-landmark').textContent = current.landmark;
    $('#arrival-region').textContent = '已抵达 · ' + label(current.region);
    $('#current-info').setAttribute('aria-label',`查看${current.zh}与插画资料`);
    $('#current-info').title = current.landmark + ' · 城市与插画资料';
    if (rendered) $('#city-grid').querySelectorAll('[data-destination]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.destination) === city)));
    $('#world-dots').querySelectorAll('circle').forEach(point => point.classList.toggle('active',Number(point.dataset.point) === city));
    const next = route[(Math.max(0,route.indexOf(city))+1)%route.length];
    scene.prepare(next).catch(() => {});
    if (lastCity !== -1) animateArrival();
    lastCity = city; updateControls(); resize();
  }
  function paint(value = openness) {
    openness = clamp(value);
    scene.setState({city,openness});
  }
  function busy(value,text = '') {
    $('#travel-status').hidden = !value;
    $('#travel-status').textContent = text;
    $('#stage').setAttribute('aria-busy',String(value));
  }
  function pause(reveal = false) {
    playing = false; transitionToken++; cancelAnimationFrame(raf); previous = 0; pendingCity = null;
    audio.setActive(false); updateControls();
    if (reveal && !drag && openness < .999) {
      manualPose = true; tween(1,300,transitionToken);
    }
  }
  async function syncAudio() {
    const token = transitionToken;
    try { await audio.setActive(sound && playing); }
    catch { if (token === transitionToken) { sound = false; audio.setActive(false); updateSound(); } }
  }
  function tourAt(time) {
    const routeIndex = Math.floor(time/seconds)%route.length, phase = time%seconds;
    const opening = seconds*.12, closingAt = seconds*.86, closing = seconds*.12;
    const smooth = value => value*value*(3-2*value);
    const value = phase < opening ? smooth(clamp(phase/opening)) : phase < closingAt ? 1 : 1-smooth(clamp((phase-closingAt)/closing));
    return {city:route[routeIndex],openness:value};
  }
  function frame(now) {
    if (!playing) return;
    if (previous) elapsed += (now-previous)/1000;
    previous = now;
    const duration = route.length*seconds;
    if (elapsed >= duration) elapsed %= duration;
    const state = tourAt(elapsed);
    if (state.city !== city && !scene.isPrepared(state.city)) {
      travel(state.city).then(success => { if (success && !document.hidden) play(); });
      return;
    }
    city = state.city; paint(state.openness); updateCity();
    setProgress((elapsed%seconds)/seconds);
    raf = requestAnimationFrame(frame);
  }
  async function play() {
    if (playing) return;
    const token = ++transitionToken;
    playing = true; hasPlayed = true; previous = 0; pendingCity = null; updateControls(); busy(false);
    try {
      await scene.prepare(city);
      if (token !== transitionToken) return;
      if (manualPose) {
        if (openness < .999 && !await tween(1,380,token)) return;
        if (token !== transitionToken) return;
        elapsed = Math.max(0,route.indexOf(city))*seconds + seconds*.16;
        manualPose = false;
      }
      syncAudio(); raf = requestAnimationFrame(frame);
    } catch {
      if (token === transitionToken) { pause(); busy(false); $('#hint-text').textContent = '插画暂时未能打开，可在目录中重试。'; }
    }
  }
  function tween(to,duration,token,opening = false) {
    if (media.matches) { paint(to); return Promise.resolve(token === transitionToken); }
    const from = openness, start = performance.now();
    return new Promise(resolve => {
      function tick(now) {
        if (token !== transitionToken) return resolve(false);
        const progress = Math.min(1,(now-start)/duration);
        const eased = opening ? 1-Math.pow(1-progress,3) : progress*progress*(3-2*progress);
        paint(from+(to-from)*eased);
        if (progress < 1) requestAnimationFrame(tick);
        else resolve(true);
      }
      requestAnimationFrame(tick);
    });
  }
  async function travel(target) {
    if (!Number.isInteger(target)) return false;
    target = ((target%cities.length)+cities.length)%cities.length;
    pause(); manualPose = true; pendingCity = target;
    const token = ++transitionToken;
    busy(true,'正在飞往' + cities[target].zh + '…');
    try {
      const [closed] = await Promise.all([tween(0,320,token),scene.prepare(target)]);
      if (!closed || token !== transitionToken) return false;
      city = target; pendingCity = null; paint(0); updateCity(); recent = [...recent.slice(-4),city]; busy(false);
      if (!await tween(1,760,token,true)) return false;
      elapsed = Math.max(0,route.indexOf(city))*seconds + seconds*.16;
      manualPose = false; setProgress(0);
      $('#announcement').textContent = `已抵达${cities[city].zh}，${cities[city].country}`;
      return true;
    } catch {
      if (token === transitionToken) {
        const recovery = ++transitionToken; pendingCity = null; busy(false);
        if (await tween(1,320,recovery,true)) $('#hint-text').textContent = '插画暂时未能打开，可在目录中重试或选择另一站。';
      }
      return false;
    }
  }
  function nextIndex(step) { return route[(Math.max(0,route.indexOf(pendingCity ?? city))+step+route.length)%route.length]; }
  function updateSound() {
    $('#sound').setAttribute('aria-pressed',String(sound));
    $('#sound').setAttribute('aria-label',sound ? '关闭环境音' : '开启环境音');
    $('#sound-waves').setAttribute('d',sound ? 'M17 8q4 4 0 8m3-11q7 7 0 14' : 'm17 9 5 6m0-6-5 6');
    $('#sound-state').textContent = sound ? '开启' : '关闭';
  }
  function setImmersive(value) {
    if ($('#settings').open) $('#settings').close();
    immersive = value; document.body.classList.toggle('immersive',value);
    updateControls(); resize(); $(value ? '#exit-immersive' : '#settings-toggle').focus({preventScroll:true});
  }

  function renderGrid() {
    const query = normalize($('#search').value.trim());
    visible = indices.filter(index => (selectedRegion === 'all' || cities[index].region === selectedRegion) && normalize([cities[index].zh,cities[index].name,cities[index].country,cities[index].landmark,cities[index].landmarkArticle].join(' ')).includes(query));
    $('#region-filters').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.region === selectedRegion)));
    $('#city-grid').innerHTML = visible.map(index => {
      const current = cities[index];
      return `<button class="city-card" data-destination="${index}" aria-pressed="${index === city}" aria-label="前往${escape(current.zh)}"><span class="card-photo"><img src="assets/${current.image}" loading="lazy" decoding="async" alt="${escape(current.zh+'城市插画')}" ><span class="card-region">${index === city ? '正在看 · ' : ''}${label(current.region)}</span><span class="card-arrow" aria-hidden="true">↗</span></span><span class="card-caption"><strong>${escape(current.zh)}</strong><span>${escape(current.name)}</span><small>${escape(current.country)} · ${escape(current.landmark)}</small></span></button>`;
    }).join('');
    $('#no-results').hidden = visible.length > 0;
    $('#city-grid').hidden = visible.length === 0;
    $('#results-count').textContent = `${visible.length} 个目的地`;
    $('#tour-region').textContent = `漫游这 ${visible.length} 座城市 →`;
    $('#tour-region').disabled = visible.length === 0;
    $('#random-atlas').disabled = visible.length === 0;
    rendered = true;
  }
  function openAtlas() {
    pause(true); busy(false); renderGrid(); $('#atlas').showModal();
    if (innerWidth <= 900 || matchMedia('(pointer:coarse)').matches) $('#atlas .close-dialog').focus({preventScroll:true});
    else $('#search').focus({preventScroll:true});
    resize();
  }
  function openDetails() {
    pause(true); busy(false);
    const current = cities[city];
    $('#detail-content').innerHTML = `<img class="detail-photo" src="assets/${current.image}" alt="${escape(current.zh+'城市插画')}"><p class="eyebrow">${label(current.region)} · ${escape(current.country)}</p><h2 id="detail-title">${escape(current.zh)}<span>${escape(current.name)}</span></h2><p class="detail-line">${escape(current.line)}</p><div class="detail-landmark">${escape(current.landmark)}<span>${escape(current.coordinates)}</span></div><div class="source-links"><a href="${escape(current.citySource)}" target="_blank" rel="noopener">城市资料 ↗</a><a href="${escape(current.landmarkSource)}" target="_blank" rel="noopener">地标资料 ↗</a></div><div class="photo-credit"><p>城市插画 · OpenAI imagegen 生成</p><p>地标与视角为艺术化表现；坐标为城市参考位置。</p><p><a href="credits.html#${current.id}" target="_blank" rel="noopener">插画与研究资料 ↗</a> · <a href="https://github.com/Digidai/takeoff/tree/main/research/illustrations-20261006" target="_blank" rel="noopener">生成记录 ↗</a></p></div>`;
    $('#place-details').showModal();
  }

  $('#browse').addEventListener('click',openAtlas);
  $('#settings-toggle').addEventListener('click',() => { $('#settings').showModal(); $('#settings .close-dialog').focus({preventScroll:true}); });
  $('#current-info').addEventListener('click',openDetails);
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click',() => $('#'+button.dataset.close).close()));
  [$('#atlas'),$('#place-details'),$('#settings')].forEach(dialog => {
    dialog.addEventListener('click',event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close',scheduleResize);
  });
  $('#search').addEventListener('input',renderGrid);
  $('#reset-search').addEventListener('click',() => { selectedRegion = 'all'; $('#search').value = ''; renderGrid(); $('#search').focus({preventScroll:true}); });
  $('#region-filters').addEventListener('click',event => {
    const button = event.target.closest('[data-region]');
    if (button) { selectedRegion = button.dataset.region; renderGrid(); }
  });
  $('#city-grid').addEventListener('click',event => {
    const button = event.target.closest('[data-destination]');
    if (!button) return;
    route = selectedRegion === 'all' ? interleave() : indices.filter(index => cities[index].region === selectedRegion);
    routeName = selectedRegion === 'all' ? '环球漫游' : label(selectedRegion)+'漫游';
    $('#atlas').close(); travel(Number(button.dataset.destination));
  });
  $('#tour-region').addEventListener('click',async () => {
    if (!visible.length) return;
    route = [...visible];
    routeName = selectedRegion === 'all' && visible.length === cities.length ? '环球漫游' : selectedRegion === 'all' ? '精选漫游' : label(selectedRegion)+'漫游';
    $('#atlas').close();
    if (await travel(route.includes(city) ? city : route[0])) play();
  });
  function flyRandom() {
    if ($('#atlas').open) {
      route = [...visible];
      routeName = selectedRegion === 'all' && visible.length === cities.length ? '环球漫游' : selectedRegion === 'all' ? '精选漫游' : label(selectedRegion)+'漫游';
    }
    const choices = route.filter(index => index !== city && !recent.includes(index));
    const candidates = choices.length ? choices : route.filter(index => index !== city);
    if ($('#atlas').open) $('#atlas').close();
    if (candidates.length) travel(candidates[Math.floor(Math.random()*candidates.length)]);
    else if (route.length) travel(route[0]);
  }
  $('#random').addEventListener('click',flyRandom);
  $('#random-atlas').addEventListener('click',flyRandom);
  $('#play').addEventListener('click',() => playing ? pause(true) : play());
  $('#prev').addEventListener('click',() => travel(nextIndex(-1)));
  $('#next').addEventListener('click',() => travel(nextIndex(1)));
  $('#pace').addEventListener('change',() => {
    const next = Number($('#pace').value);
    elapsed = elapsed/seconds*next; seconds = next; previous = 0; updateControls();
  });
  $('#sound').addEventListener('click',() => { sound = !sound; updateSound(); syncAudio(); });
  $('#immersive').addEventListener('click',() => setImmersive(true));
  $('#exit-immersive').addEventListener('click',() => setImmersive(false));
  shade.addEventListener('pointerdown',event => {
    if (!event.isPrimary || event.button !== 0) return;
    pause(); busy(false); manualPose = true; transitionToken++;
    shade.setPointerCapture(event.pointerId);
    drag = {id:event.pointerId,y:event.clientY,open:openness,moved:false};
  });
  shade.addEventListener('pointermove',event => {
    if (!drag || event.pointerId !== drag.id) return;
    const distance = (event.clientY-drag.y)/scale;
    if (Math.abs(distance) > 4) drag.moved = true;
    paint(clamp(drag.open+distance/TakeoffCabin.shadeTravel));
  });
  shade.addEventListener('pointerup',event => {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null;
    if (!moved || openness < .32) travel(nextIndex(1));
    else tween(1,360,++transitionToken,true);
  });
  shade.addEventListener('pointercancel',event => {
    if (!drag || event.pointerId !== drag.id) return;
    drag = null; tween(1,300,++transitionToken,true);
  });
  shade.addEventListener('click',event => { if (event.detail === 0) travel(nextIndex(1)); });
  document.addEventListener('keydown',event => {
    if (event.target.matches('input,textarea,select')) return;
    if ($('#atlas').open || $('#place-details').open || $('#settings').open) return;
    if (event.key === 'Escape' && immersive) { setImmersive(false); return; }
    if (event.target.tagName === 'BUTTON' && (event.key === ' ' || event.key === 'Enter')) return;
    if (event.key === '/') { event.preventDefault(); openAtlas(); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); travel(nextIndex(1)); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); travel(nextIndex(-1)); }
    else if (event.key === ' ') { event.preventDefault(); playing ? pause(true) : play(); }
  });
  document.addEventListener('visibilitychange',() => { if (document.hidden && playing) pause(true); });
  media.addEventListener('change',() => {
    if (media.matches) {
      if (playing) pause();
      arrivalAnimations.forEach(animation => animation.cancel());
      paint(1); manualPose = true;
    }
  });
  addEventListener('resize',scheduleResize);
  window.visualViewport?.addEventListener('resize',scheduleResize);
  window.visualViewport?.addEventListener('scroll',scheduleResize);
  $('#search').addEventListener('focus',scheduleResize);
  $('#search').addEventListener('blur',scheduleResize);
  new ResizeObserver(scheduleResize).observe($('#stage'));
  document.fonts.ready.then(scheduleResize);
  paint(1); updateCity(); resize();
  scene.prepare(city).catch(() => { $('#hint-text').textContent = '插画暂时未能打开，可在目录中重试。'; });
  if (params.has('autoplay') && !media.matches) play();
  window.takeoff = {scene,getAudioState:audio.getState,getState:() => ({city,cityId:cities[city].id,pendingCity,openness,playing,elapsed,sound,immersive,secondsPerCity:seconds,route:[...route],selectedRegion}),travel};
})();
