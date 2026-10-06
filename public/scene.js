(function () {
  'use strict';
  const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
  const smooth = x => x*x*(3-2*x);
  const keys = [
    [0,1,0],[2.933,1,0],[3.7,0,0],[4.4,0,1],[5.2,1,1],
    [6.533,1,1],[7.3,0,1],[8.1,0,2],[8.9,1,2],
    [10.533,1,2],[11.3,0,2],[12.2,0,3],[13,1,3],
    [14.567,1,3],[15.333,0,3],[16.367,0,4],[17.167,1,4],
    [18.667,1,4],[19.467,0,4],[20.267,0,0],[21.067,1,0],
    [23.733,1,0],[24,.82,0],[24.4,.63,0],[25.167,.14,0],[25.533,.14,0],
    [26.5,.93,0],[27.2,.93,0],[28.133,.55,0],[29.533,.55,0],[30.7,0,0],
    [33.467,0,1],[34.2,1,1],[37.867,1,1],[38.667,0,1],[39.5,0,1]
  ];
  const captionEvents=[
    [0,1,false],[2.933,0,false],[4.4,1,true],[6.533,0,false],
    [8.1,1,true],[10.533,0,false],[12.2,1,true],[14.567,0,false],
    [16.367,1,true],[18.667,0,false],[20.267,1,true],[23.733,0,false],
    [25.533,1,false],[27.2,0,false],[33.467,1,true],[37.867,0,false]
  ];
  function timelineAt(t) {
    t=clamp(t,0,39.5);
    let i=0;
    while(i<keys.length-1 && t>=keys[i+1][0]) i++;
    const a=keys[i],b=keys[Math.min(i+1,keys.length-1)];
    const p=b[0]===a[0]?0:smooth(clamp((t-a[0])/(b[0]-a[0])));
    let event=captionEvents[0];
    for(const candidate of captionEvents){if(candidate[0]>t)break;event=candidate;}
    const dt=t-event[0],opening=event[1]===1,enter=1-Math.pow(1-clamp(dt/.48),3);
    return {
      city:a[2],openness:a[1]+(b[1]-a[1])*p,
      titleOpacity:event[0]===0?1:opening?enter:1-clamp(dt/.3),
      titleOffset:event[0]===0?0:opening?8*(1-clamp(dt/.6))**3:0,
      coordinateProgress:event[2]?clamp((dt-.2)/1):1
    };
  }
  function mount(container,options={}) {
    const cities=options.cities||window.TakeoffCities;
    const assetBase=options.assetBase || 'assets/';
    const element=document.createElement('div');
    element.className='takeoff-scene';
    element.innerHTML=`<div class="scene-background"></div><div class="scene-text"><h1 class="scene-title">Shanghai</h1><p class="scene-coordinates"><span class="scene-coordinate-inner"></span></p></div>
      <svg class="window-art" viewBox="0 0 212 292" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="window-outline" d="M106 1 C175 1 211 16 211 75 L211 194 C211 253 177 291 106 291 C35 291 1 253 1 194 L1 75 C1 16 37 1 106 1Z"/>
          <clipPath id="window-clip"><use href="#window-outline"/></clipPath>
          <clipPath id="photo-clip"><path d="M106 22 C164 22 190 28 190 71 L190 204 C190 246 159 267 106 267 C53 267 22 246 22 204 L22 71 C22 28 48 22 106 22Z"/></clipPath>
          <linearGradient id="rim-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#35261d"/><stop id="rim-mid" offset=".6" stop-color="#79543e"/><stop id="rim-end" offset="1" stop-color="#bd8557"/></linearGradient>
          <linearGradient id="shade-gradient" x1="0" y1="0" x2="0" y2="1"><stop id="shade-top" offset="0" stop-color="#241b15"/><stop id="shade-bottom" offset="1" stop-color="#140f0b"/></linearGradient>
          <radialGradient id="handle-gradient"><stop id="handle-light" offset="0" stop-color="#9c724c"/><stop offset="1" stop-color="#201a15"/></radialGradient>
          <filter id="glow-blur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="26"/></filter>
          <filter id="near-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
        </defs>
        <use class="window-glow" href="#window-outline" fill="none" stroke="#c9834c" stroke-width="18" filter="url(#glow-blur)"/>
        <use class="window-near-glow" href="#window-outline" fill="none" stroke="#c9834c" stroke-width="5" filter="url(#near-blur)"/>
        <use href="#window-outline" fill="#090807"/>
        <use class="lit-rim" href="#window-outline" fill="url(#rim-gradient)" stroke="#1d150e" stroke-width="2"/>
        <g clip-path="url(#photo-clip)">
          <rect x="22" y="22" width="168" height="252" fill="#6b6359"/>
          ${(options.preloadAll?cities:cities.slice(0,1)).map((c,i)=>`<image class="city-photo" data-index="${i}" href="${assetBase+c.image}" x="22" y="22" width="168" height="238" preserveAspectRatio="${c.imageKind==='original'?'none':c.align||'xMidYMid slice'}" opacity="${i===0?1:0}"/>`).join('')}
        </g>
        <g clip-path="url(#window-clip)"><g class="window-shade">
          <path d="M-5 50 C1 18 33 0 106 0 C179 0 211 18 217 50 L217 365 L-5 365Z" fill="url(#shade-gradient)"/>
          <ellipse cx="106" cy="20" rx="37" ry="4.6" fill="url(#handle-gradient)" opacity=".58"/>
          <path d="M69 19.2 Q106 27.7 143 19.2" fill="none" stroke="#8e7864" stroke-opacity=".1" stroke-width=".8"/>
        </g></g>
        <use href="#window-outline" fill="none" stroke="#e7d1ae" stroke-opacity=".055" stroke-width="1.4"/>
      </svg><div class="scene-grain"></div>`;
    container.appendChild(element);
    const $=s=>element.querySelector(s);
    const photos=[...element.querySelectorAll('.city-photo')];
    const state={city:0,openness:1};
    let photoCity=-1;
    const prepared=new Map();
    function prepare(index){
      index=((index%cities.length)+cities.length)%cities.length;
      if(!prepared.has(index))prepared.set(index,new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{prepared.delete(index);reject(new Error('Could not load '+cities[index].zh));};img.src=assetBase+cities[index].image;
      }));
      return prepared.get(index);
    }
    function setState(next={}) {
      Object.assign(state,next);
      if(!Number.isInteger(state.city))state.city=0;
      state.city=((state.city%cities.length)+cities.length)%cities.length;
      const city=cities[state.city],o=clamp(state.openness),light=Math.pow(o,.68);
      element.dataset.city=city.name;
      element.dataset.openness=o.toFixed(4);
      $('.scene-title').textContent=city.name;
      $('.scene-coordinate-inner').textContent=city.coordinates;
      $('.scene-text').style.opacity=String(next.titleOpacity ?? clamp((o-.46)/.42));
      $('.scene-text').style.transform=`translateY(${next.titleOffset??0}px)`;
      $('.scene-coordinate-inner').style.clipPath=`inset(0 ${(1-(next.coordinateProgress??1))*100}% 0 0)`;
      $('.scene-background').style.opacity=light;
      $('.scene-grain').style.opacity=.013*light;
      if(photoCity!==state.city){
        if(options.preloadAll)photos.forEach((p,i)=>p.setAttribute('opacity',i===state.city?1:0));
        else {photos[0].setAttribute('href',assetBase+city.image);photos[0].setAttribute('preserveAspectRatio',city.imageKind==='original'?'none':city.align||'xMidYMid slice');}
        photoCity=state.city;
      }
      $('.window-shade').setAttribute('transform',`translate(0 ${244*o})`);
      $('.window-glow').setAttribute('stroke',city.tone);
      $('.window-glow').setAttribute('opacity',.76*light+.015);
      $('.window-near-glow').setAttribute('stroke',city.tone);
      $('.window-near-glow').setAttribute('opacity',.35*light+.01);
      $('.lit-rim').setAttribute('opacity',light);
      $('#rim-mid').setAttribute('stop-color',city.rim);
      $('#rim-end').setAttribute('stop-color',city.tone);
      $('#shade-top').setAttribute('stop-color',`rgb(${9+31*light},${9+21*light},${9+15*light})`);
      $('#shade-bottom').setAttribute('stop-color',`rgb(${3+30*light},${3+20*light},${3+13*light})`);
      $('#handle-light').setAttribute('stop-color',city.rim);
      $('.window-shade ellipse').setAttribute('opacity',.13+.45*light);
      return {...state};
    }
    function seek(t) { return setState(timelineAt(t)); }
    setState(state);
    return {element,setState,seek,prepare,getState:()=>({...state}),destroy:()=>element.remove()};
  }
  function tourAt(t,route,seconds=5){
    const index=Math.floor(Math.max(0,t)/seconds)%route.length,phase=Math.max(0,t)%seconds;
    const open=seconds*.16,closeAt=seconds*.7,close=seconds*.14;
    const openness=phase<open?smooth(phase/open):phase<closeAt?1:phase<closeAt+close?1-smooth((phase-closeAt)/close):0;
    return {city:route[index],openness,titleOpacity:phase<closeAt?1-(1-clamp(phase/.45))**3:1-clamp((phase-closeAt)/.3),titleOffset:8*(1-clamp(phase/.6))**3,coordinateProgress:clamp((phase-.2)/.8),routeIndex:index};
  }
  window.TakeoffScene={mount,cities:window.TakeoffCities,timelineAt,tourAt,duration:39.5};
})();
