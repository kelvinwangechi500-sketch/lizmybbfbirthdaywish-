// =========================================================
//  LIZ — CHAPTER TWENTY-TWO
//  A cinematic birthday film. Everything personal lives in CONFIG.
// =========================================================

const CONFIG = {
  name: 'Liz',
  age: 22,

  // Who is the letter from? (shown at the bottom of the love letter)
  from: 'Someone who adores you',

  // 22 reasons — edit any of these to make them more personal!
  reasons: [
    'Your smile makes people forget their bad day.',
    'You make ordinary moments feel like memories.',
    'Your kindness is never loud — but it is always felt.',
    'You are braver than you give yourself credit for.',
    'Your laugh is the best sound in the room.',
    'You show up for the people you love.',
    'You are beautiful, inside and out.',
    'You make people feel safe, just by being you.',
    'Your quiet strength inspires more than you know.',
    'You listen like every word matters.',
    'You keep growing, and you glow while you do it.',
    'You turn “I can’t” into “watch me”.',
    'You are someone’s favourite person.',
    'You prove that good people still exist.',
    'Your dreams are worth chasing — and we all know it.',
    'You make people feel seen.',
    'You carry grace even on the heavy days.',
    'The world is softer with you in it.',
    'You are loved when you are busy, and loved when you rest.',
    'You are loved for who you are, not just what you do.',
    'Your story is only getting better.',
    'Because you are Liz. That is the whole reason.'
  ],

  // The love letter (paragraphs). Keep each paragraph fairly short.
  letter: [
    'Dear Liz,',
    'Today, the world celebrates the day it got you.',
    'You might not always see it, but you are loved — in the quiet ways and the loud ones, on the easy days and especially on the hard ones.',
    'You are someone’s favourite person. Someone’s reason to smile. Someone’s “I’m so glad she exists.”',
    'So take every bit of love coming your way today. You deserve all of it, and then some.'
  ],
  letterSign: 'Happy 22nd Birthday, beautiful.',

  // Movie credits (role, name). Use { small: '…' } for a soft line, { script: '…' } for big handwriting.
  credits: [
    { role: 'Starring', name: 'Liz', script: true },
    { small: 'as the girl everyone is lucky to know' },
    { role: 'Best Smile in a Leading Role', name: 'Liz' },
    { role: 'Laughter by', name: 'Liz' },
    { role: 'Kindness & Heart', name: 'Liz' },
    { role: 'Courage', name: 'Also Liz' },
    { role: 'With the endless love and support of', name: 'Your Family & Friends' },
    { small: 'and everyone who ever smiled because of you' },
    { role: 'Produced with', name: 'Way Too Much Love' },
    { role: 'Casting Director’s Note', small: 'No one else could ever have played this part.' }
  ],
  creditsEnd: 'Thank you for being you.'
};

// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const params = new URLSearchParams(location.search);
  const SPEED = Math.max(0.25, parseFloat(params.get('speed')) || 1); // ?speed=4 for quick previews

  const startScreen = $('#start-screen');
  const cinematic   = $('#cinematic');
  const intro       = $('#intro');
  const transition  = $('#transition');
  const birthday    = $('#birthday');
  const hud         = $('#hud');
  const skipBtn     = $('#skip-btn');
  const muteBtn     = $('#mute-btn');

  // ---------- timing with skip support ----------
  const SKIP = Symbol('skip');
  const pending = new Set();
  const wait = ms => new Promise((res, rej) => {
    const entry = { rej };
    entry.t = setTimeout(() => { pending.delete(entry); res(); }, ms / SPEED);
    pending.add(entry);
  });
  const cancelWaits = () => { pending.forEach(e => { clearTimeout(e.t); e.rej(SKIP); }); pending.clear(); };

  const showAct = n => $(`.act-${n}`).classList.add('active');
  const hideAct = n => $(`.act-${n}`).classList.remove('active');
  const reveal  = (sel, root = document) => { const el = typeof sel === 'string' ? $(sel, root) : sel; el && el.classList.add('show'); };
  const resetActs = () => {
    $$('.act').forEach(a => a.classList.remove('active'));
    $$('.r.show').forEach(e => e.classList.remove('show'));
  };

  // =========================================================
  //  AUDIO  (all synthesized — no files needed)
  // =========================================================
  let ac = null, master = null, muted = false;
  const NOTE = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };

  function audioInit() {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain();
      master.gain.value = 0.9;
      master.connect(ac.destination);
    } catch (e) { ac = null; }
  }

  function tone(freq, { type = 'sine', at = 0, dur = 1, vol = 0.1, att = 0.02, slide = null, lp = null } = {}) {
    if (!ac) return;
    const t = ac.currentTime + at;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); node = f; }
    node.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noiseBurst(at, dur, vol, lpFreq) {
    if (!ac) return;
    const t = ac.currentTime + at;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.value = lpFreq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }

  const sfx = {
    boom() {                                   // the "ta-dum" for the LIZ logo
      tone(65, { at: 0, dur: 1.1, vol: 0.9, att: 0.04, slide: 32, lp: 120 });
      tone(140, { type: 'triangle', at: 0.28, dur: 0.9, vol: 0.7, att: 0.04, slide: 45, lp: 300 });
      tone(1800, { at: 0.25, dur: 1.2, vol: 0.1, att: 0.06, slide: 900 });
      noiseBurst(0.28, 0.2, 0.35, 800);
      // a warm major chord blooms after the hit
      [261.63, 329.63, 392, 523.25].forEach((f, i) => tone(f, { at: 0.6 + i * 0.05, dur: 2.6, vol: 0.05, att: 0.4 }));
    },
    tick(n) {
      const f = 180 + n * 12;
      tone(f, { dur: 0.18, vol: 0.06 + (n / 22) * 0.12, att: 0.015, slide: f * 0.6 });
      if (n >= 20) tone(60 + n, { dur: 0.4, vol: 0.15, att: 0.02 });
    },
    chime(freq) { tone(freq, { dur: 1.6, vol: 0.12, att: 0.03 }); tone(freq * 2, { dur: 1.2, vol: 0.03, att: 0.03 }); },
    chord() { [261.63, 329.63, 392, 523.25].forEach((f, i) => tone(f, { at: i * 0.07, dur: 2.1, vol: 0.1, att: 0.08 })); },
    whoosh() { noiseBurst(0, 0.5, 0.12, 2400); },
    pad(secs = 14) {
      [130.81, 164.81, 196, 261.63].forEach(f => tone(f, { dur: secs, vol: 0.03, att: 2.5, lp: 600 }));
    },
    heartbeat(times = 4) {
      for (let i = 0; i < times; i++) {
        const t = i * 1.4;
        tone(70, { at: t, dur: 0.22, vol: 0.5, att: 0.01, slide: 40 });
        tone(62, { at: t + 0.2, dur: 0.22, vol: 0.38, att: 0.01, slide: 38 });
      }
    },
    pop() { tone(880, { dur: 0.25, vol: 0.06, att: 0.01, slide: 1500 }); },
    musicBox() {                               // “Happy Birthday”, music-box style
      const melody = [
        ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
        ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
        ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
        ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]
      ];
      const beat = 0.44;
      let t = 0.1;
      melody.forEach(([n, b]) => {
        const f = NOTE[n];
        tone(f,     { at: t, dur: 1.5, vol: 0.12, att: 0.005 });
        tone(f * 2, { at: t, dur: 0.9, vol: 0.04, att: 0.005 });
        tone(f * 3, { at: t, dur: 0.4, vol: 0.015, att: 0.005 });
        t += b * beat;
      });
      return t; // seconds
    }
  };

  // =========================================================
  //  FX: floating particles, hearts, confetti
  // =========================================================
  const canvas = $('#fx');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1, fxOn = false, heartMode = 0;
  const parts = [];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const PALETTE = ['#ff4d79', '#ff8fb1', '#ffc2d1', '#ffd27a', '#fff3c9', '#e0245e'];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function ember() {
    return { kind: 'dot', x: rand(0, W), y: H + 20, vx: rand(-.15, .15), vy: -rand(.15, .8), g: 0,
             size: rand(.6, 2.8), life: 1, decay: rand(.0012, .0035), color: pick(['#ffd27a', '#ff8fb1', '#ff4d79']), rot: 0, vr: 0, max: rand(.2, .6) };
  }
  function heart(x, y, o = {}) {
    return { kind: 'heart', x, y, vx: o.vx ?? rand(-.4, .4), vy: o.vy ?? -rand(.6, 1.6), g: o.g ?? 0,
             size: o.size ?? rand(10, 26), life: 1, decay: o.decay ?? rand(.004, .009), color: pick(PALETTE),
             rot: rand(-.4, .4), vr: rand(-.01, .01), max: 1, sway: rand(0, 6.28) };
  }
  function bit(x, y) {
    const a = rand(0, Math.PI * 2), s = rand(3, 11);
    return { kind: 'bit', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, g: .22,
             size: rand(5, 10), life: 1, decay: rand(.006, .012), color: pick(PALETTE), rot: rand(0, 6), vr: rand(-.3, .3), max: 1 };
  }
  function sparkle(x, y) {
    const a = rand(0, Math.PI * 2), s = rand(.5, 3.2);
    return { kind: 'star', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0, size: rand(3, 8), life: 1, decay: rand(.012, .025),
             color: pick(['#fff3c9', '#ffd27a', '#ffc2d1']), rot: 0, vr: .05, max: 1 };
  }

  function burst(x, y, { hearts = 14, bits = 0, stars = 14 } = {}) {
    for (let i = 0; i < hearts; i++) { const a = rand(0, Math.PI * 2), s = rand(1.5, 6); parts.push(heart(x, y, { vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, g: .03, size: rand(12, 30), decay: rand(.006, .012) })); }
    for (let i = 0; i < bits; i++) parts.push(bit(x, y));
    for (let i = 0; i < stars; i++) parts.push(sparkle(x, y));
  }
  function confettiRain(n = 90) {
    for (let i = 0; i < n; i++) { const p = bit(rand(0, W), rand(-H * .3, -10)); p.vx = rand(-1.2, 1.2); p.vy = rand(1, 4); p.g = .02; p.decay = .003; parts.push(p); }
  }

  function drawStar(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .25 : r; const a = i * Math.PI / 4; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }

  function fxLoop() {
    if (!fxOn) return;
    ctx.clearRect(0, 0, W, H);

    // ambient embers always; extra hearts in love mode
    if (parts.length < 160 && Math.random() < .35) parts.push(ember());
    if (heartMode && Math.random() < .06 * heartMode) parts.push(heart(rand(0, W), H + 30, { vy: -rand(.7, 1.9), size: rand(10, 30), decay: rand(.0015, .004) }));

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx + (p.sway !== undefined ? Math.sin(p.sway += .03) * .5 : 0);
      p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life -= p.decay;
      if (p.kind === 'bit') { p.vx *= .985; }
      if (p.life <= 0 || p.y < -40 || p.y > H + 60) { parts.splice(i, 1); continue; }
      const a = Math.max(0, Math.min(1, p.life)) * (p.kind === 'dot' ? p.max : 1);
      ctx.globalAlpha = a; ctx.fillStyle = p.color;
      if (p.kind === 'dot') {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
        ctx.globalAlpha = a * .12; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, 6.283); ctx.fill();
      } else if (p.kind === 'heart') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.font = `${p.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = p.color; ctx.shadowBlur = 12; ctx.fillText('♥', 0, 0); ctx.restore();
      } else if (p.kind === 'bit') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore();
      } else if (p.kind === 'star') {
        drawStar(p.x, p.y, p.size * Math.max(.2, p.life));
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(fxLoop);
  }
  function startFx() { if (fxOn) return; fxOn = true; for (let i = 0; i < 70; i++) { const e = ember(); e.y = rand(0, H); parts.push(e); } fxLoop(); }

  // =========================================================
  //  BUILD DYNAMIC CONTENT FROM CONFIG
  // =========================================================
  function buildStartHearts() {
    const wrap = $('.start-hearts');
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.textContent = '♥';
      s.style.left = rand(0, 100) + '%';
      s.style.fontSize = rand(12, 34) + 'px';
      s.style.animationDuration = rand(9, 18) + 's';
      s.style.animationDelay = (-rand(0, 18)) + 's';
      wrap.appendChild(s);
    }
  }

  function buildOrbit() {
    const orbit = $('.orbit');
    const n = 8;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.textContent = i % 2 ? '✦' : '♥';
      s.style.fontSize = (i % 2 ? 16 : 20) + 'px';
      const ang = (i / n) * Math.PI * 2;
      s.style.left = (50 + Math.cos(ang) * 50) + '%';
      s.style.top  = (50 + Math.sin(ang) * 50) + '%';
      s.style.marginLeft = s.style.marginTop = '-10px';
      if (i % 2) s.style.color = 'var(--gold)';
      orbit.appendChild(s);
    }
  }

  function buildDots() {
    const wrap = $('#reason-dots');
    CONFIG.reasons.forEach(() => wrap.appendChild(document.createElement('i')));
  }

  function buildCredits() {
    const roll = $('#credits-roll');
    CONFIG.credits.forEach(c => {
      if (c.role) { const d = document.createElement('div'); d.className = 'cr-role'; d.textContent = c.role; roll.appendChild(d); }
      if (c.name) { const d = document.createElement('div'); d.className = 'cr-name' + (c.script ? ' script' : ''); d.textContent = c.name; roll.appendChild(d); }
      if (c.small) { const d = document.createElement('div'); d.className = 'cr-small'; d.textContent = c.small; roll.appendChild(d); }
    });
    const end = document.createElement('div'); end.className = 'cr-end'; end.textContent = CONFIG.creditsEnd; roll.appendChild(end);
  }

  const letterEl = $('#letter');
  let typedChars = [];
  function buildLetter() {
    letterEl.innerHTML = '';
    typedChars = [];
    const addPara = (text, cls) => {
      const p = document.createElement('p');
      if (cls) p.className = cls;
      [...text].forEach(ch => {
        const s = document.createElement('span');
        s.className = 'ch'; s.textContent = ch;
        p.appendChild(s); typedChars.push(s);
      });
      letterEl.appendChild(p);
    };
    CONFIG.letter.forEach(t => addPara(t));
    addPara(CONFIG.letterSign, '');
    const sign = document.createElement('p'); sign.className = 'sign';
    [...('With all my love, ' + CONFIG.from + ' ♥')].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; sign.appendChild(s); typedChars.push(s); });
    letterEl.appendChild(sign);
  }

  buildStartHearts(); buildOrbit(); buildDots(); buildCredits(); buildLetter();

  // =========================================================
  //  START
  // =========================================================
  $('#start-btn').addEventListener('click', () => {
    audioInit();
    startScreen.style.transition = 'opacity .8s ease';
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.classList.add('hidden');
      cinematic.classList.remove('hidden');
      hud.classList.add('on');
      run();
    }, 800);
  });

  muteBtn.addEventListener('click', () => {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.9;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });
  skipBtn.addEventListener('click', () => { skipBtn.classList.add('hide'); cancelWaits(); });
  $('#replay-btn').addEventListener('click', () => location.reload());

  // =========================================================
  //  THE FILM
  // =========================================================
  async function run() {
    try {
      await sceneIntro();
      await sceneStory();
    } catch (e) {
      if (e !== SKIP) throw e;
      // skipped → jump straight to the heart of it
      resetActs();
      if (birthday.classList.contains('show') === false) {
        intro.classList.add('fade-out'); transition.classList.remove('active');
        birthday.classList.add('show'); startFx();
      }
    }
    try {
      skipBtn.classList.add('hide');
      await sceneWish();
      await sceneLetter();
      await sceneFinale();
    } catch (e) { if (e !== SKIP) throw e; }
  }

  // ---------- logo intro ----------
  async function sceneIntro() {
    await wait(500);
    $('.intro-flare').classList.add('go');
    await wait(260);
    $('.logo-wrap').classList.add('slam');
    sfx.boom();
    await wait(900);
    $('.logo-sub').classList.add('show');
    await wait(2300);
    intro.classList.add('fade-out');
    await wait(850);
    transition.classList.add('active');
    await wait(450);
    birthday.classList.add('show');
    startFx();
    await wait(350);
    transition.classList.remove('active');
    await wait(500);
  }

  // ---------- story: prologue → countdown → title → photo → reasons → credits ----------
  async function sceneStory() {
    // Act 1
    showAct(1); await wait(300);
    reveal('.act-1 [data-i="1"]'); await wait(1700);
    reveal('.act-1 [data-i="2"]'); sfx.chime(392); await wait(2300);
    hideAct(1); await wait(700);

    // Act 2
    showAct(2); await wait(300);
    reveal('.act-2 [data-i="1"]'); await wait(1500);
    reveal('.act-2 [data-i="2"]'); sfx.chime(494); await wait(2500);
    hideAct(2); await wait(700);

    // Act 3 — countdown
    showAct(3); await wait(400);
    for (let i = 1; i <= CONFIG.age; i++) {
      await showNumber(i);
      let d = i < 10 ? 150 : i < 16 ? 210 : i < 20 ? 310 : i === 20 ? 440 : i === 21 ? 620 : 900;
      await wait(d);
    }
    await wait(800);
    hideAct(3); await wait(700);

    // Act 4 — the big 22
    showAct(4); await wait(250);
    $$('.digit').forEach(d => d.classList.add('show'));
    sfx.chord(); burstAt(.5, .45, { hearts: 10, stars: 26 });
    await wait(900);
    reveal('.twenty-two-label'); await wait(2800);
    hideAct(4); await wait(700);

    // Act 5 — title
    showAct(5); await wait(300);
    $$('.main-title .word')[0].classList.add('show'); sfx.chime(440); await wait(700);
    $$('.main-title .word')[1].classList.add('show'); sfx.chime(554); await wait(900);
    $('.name').classList.add('show'); sfx.chord(); burstAt(.5, .62, { hearts: 18, stars: 30 });
    await wait(800); reveal('.title-heart'); await wait(2400);
    hideAct(5); await wait(700);

    // Act 6 — photo
    showAct(6); await wait(250);
    $('.photo-container').classList.add('show'); sfx.chime(659); sfx.whoosh();
    await wait(1300); burstAt(.5, .4, { hearts: 12, stars: 24 });
    await wait(900); reveal('.photo-caption'); sfx.chime(784);
    await wait(4300);
    hideAct(6); await wait(700);

    // Act 7 — 22 reasons
    await sceneReasons();
    await wait(700);

    // Act 8 — credits
    await sceneCredits();
  }

  async function showNumber(n) {
    const num = $('#count-num'), label = $('#count-label'), ring = $('#ring-fg');
    num.className = ''; void num.offsetWidth;
    num.textContent = n;
    if (n >= 18) num.classList.add('stage-final');
    else if (n >= 12) num.classList.add('stage-high');
    else if (n >= 6) num.classList.add('stage-mid');
    num.classList.add('pop');
    ring.style.strokeDashoffset = (282.74 * (1 - n / CONFIG.age)).toFixed(2);
    sfx.tick(n);

    const labels = { 1: 'where it all began', 10: 'look how far you’ve come', 16: 'sweet sixteen', 18: 'all grown up', 21: 'one more…' };
    if (labels[n]) { label.textContent = labels[n]; label.classList.add('show'); }
    else label.classList.remove('show');
    if (n === CONFIG.age) { label.classList.remove('show'); burstAt(.5, .5, { hearts: 0, stars: 20 }); }
  }

  async function sceneReasons() {
    showAct(7); await wait(300);
    reveal('.reasons-kicker'); await wait(900);
    const numEl = $('#reason-num'), textEl = $('#reason-text'), dots = $$('#reason-dots i');
    const total = CONFIG.reasons.length;
    for (let i = 0; i < total; i++) {
      const fast = i >= 8;                       // starts slow & tender, then quickens
      const last = i === total - 1;
      textEl.classList.remove('in');
      textEl.classList.toggle('fast', fast);
      await wait(fast ? 220 : 480);
      numEl.textContent = i + 1;
      textEl.textContent = CONFIG.reasons[i];
      textEl.classList.toggle('last', last);
      void textEl.offsetWidth;
      textEl.classList.add('in');
      dots[i].classList.add('on');
      if (i % 3 === 0 || last) sfx.chime(NOTE[['C5', 'E5', 'G5', 'A4', 'D5'][i % 5]] * (last ? 1 : .5));
      if (last) { burstAt(.5, .5, { hearts: 20, stars: 20 }); heartMode = 1; }
      else if (i % 4 === 3) burstAt(rand(.25, .75), rand(.3, .6), { hearts: 4, stars: 6 });
      await wait(last ? 4200 : fast ? 1250 : i < 3 ? 2900 : 2400);
    }
    heartMode = 0;
    hideAct(7);
  }

  async function sceneCredits() {
    showAct(8); await wait(400);
    const roll = $('#credits-roll');
    const dist = roll.offsetHeight + window.innerHeight;
    const dur = Math.max(14000, dist * 14) / SPEED;       // ~14ms per px
    roll.style.transform = `translateY(${window.innerHeight}px)`;
    const anim = roll.animate(
      [{ transform: `translateY(${window.innerHeight}px)` }, { transform: `translateY(${-roll.offsetHeight}px)` }],
      { duration: dur, easing: 'linear', fill: 'forwards' }
    );
    sfx.pad(Math.min(20, dur / 1000));
    try { await wait(dur * SPEED - 600); }
    finally { anim.cancel(); }
    hideAct(8); await wait(800);
  }

  // ---------- make a wish ----------
  async function sceneWish() {
    showAct(9); await wait(300);
    reveal('.wish-title'); sfx.chime(523);
    const cake = $('#candle-btn'), hint = $('#wish-hint');
    let blown = false;
    const blow = () => {
      if (blown) return; blown = true;
      cake.classList.add('out'); hint.classList.add('gone');
      sfx.pop(); sfx.whoosh();
      const r = cake.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * .25, { hearts: 22, bits: 70, stars: 30 });
      confettiRain(90);
      sfx.chord();
    };
    cake.addEventListener('click', blow);
    const wake = new Promise(res => { cake.addEventListener('click', res, { once: true }); });
    await Promise.race([wake, wait(16000)]);     // auto-blows if she doesn't tap
    blow();
    await wait(1400);
    reveal('#wish-after'); sfx.chime(659);
    await wait(4600);
    hideAct(9); await wait(900);
  }

  // ---------- the letter ----------
  async function sceneLetter() {
    showAct(10); await wait(1200);
    const total = sfx.musicBox();                // Happy Birthday, music-box style
    let skipTyping = false;
    letterEl.addEventListener('click', () => { skipTyping = true; }, { once: true });

    const perChar = 34;
    for (let i = 0; i < typedChars.length; i++) {
      typedChars[i].classList.add('on');
      if (skipTyping) { typedChars.slice(i).forEach(c => c.classList.add('on')); break; }
      const ch = typedChars[i].textContent;
      await wait(ch === '.' || ch === '—' ? perChar * 7 : ch === ',' ? perChar * 4 : ch === ' ' ? perChar * .9 : perChar);
    }
    await wait(4200);
    hideAct(10); await wait(1000);
  }

  // ---------- finale ----------
  async function sceneFinale() {
    showAct(11); await wait(400);
    reveal('#big-heart'); sfx.heartbeat(4); heartMode = 1.6;
    burstAt(.5, .3, { hearts: 22, stars: 30 });
    await wait(1100);
    reveal('.love-title'); sfx.chord();
    await wait(1300); reveal('.love-sub');
    await wait(1100); reveal('.love-bday'); sfx.pad(16);
    await wait(1200); reveal('.finale-actions'); reveal('.finale-hint');

    // tap anywhere = more love
    $('.act-11').addEventListener('pointerdown', e => {
      if (e.target.closest('#replay-btn')) return;
      burst(e.clientX, e.clientY, { hearts: 9, stars: 12 });
      sfx.chime(pick([523, 659, 784, 880]));
    });
    $('#love-btn').addEventListener('click', e => {
      e.stopPropagation();
      sfx.chord(); confettiRain(60);
      for (let i = 0; i < 6; i++) setTimeout(() => burst(rand(W * .15, W * .85), rand(H * .2, H * .7), { hearts: 10, stars: 14 }), i * 180);
    });
  }

  function burstAt(fx, fy, opts) { burst(W * fx, H * fy, opts); }
});
