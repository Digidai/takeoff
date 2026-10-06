(function (root) {
  'use strict';
  const sampleRate = 24000;
  const loopSeconds = 24;

  // Original synthesis: a quiet cabin wash and three slowly breathing tones.
  // Integer cycles and an overlap at the loop boundary avoid an audible seam.
  function createSamples() {
    const length = sampleRate * loopSeconds;
    const overlap = Math.round(sampleRate * 0.12);
    const raw = new Float32Array(length + overlap);
    let seed = 20261006, filtered = 0;
    for (let i = 0; i < raw.length; i++) {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      const noise = (seed >>> 0) / 4294967296 * 2 - 1;
      filtered = filtered * 0.97 + noise * 0.03;
      const t = i / sampleRate, phase = Math.PI * 2 * t;
      const breath = 0.75 - 0.25 * Math.cos(phase / loopSeconds);
      const tones = Math.sin(phase * 110) * 0.022
        + Math.sin(phase * (3956 / loopSeconds)) * 0.014
        + Math.sin(phase * 220) * 0.007;
      raw[i] = filtered * 0.2 + tones * breath;
    }
    const samples = raw.slice(0, length);
    for (let i = 0; i < overlap; i++) {
      const mix = i / overlap;
      samples[i] = raw[length + i] * (1 - mix) + raw[i] * mix;
    }
    const difference = samples[0] - samples[length - 1];
    for (let i = 0; i < overlap; i++) {
      const mix = (i + 1) / overlap;
      samples[length - overlap + i] += difference * mix * mix * (3 - 2 * mix);
    }
    return samples;
  }

  function create() {
    let context, gain, analyser, source, wanted = false, revision = 0, timer;
    function initialize() {
      const AudioContext = root.AudioContext || root.webkitAudioContext;
      if (!AudioContext) throw new Error('Web Audio is unavailable');
      context = new AudioContext();
      const samples = createSamples();
      const buffer = context.createBuffer(1, samples.length, sampleRate);
      buffer.copyToChannel(samples, 0);
      source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      gain = context.createGain(); gain.gain.value = 0;
      analyser = context.createAnalyser(); analyser.fftSize = 2048;
      source.connect(gain); gain.connect(analyser); analyser.connect(context.destination);
      source.start();
    }
    async function setActive(active) {
      wanted = Boolean(active);
      const request = ++revision;
      clearTimeout(timer);
      if (!wanted) {
        if (!context) return;
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setTargetAtTime(0, context.currentTime, 0.045);
        timer = setTimeout(() => {
          if (revision === request && !wanted) context.suspend().catch(() => {});
        }, 260);
        return;
      }
      if (!context) initialize();
      await context.resume();
      if (revision !== request || !wanted) return;
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0.8, context.currentTime, 0.09);
    }
    function getState() {
      let level = 0;
      if (analyser && context.state === 'running') {
        const samples = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(samples);
        level = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
      }
      return { active: wanted && context?.state === 'running', context: context?.state || 'uninitialized', level };
    }
    return { setActive, getState };
  }
  root.TakeoffAmbient = Object.freeze({ create, createSamples, sampleRate, loopSeconds });
})(globalThis);
