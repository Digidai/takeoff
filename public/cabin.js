(function () {
  'use strict';
  let nextId = 0;
  const clamp = value => Math.max(0, Math.min(1, value));

  function mount(container, options = {}) {
    const cities = options.cities || window.TakeoffCities;
    const assetBase = options.assetBase || 'assets/';
    const prefix = 'cabin-' + nextId++;
    const element = document.createElement('div');
    element.className = 'cabin-scene';
    element.innerHTML = `<svg class="window-art" viewBox="0 0 212 292" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <path id="${prefix}-outer" d="M106 1C175 1 211 16 211 75V194C211 253 177 291 106 291S1 253 1 194V75C1 16 37 1 106 1Z"/>
        <path id="${prefix}-glass" d="M106 22C164 22 190 28 190 71V204C190 246 159 267 106 267S22 246 22 204V71C22 28 48 22 106 22Z"/>
        <clipPath id="${prefix}-clip"><use href="#${prefix}-glass"/></clipPath>
        <clipPath id="${prefix}-outer-clip"><use href="#${prefix}-outer"/></clipPath>
        <linearGradient id="${prefix}-frame" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#37312b"/><stop offset=".6" stop-color="#78634d"/><stop offset="1" stop-color="#ad885b"/></linearGradient>
        <linearGradient id="${prefix}-shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#252726"/><stop offset="1" stop-color="#111516"/></linearGradient>
        <radialGradient id="${prefix}-handle"><stop stop-color="#8c755a"/><stop offset="1" stop-color="#272522"/></radialGradient>
        <filter id="${prefix}-glow" x="-90%" y="-70%" width="280%" height="240%"><feGaussianBlur stdDeviation="21"/></filter>
      </defs>
      <use href="#${prefix}-outer" fill="none" stroke="#c5a175" stroke-width="12" opacity=".28" filter="url(#${prefix}-glow)"/>
      <use href="#${prefix}-outer" fill="url(#${prefix}-frame)" stroke="#282523" stroke-width="1.6"/>
      <g clip-path="url(#${prefix}-clip)">
        <rect x="22" y="22" width="168" height="252" fill="#1a2023"/>
        <image class="city-photo" x="22" y="22" width="168" height="245" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <g clip-path="url(#${prefix}-outer-clip)"><g class="window-shade">
        <path d="M-5 50C1 18 33 0 106 0S211 18 217 50V365H-5Z" fill="url(#${prefix}-shade)"/>
        <ellipse cx="106" cy="20" rx="37" ry="4.6" fill="url(#${prefix}-handle)" opacity=".66"/>
        <path d="M69 19.2Q106 27.7 143 19.2" fill="none" stroke="#bcab94" stroke-opacity=".15" stroke-width=".8"/>
      </g></g>
      <use href="#${prefix}-outer" fill="none" stroke="#e3cdae" stroke-opacity=".12" stroke-width=".7"/>
    </svg>`;
    container.prepend(element);
    const art = element.querySelector('.window-art');
    const photo = element.querySelector('.city-photo');
    const shade = element.querySelector('.window-shade');
    const state = { city:0, openness:1 };
    const prepared = new Map();
    const loaded = new Set();
    let photoCity = -1;

    function prepare(index) {
      index = ((index % cities.length) + cities.length) % cities.length;
      if (prepared.has(index)) {
        const cached = prepared.get(index);
        prepared.delete(index); prepared.set(index,cached);
        return cached;
      }
      const promise = new Promise((resolve, reject) => {
        const image = new Image();
        let settled = false;
        const timeout = setTimeout(() => fail(), 15000);
        const fail = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout); image.onload = image.onerror = null;
          if (prepared.get(index) === promise) prepared.delete(index);
          reject(new Error('Could not load ' + cities[index].zh));
        };
        image.onerror = fail;
        image.onload = async () => {
          try {
            if (image.decode) await image.decode();
            if (settled) return;
            settled = true; clearTimeout(timeout);
            if (prepared.get(index) === promise) loaded.add(index);
            if (state.city === index) element.dataset.ready = 'true';
            resolve(image);
          } catch { fail(); }
        };
        image.src = assetBase + cities[index].image;
      });
      prepared.set(index,promise);
      // Bound retained decoded artwork during long mobile tours.
      while (prepared.size > 8) {
        const oldest = [...prepared.keys()].find(key => key !== state.city && key !== index);
        prepared.delete(oldest); loaded.delete(oldest);
      }
      return prepared.get(index);
    }

    function setState(next = {}) {
      Object.assign(state, next);
      state.city = ((state.city % cities.length) + cities.length) % cities.length;
      state.openness = clamp(state.openness);
      element.dataset.city = cities[state.city].name;
      element.dataset.openness = state.openness.toFixed(4);
      shade.setAttribute('transform', `translate(0 ${(244 * state.openness).toFixed(3)})`);
      if (state.city !== photoCity) {
        photo.setAttribute('href', assetBase + cities[state.city].image);
        photo.setAttribute('preserveAspectRatio', cities[state.city].align || 'xMidYMid slice');
        element.dataset.ready = String(loaded.has(state.city));
        photoCity = state.city;
      }
      return {...state};
    }

    return { element, art, setState, prepare, isPrepared:index => loaded.has(index) && prepared.has(index), getState:() => ({...state}), getCacheSize:() => prepared.size, destroy:() => element.remove() };
  }
  window.TakeoffCabin = { mount, width:320, height:440, shadeTravel:244*320/212 };
})();
