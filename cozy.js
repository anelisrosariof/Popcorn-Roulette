/* Popcorn Roulette — sounds, stickers and little interactions.
   Sits on top of the picker; never changes how it picks. */
(function () {
  document.documentElement.classList.add('js');
  const $ = (id) => document.getElementById(id);

  /* ======================= sound ======================= */
  // Everything is synthesized with Web Audio, so there are no sound files to load.
  const PREF = 'pr:sound';
  let enabled = true;
  try { enabled = localStorage.getItem(PREF) !== 'off'; } catch {}
  let ctx, master, noise;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function burst({ t = 0, dur = .04, freq = 2000, q = 1, gain = .3, type = 'bandpass', sweep } = {}) {
    const c = audio(); if (!c) return;
    const t0 = c.currentTime + t;
    const s = c.createBufferSource(); s.buffer = noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t0); g.gain.exponentialRampToValueAtTime(.0008, t0 + dur);
    s.connect(f).connect(g).connect(master);
    s.start(t0, Math.random() * .5); s.stop(t0 + dur + .02);
  }
  function tone({ t = 0, freq = 440, dur = .2, type = 'sine', gain = .2, attack = .005, slide } = {}) {
    const c = audio(); if (!c) return;
    const t0 = c.currentTime + t;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(.0008, t0 + dur);
    o.connect(g).connect(master); o.start(t0); o.stop(t0 + dur + .02);
  }
  const sfx = {
    tap() { burst({ dur: .028, freq: 3400, q: .9, gain: .22 }); tone({ freq: 880, dur: .05, type: 'triangle', gain: .05 }); },
    press() { tone({ freq: 200, slide: 85, dur: .14, gain: .32 }); burst({ dur: .05, freq: 1300, gain: .18 }); },
    tick(i) { tone({ freq: Math.max(600, 1500 - i * 55), dur: .03, type: 'square', gain: .035 }); burst({ dur: .018, freq: 5200, q: 2, gain: .12 }); },
    chime() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone({ t: i * .085, freq: f, dur: 1.3, gain: .11, attack: .01 });
        tone({ t: i * .085, freq: f * 2.01, dur: .5, gain: .025 });
      });
    },
    pops() { for (let i = 0; i < 10; i++) burst({ t: .2 + Math.random() * 1.1, dur: .02 + Math.random() * .03, freq: 500 + Math.random() * 1500, q: 3.5, gain: .3 + Math.random() * .3 }); },
    swish() { burst({ dur: .28, freq: 500, sweep: 3200, q: .7, gain: .14 }); },
    paper() { burst({ dur: .12, freq: 2400, sweep: 900, q: .5, gain: .12, type: 'highpass' }); }
  };
  const play = (name, arg) => { if (enabled) try { sfx[name](arg); } catch {} };

  const soundBtn = $('soundBtn');
  const paintSound = () => { soundBtn.querySelector('span').textContent = enabled ? 'sound on' : 'sound off'; soundBtn.setAttribute('aria-pressed', String(enabled)); };
  if (soundBtn) {
    paintSound();
    soundBtn.addEventListener('click', () => {
      enabled = !enabled;
      try { localStorage.setItem(PREF, enabled ? 'on' : 'off'); } catch {}
      paintSound(); play('chime');
    });
  }

  // one listener for every tap on the page
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, summary, .mood');
    if (!t || t === soundBtn) return;
    if (['pickBtn', 'trendBtn', 'heroSpin', 'spinAgain'].includes(t.id)) return play('press');
    if (['wlBtn', 'settingsBtn', 'wlBack', 'settingsBack'].includes(t.id)) return play('swish');
    if (t.matches('summary')) return play('paper');
    play('tap');
  });

  /* ======================= hero button ======================= */
  const heroSpin = $('heroSpin');
  if (heroSpin) heroSpin.addEventListener('click', () => {
    if (!$('setup').hidden) return $('setup').scrollIntoView({ block: 'start' });
    if ($('picker').hidden && typeof show === 'function') show('picker');
    document.querySelector('#picker > .panel').scrollIntoView({ block: 'start' });
  });

  /* the lace doily in the footer spins and rolls */
  const doily = $('spinAgain');
  if (doily) doily.addEventListener('click', () => {
    doily.classList.remove('whirl'); void doily.offsetWidth; doily.classList.add('whirl');
    setTimeout(() => doily.classList.remove('whirl'), 1700);
    if (!$('setup').hidden) return $('setup').scrollIntoView({ block: 'start' });
    if ($('picker').hidden && typeof show === 'function') show('picker');
    $('pickBtn').click();
  });

  /* ======================= result: ticks, chime, stickers ======================= */
  const out = $('out');
  if (out) {
    let ticks = 0;
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.target.id === 'slot') { play('tick', ticks++); continue; }
        if (out.querySelector('#slot') && m.addedNodes[0]?.id === 'slot') ticks = 0;
      }
      const r = out.querySelector('.result:not(.dressed)');
      if (r) {
        r.classList.add('dressed');
        // hang the poster inside a gilded oval frame
        const p = r.querySelector('img.poster');
        if (p) { const g = document.createElement('div'); g.className = 'gilt-poster'; p.replaceWith(g); g.appendChild(p); }
        r.insertAdjacentHTML('afterbegin',
          '<img class="sticker r-ticket" src="art/ticket.webp" alt="" aria-hidden="true">' +
          '<img class="sticker r-sparkle" src="art/sparkle.webp" alt="" aria-hidden="true">');
        play('chime'); play('pops');
      }
    }).observe(out, { childList: true, subtree: true });
  }

  /* ======================= gentle scroll-in ======================= */
  const els = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12 });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add('in'));
})();
