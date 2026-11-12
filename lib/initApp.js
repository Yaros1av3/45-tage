/* Mein 45-Tage-Weg – App-Logik (läuft nur im Browser, alles lokal gespeichert) */
import { icon, PH_ICONS } from './icons';

// Farbthemen: die eigentlichen Farben stehen in globals.css, hier nur Name + Farbproben
export const THEMES = [
  { id: 'pfirsich',  name: 'Pfirsich',  bg: '#fff6f0', a: '#d4553a', d: '#3d9a8b' },
  { id: 'salbei',    name: 'Salbei',    bg: '#f3f6ef', a: '#4a7656', d: '#c9a24b' },
  { id: 'lavendel',  name: 'Lavendel',  bg: '#f6f3fb', a: '#7658bd', d: '#d1739a' },
  { id: 'meer',      name: 'Meer',      bg: '#f0f7f8', a: '#1c7a8a', d: '#e07a5f' },
  { id: 'mokka',     name: 'Mokka',     bg: '#f9f3ea', a: '#9c6a42', d: '#8fa07a' },
  { id: 'nacht',     name: 'Nacht',     bg: '#17131f', a: '#b79cf0', d: '#5fd0c0' },
];

export function initApp() {
  // Alle Listener hängen an einem AbortController, damit sie beim Aufräumen sauber entfernt werden.
  const ac = new AbortController();
  const on = (target, type, fn) => target.addEventListener(type, fn, { signal: ac.signal });

  /* ---------- Standard-Plan ---------- */
  const KEY = 'fit45.v1';
  const DEFAULT_TITLE = 'Dein 45-Tage-Weg';
  const PHASES0 = [
    { name: 'Langsam anfangen' },
    { name: 'Wir steigern uns' },
    { name: 'Du wirst stärker' },
    { name: 'Routine entwickeln' },
  ];
  // Symbole und Farben der Phasen (Farben kommen aus dem gewählten Thema: --p1 … --p4)
  const PHASE_ENDS = [10, 20, 30, 45];
  // R = Ruhetag. Format: "Zahl [Sek.|Min.] Name", getrennt mit |
  const RAW = [
    '5 Sit-ups|5 Kniebeugen|5 Wandliegestütze', '15 Sek. Plank|2 Min. Hula-Hoop', '8 Bizepscurls|8 Trizepsübungen', 'R',
    '8 Sit-ups|8 Kniebeugen|5 Wandliegestütze', '20 Sek. Plank|3 Min. Hula-Hoop', '10 Bizepscurls|10 Trizepsübungen', 'R',
    '10 Sit-ups|10 Kniebeugen|6 Wandliegestütze', '20 Sek. Plank|4 Min. Hula-Hoop',
    '12 Sit-ups|12 Kniebeugen', '25 Sek. Plank|5 Min. Hula-Hoop', '12 Bizepscurls|12 Trizepsübungen', 'R',
    '12 Sit-ups|15 Kniebeugen|8 Wandliegestütze', '30 Sek. Plank|5 Min. Hula-Hoop', '15 Bizepscurls|15 Trizepsübungen', 'R',
    '15 Sit-ups|15 Kniebeugen|10 Wandliegestütze', '30 Sek. Plank|6 Min. Hula-Hoop',
    '15 Sit-ups|18 Kniebeugen', '35 Sek. Plank|7 Min. Hula-Hoop', '15 Bizepscurls|15 Trizepsübungen', 'R',
    '18 Sit-ups|20 Kniebeugen|10 Wandliegestütze', '40 Sek. Plank|8 Min. Hula-Hoop', '18 Bizepscurls|18 Trizepsübungen', 'R',
    '20 Sit-ups|20 Kniebeugen|10 Wandliegestütze', '40 Sek. Plank|10 Min. Hula-Hoop',
    '20 Sit-ups|20 Kniebeugen', '40 Sek. Plank|10 Min. Hula-Hoop', '18 Bizepscurls|18 Trizepsübungen', 'R',
    '20 Sit-ups|20 Kniebeugen|10 Wandliegestütze', '40 Sek. Plank|10 Min. Hula-Hoop', '18 Bizepscurls|18 Trizepsübungen', 'R',
    '20 Sit-ups|20 Kniebeugen', '45 Sek. Plank|10 Min. Hula-Hoop', '20 Bizepscurls|20 Trizepsübungen', 'R',
    '20 Sit-ups|20 Kniebeugen|10 Wandliegestütze', '45 Sek. Plank|10 Min. Hula-Hoop', '20 Bizepscurls|20 Trizepsübungen',
  ];

  function parseItem(s) {
    let m = s.match(/^(\d+)\s+Sek\.\s+(.+)$/);
    if (m) return { a: +m[1], u: 's', n: m[2] };
    m = s.match(/^(\d+)\s+Min\.\s+(.+)$/);
    if (m) return { a: +m[1], u: 'm', n: m[2] };
    m = s.match(/^(\d+)\s+(.+)$/);
    return { a: +m[1], u: 'x', n: m[2] };
  }
  function defaultState() {
    const days = RAW.map((r, i) => {
      const p = PHASE_ENDS.findIndex(e => i + 1 <= e);
      return r === 'R' ? { p, rest: true, items: [] } : { p, rest: false, items: r.split('|').map(parseItem) };
    });
    return {
      v: 1, name: '', title: DEFAULT_TITLE, sound: true, vibrate: true, reminder: { on: false, time: '18:00' }, theme: 'pfirsich',
      phases: PHASES0.map(p => ({ ...p })), days, log: {},
    };
  }

  /* ---------- Speicher ---------- */
  let memory = null;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (valid(s)) return s;
      }
    } catch (e) { /* Browser blockiert Speicher – dann nur im Arbeitsspeicher */ }
    return memory ? JSON.parse(memory) : defaultState();
  }
  function valid(s) {
    return s && Array.isArray(s.days) && s.days.length > 0 && Array.isArray(s.phases) && s.phases.length > 0 &&
      s.days.every(d => d && Number.isInteger(d.p) && d.p >= 0 && d.p < s.phases.length && Array.isArray(d.items));
  }
  function save() {
    const raw = JSON.stringify(S);
    memory = raw;
    try { localStorage.setItem(KEY, raw); } catch (e) { /* ignorieren */ }
  }
  let S = load();
  const phase = p => ({ name: S.phases[p].name, icon: PH_ICONS[p % PH_ICONS.length], color: `var(--p${(p % 4) + 1})` });
  const normalize = s => {
    if (!s.log || typeof s.log !== 'object') s.log = {};
    if (!s.reminder || typeof s.reminder !== 'object') s.reminder = { on: false, time: '18:00' };
    if (!/^\d{2}:\d{2}$/.test(s.reminder.time || '')) s.reminder.time = '18:00';
    if (!THEMES.some(t => t.id === s.theme)) s.theme = 'pfirsich';
    return s;
  };
  S = normalize(S);

  // Thema anwenden: setzt die Farben und färbt auch Statusleiste / Navigationsleiste passend
  function applyTheme(id) {
    const root = document.documentElement;
    root.dataset.theme = id;
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
    if (bg) m.setAttribute('content', bg);
  }
  applyTheme(S.theme);

  /* ---------- Helfer ---------- */
  const $ = (q, r = document) => r.querySelector(q);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dstr(new Date());
  const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return dstr(new Date(y, m - 1, d + n)); };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isDone = i => !!(S.log[i] && S.log[i].d);
  const checked = (i, j) => !!(S.log[i] && S.log[i].c && S.log[i].c[j]);
  const amountText = it => it.u === 's' ? `${it.a} ${it.a === 1 ? 'Sekunde' : 'Sekunden'}`
    : it.u === 'm' ? `${it.a} ${it.a === 1 ? 'Minute' : 'Minuten'}` : `${it.a} Wiederholungen`;
  const seconds = it => it.u === 's' ? it.a : it.u === 'm' ? it.a * 60 : 0;
  const fmt = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;

  function currentIndex() {
    const i = S.days.findIndex((_, k) => !isDone(k));
    return i === -1 ? S.days.length : i;
  }
  function doneCount() { return S.days.filter((_, i) => isDone(i)).length; }
  function itemsDone() {
    let n = 0;
    S.days.forEach((d, i) => { if (!d.rest && S.log[i] && S.log[i].c) n += d.items.filter((_, j) => S.log[i].c[j]).length; });
    return n;
  }
  function dateSet() {
    const set = new Set();
    Object.values(S.log).forEach(l => { if (l && l.d) set.add(l.d); });
    return set;
  }
  function streaks() {
    const set = dateSet();
    let cur = 0;
    let c = set.has(today()) ? today() : addDays(today(), -1);
    while (set.has(c)) { cur++; c = addDays(c, -1); }
    const all = [...set].sort();
    let best = 0, run = 0, prev = null;
    all.forEach(x => {
      run = prev && addDays(prev, 1) === x ? run + 1 : 1;
      best = Math.max(best, run);
      prev = x;
    });
    return { cur, best };
  }

  /* ---------- Zustand der Oberfläche ---------- */
  let tab = 'today';
  let sel = Math.min(currentIndex(), S.days.length - 1);
  let popIdx = -1;
  let barPrev = null;
  let draft = null;

  /* ---------- Rendern ---------- */
  function renderHeader() {
    const h = new Date().getHours();
    const greet = h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
    $('#hello').textContent = S.name ? `${greet}, ${S.name}` : greet;
    $('#title').textContent = S.title || DEFAULT_TITLE;
    const n = streaks().cur;
    $('#streak').innerHTML = `${icon('flame')}<span>${n}</span>`;
    $('#streak').classList.toggle('hot', n > 0);
  }

  function dayPct(i) {
    const d = S.days[i];
    if (d.rest) return isDone(i) ? 100 : 0;
    if (!d.items.length) return 0;
    return Math.round(100 * d.items.filter((_, j) => checked(i, j)).length / d.items.length);
  }

  function renderToday() {
    const v = $('#view-today');
    const i = sel, d = S.days[i], ph = phase(d.p), done = isDone(i);
    const pct = dayPct(i);
    const total = d.items.length;
    const n = d.items.filter((_, j) => checked(i, j)).length;
    const cur = currentIndex();
    const finished = cur >= S.days.length;

    let sub;
    if (done) sub = d.rest ? 'Erholt und stark' : 'Geschafft!';
    else if (d.rest) sub = 'Heute darfst du dich ausruhen';
    else if (n === 0) sub = i === cur ? 'Los geht’s – du schaffst das!' : 'Bereit, wenn du es bist';
    else sub = 'Super, weiter so!';

    const count = d.rest ? (done ? 'Ruhetag abgehakt' : 'Ruhetag')
      : `${n} von ${total} Übungen`;

    const startPct = barPrev && barPrev.i === i ? barPrev.p : 0;

    let body;
    if (d.rest) {
      body = `
        <div class="card rest">
          <div class="card-head"><h3>Ruhetag</h3><button class="pill" data-act="edit">${icon('pencil')} Bearbeiten</button></div>
          <div class="heart">${icon('heart', 'beat')}</div>
          <p>Dein Körper wird heute stärker. Trink genug, dehn dich ein bisschen und genieß den Tag.</p>
          ${done
            ? `<div class="done-banner">${icon('check')} Ruhetag abgehakt <button class="link" data-act="rest-undo">Rückgängig</button></div>`
            : `<button class="btn primary wide" data-act="rest-done">${icon('heart')} Ruhetag abhaken</button>`}
        </div>`;
    } else {
      const rows = d.items.map((it, j) => {
        const on = checked(i, j);
        const t = seconds(it);
        return `
        <li class="row ${on ? 'on' : ''} ${popIdx === j ? 'pop' : ''}" data-j="${j}">
          <button class="check" data-act="toggle" data-j="${j}" aria-label="${esc(it.n)} ${on ? 'zurücknehmen' : 'abhaken'}" aria-pressed="${on}">
            <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
          </button>
          <div class="row-main">
            <div class="row-name">${esc(it.n)}</div>
            <div class="row-sub">${amountText(it)}</div>
          </div>
          ${t && !on ? `<button class="timer-btn" data-act="timer" data-j="${j}">${icon('timer')} Timer</button>` : ''}
        </li>`;
      }).join('');
      body = `
        <div class="card">
          <div class="card-head"><h3>Deine Übungen</h3><button class="pill" data-act="edit">${icon('pencil')} Bearbeiten</button></div>
          ${total ? `<ul class="list">${rows}</ul>` : `<p class="empty">Noch keine Übungen – tippe auf „Bearbeiten“.</p>`}
          ${done ? `<div class="done-banner">${icon('sparkles')} Tag geschafft – ich bin stolz auf dich!</div>` : ''}
        </div>`;
    }

    v.innerHTML = `
      ${finished ? `<div class="card center"><div class="big-ic">${icon('crown')}</div><h3>Du hast alles geschafft!</h3><p class="muted">Alle ${S.days.length} Tage sind abgehakt. Wow!</p></div>` : ''}
      <div class="card hero" style="--pc:${esc(ph.color)}">
        <div class="hero-nav">
          <button class="icon-btn" data-act="prev" aria-label="Voriger Tag" ${i === 0 ? 'disabled' : ''}>${icon('chev-left')}</button>
          <div class="hero-mid">
            <span class="badge">${icon(ph.icon)} Phase ${d.p + 1} · ${esc(ph.name)}</span>
            <h2>Tag ${i + 1} <small>/ ${S.days.length}</small></h2>
          </div>
          <button class="icon-btn" data-act="next" aria-label="Nächster Tag" ${i === S.days.length - 1 ? 'disabled' : ''}>${icon('chev-right')}</button>
        </div>
        <p class="hero-sub">${sub}</p>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${startPct}%"></i></div>
        <span class="count">${count}</span>
      </div>
      <div style="--pc:${esc(ph.color)}">${body}</div>
      <p class="quote">${quote(i)}</p>`;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bar = v.querySelector('.bar > i');
      if (bar) bar.style.width = pct + '%';
    }));
    barPrev = { i, p: pct };
    popIdx = -1;
  }

  function quote(i) {
    const q = [
      'Jeder kleine Schritt zählt.',
      'Du musst nicht perfekt sein – nur dranbleiben.',
      'Heute besser als gestern.',
      'Dein Körper dankt es dir.',
      'Stark ist, wer weitermacht.',
      'Kleine Schritte, große Wirkung.',
      'Stolz auf dich – jeden Tag!',
    ];
    return q[i % q.length];
  }

  function renderPlan() {
    const cur = currentIndex();
    const v = $('#view-plan');
    const html = S.phases.map((_ph, p) => {
      const ph = phase(p);
      const idx = S.days.map((d, i) => d.p === p ? i : -1).filter(i => i >= 0);
      if (!idx.length) return '';
      const dn = idx.filter(isDone).length;
      const bubbles = idx.map(i => {
        const d = S.days[i];
        const cls = ['bubble', d.rest ? 'rest' : '', isDone(i) ? 'done' : '', i === cur ? 'cur' : ''].join(' ');
        return `<button class="${cls}" data-act="day" data-i="${i}" aria-label="Tag ${i + 1}${d.rest ? ', Ruhetag' : ''}${isDone(i) ? ', geschafft' : ''}">${i + 1}${d.rest ? `<span class="tag">${icon('heart')}</span>` : ''}</button>`;
      }).join('');
      return `
        <section class="phase" style="--pc:${esc(ph.color)}">
          <div class="phase-head">
            <h3><span class="emoji">${icon(ph.icon)}</span> Phase ${p + 1} – ${esc(ph.name)}</h3>
            <span class="count">${dn}/${idx.length}</span>
          </div>
          <div class="grid">${bubbles}</div>
        </section>`;
    }).join('');
    v.innerHTML = `
      ${html}
      <div class="legend"><span>${icon('heart')} Ruhetag</span><span><i class="lg done"></i> geschafft</span><span><i class="lg cur"></i> heute dran</span></div>
      <button class="btn ghost" data-act="add-day">${icon('plus')} Tag am Ende hinzufügen</button>
      <p class="hint center">Tippe auf einen Tag, um ihn zu öffnen.</p>`;
  }

  function medals() {
    const done = doneCount();
    const { best } = streaks();
    const list = [
      { m: 'sprout', t: 'Erster Tag', ok: done >= 1 },
      { m: 'flame', t: '3 Tage Serie', ok: best >= 3 },
      { m: 'star', t: '7 Tage Serie', ok: best >= 7 },
    ];
    S.phases.forEach((_ph, p) => {
      const idx = S.days.map((d, i) => d.p === p ? i : -1).filter(i => i >= 0);
      list.push({ m: PH_ICONS[p % PH_ICONS.length], t: `Phase ${p + 1}`, ok: idx.length > 0 && idx.every(isDone) });
    });
    list.push({ m: 'dumbbell', t: '25 Tage', ok: done >= 25 });
    list.push({ m: 'crown', t: 'Alle Tage', ok: done >= S.days.length });
    return list;
  }

  function renderProgress() {
    const v = $('#view-progress');
    const total = S.days.length, done = doneCount();
    const pct = Math.round(100 * done / total);
    const { cur, best } = streaks();
    const C = 2 * Math.PI * 88;
    const bars = S.phases.map((_ph, p) => {
      const ph = phase(p);
      const idx = S.days.map((d, i) => d.p === p ? i : -1).filter(i => i >= 0);
      if (!idx.length) return '';
      const dn = idx.filter(isDone).length;
      return `
        <div class="phase-bar" style="--pc:${esc(ph.color)}">
          <div class="pb-head"><span class="pb-name">${icon(ph.icon)} ${esc(ph.name)}</span><span>${dn}/${idx.length}</span></div>
          <div class="bar"><i style="width:${Math.round(100 * dn / idx.length)}%"></i></div>
        </div>`;
    }).join('');
    v.innerHTML = `
      <div class="card big-ring">
        <div class="ring-wrap">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <circle class="ring-bg" cx="100" cy="100" r="88"/>
            <circle id="pRing" class="ring-fg" cx="100" cy="100" r="88" transform="rotate(-90 100 100)" stroke-dasharray="${C}" stroke-dashoffset="${C}"/>
          </svg>
          <div class="ring-center"><b>${pct}%</b><span>${done} von ${total} Tagen</span></div>
        </div>
        <p class="muted" style="font-weight:700">${done === 0 ? 'Der erste Schritt wartet auf dich' : done >= total ? 'Du hast es geschafft!' : 'Du machst das großartig!'}</p>
      </div>
      <div class="stats">
        <div class="stat"><div class="ico">${icon('check-circle')}</div><b>${done}</b><span>Tage geschafft</span></div>
        <div class="stat"><div class="ico">${icon('flame')}</div><b>${cur}</b><span>Aktuelle Serie</span></div>
        <div class="stat"><div class="ico">${icon('trophy')}</div><b>${best}</b><span>Beste Serie</span></div>
        <div class="stat"><div class="ico">${icon('dumbbell')}</div><b>${itemsDone()}</b><span>Übungen erledigt</span></div>
      </div>
      <div class="card"><h3>Phasen</h3>${bars}</div>
      <div class="card">
        <h3>Meine Erfolge</h3>
        <div class="badges">
          ${medals().map(m => `<div class="medal ${m.ok ? 'got' : 'locked'}"><span class="m">${icon(m.m)}</span><span>${esc(m.t)}</span></div>`).join('')}
        </div>
      </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const r = $('#pRing');
      if (r) r.style.strokeDashoffset = C * (1 - pct / 100);
    }));
  }

  /* ---------- Erinnerungen (Push) ---------- */
  const remSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const b64 = s => {
    const pad = '='.repeat((4 - (s.length % 4)) % 4);
    const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  };
  const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin'; } catch (e) { return 'Europe/Berlin'; } };
  const swReg = () => navigator.serviceWorker.ready;

  async function remPost(sub, time) {
    const res = await fetch('/api/reminder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), time, tz: tz() }),
    });
    if (!res.ok) throw new Error('save failed');
  }
  async function remEnable(time) {
    if (!remSupported()) { toast('Hier nicht möglich – siehe Hinweis'); return false; }
    if (!VAPID) { toast('Server-Schlüssel fehlt (siehe Anleitung)'); return false; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Bitte Benachrichtigungen erlauben'); return false; }
    try {
      const reg = await swReg();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
      await remPost(sub, time);
      return true;
    } catch (e) { toast('Erinnerung konnte nicht gespeichert werden'); return false; }
  }
  async function remDisable() {
    try {
      const reg = await swReg();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        fetch('/api/reminder', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => {});
        await sub.unsubscribe();
      }
    } catch (e) { /* egal */ }
  }
  async function remSetTime(time) {
    if (!/^\d{2}:\d{2}$/.test(time)) return;
    S.reminder.time = time; save();
    if (S.reminder.on) {
      try { const reg = await swReg(); const sub = await reg.pushManager.getSubscription(); if (sub) await remPost(sub, time); toast(`Erinnerung: täglich um ${time} Uhr`); }
      catch (e) { toast('Uhrzeit konnte nicht gespeichert werden'); }
    }
    if (tab === 'more') renderMore();
  }
  async function remTest() {
    try {
      if (Notification.permission !== 'granted') { toast('Bitte zuerst Erinnerung aktivieren'); return; }
      const reg = await swReg();
      await reg.showNotification('Zeit für dein Training', { body: 'So sieht deine Erinnerung aus.', icon: '/icons/icon-192.png', badge: '/icons/favicon-32.png', tag: 'test' });
    } catch (e) { toast('Test nicht möglich'); }
  }
  // Falls die Erinnerung an ist, aber das Abo weg ist (z. B. Browserdaten gelöscht): Schalter zurücksetzen
  async function remCheck() {
    if (!S.reminder.on || !remSupported()) return;
    try {
      const reg = await swReg();
      const sub = await reg.pushManager.getSubscription();
      if (!sub || Notification.permission !== 'granted') { S.reminder.on = false; save(); if (tab === 'more') renderMore(); }
    } catch (e) { /* egal */ }
  }

  function renderMore() {
    const v = $('#view-more');
    const r = S.reminder;
    const supported = remSupported();
    const denied = supported && Notification.permission === 'denied';
    let hint = 'Lass dich täglich zur gewünschten Uhrzeit ans Training erinnern.';
    if (!supported) hint = 'Hier werden Erinnerungen nicht unterstützt. Auf dem iPhone: erst über „Teilen → Zum Home-Bildschirm“ installieren und die App von dort öffnen.';
    else if (denied) hint = 'Benachrichtigungen sind blockiert. Bitte in den Browser- oder Handy-Einstellungen erlauben.';
    else if (r.on) hint = `Du wirst täglich um <b>${esc(r.time)} Uhr</b> erinnert.`;
    const chips = ['07:00', '12:00', '18:00', '20:00'].map(t =>
      `<button class="chip ${t === r.time ? 'on' : ''}" data-act="rem-time" data-t="${t}">${t}</button>`).join('');
    v.innerHTML = `
      <div class="card">
        <div class="card-head">
          <h3>${icon('bell', r.on ? 'ring' : '')} Erinnerung</h3>
          <input class="switch" id="swRem" type="checkbox" aria-label="Erinnerung" ${r.on ? 'checked' : ''} ${!supported || denied ? 'disabled' : ''}>
        </div>
        <p class="hint" style="margin-top:0">${hint}</p>
        ${r.on ? `
          <div class="rem-time">
            <label class="field"><span>Uhrzeit</span><input class="in time-in" id="remTime" type="time" value="${esc(r.time)}"></label>
            <div class="chips">${chips}</div>
            <button class="btn ghost" data-act="rem-test">${icon('bell')} Test-Benachrichtigung</button>
          </div>` : ''}
      </div>
      <div class="card">
        <h3>Design</h3>
        <p class="hint" style="margin-top:6px">Such dir die Farben aus, die dir am besten gefallen.</p>
        <div class="themes">
          ${THEMES.map(t => `
            <button class="theme-opt ${S.theme === t.id ? 'on' : ''}" data-act="theme" data-id="${t.id}" aria-pressed="${S.theme === t.id}">
              <span class="swatch" style="background:linear-gradient(135deg,${t.bg} 0 50%,${t.a} 50% 100%)"><i style="background:${t.d}"></i></span>
              <span>${t.name}</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="card">
        <h3>Persönlich</h3>
        <label class="field"><span>Dein Name</span><input class="in" id="inName" type="text" maxlength="24" placeholder="z. B. Anna" value="${esc(S.name)}"></label>
        <label class="field"><span>Titel der App</span><input class="in" id="inTitle" type="text" maxlength="32" value="${esc(S.title)}"></label>
        <div class="switch-row"><span class="sw-label">${icon('volume')} Töne</span><input class="switch" id="swSound" type="checkbox" ${S.sound ? 'checked' : ''}></div>
        <div class="switch-row"><span class="sw-label">${icon('phone')} Vibration</span><input class="switch" id="swVib" type="checkbox" ${S.vibrate ? 'checked' : ''}></div>
      </div>
      <div class="card">
        <h3>Sichern &amp; Wiederherstellen</h3>
        <p class="hint">Alles wird nur auf diesem Handy gespeichert. Mit einer Sicherung geht nichts verloren, z. B. bei einem neuen Handy.</p>
        <div class="stack">
          <button class="btn ghost" data-act="export">${icon('download')} Sicherung speichern</button>
          <button class="btn ghost" data-act="import">${icon('upload')} Sicherung laden</button>
        </div>
      </div>
      <div class="card">
        <h3>Zurücksetzen</h3>
        <div class="stack">
          <button class="btn ghost" data-act="reset-progress">${icon('refresh')} Nur Fortschritt zurücksetzen</button>
          <button class="btn ghost" data-act="reset-all">${icon('trash')} Alles auf Anfang (Plan &amp; Fortschritt)</button>
        </div>
      </div>
      <div class="card">
        <h3>Auf den Startbildschirm</h3>
        <p class="hint"><b>iPhone:</b> Teilen-Symbol → „Zum Home-Bildschirm“.<br><b>Android:</b> Menü ⋮ → „App installieren“ oder „Zum Startbildschirm“.</p>
      </div>
      <p class="about">Mit Liebe gemacht</p>`;
  }

  function renderAll() {
    renderHeader();
    if (tab === 'today') renderToday();
    if (tab === 'plan') renderPlan();
    if (tab === 'progress') renderProgress();
    if (tab === 'more') renderMore();
  }

  function showTab(t, animate = true) {
    tab = t;
    ['today', 'plan', 'progress', 'more'].forEach(k => {
      const el = $('#view-' + k);
      el.hidden = k !== t;
      el.classList.remove('enter');
    });
    document.querySelectorAll('.tabs button').forEach(b => {
      if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (t === 'today' && sel >= S.days.length) sel = S.days.length - 1;
    renderAll();
    if (animate) { const el = $('#view-' + t); void el.offsetWidth; el.classList.add('enter'); }
    window.scrollTo({ top: 0 });
  }

  /* ---------- Overlays ---------- */
  function openOv(el) {
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  }
  function closeOv(el) {
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.overlay.open')) document.body.classList.remove('lock');
  }

  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function ask(title, text, ok = 'Ja', cancel = 'Abbrechen', danger = false) {
    return new Promise(res => {
      $('#dlgTitle').textContent = title;
      $('#dlgText').textContent = text;
      const okB = $('#dlgOk'), cB = $('#dlgCancel');
      okB.textContent = ok; cB.textContent = cancel;
      okB.className = 'btn ' + (danger ? 'danger' : 'primary');
      const dlg = $('#dialog');
      const end = v => { okB.onclick = cB.onclick = null; closeOv(dlg); res(v); };
      okB.onclick = () => end(true);
      cB.onclick = () => end(false);
      openOv(dlg);
    });
  }

  /* ---------- Töne, Vibration ---------- */
  let actx = null;
  function audio() {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
    } catch (e) { actx = null; }
    return actx;
  }
  function tone(freq, dur = 0.14, at = 0, vol = 0.18) {
    if (!S.sound) return;
    const c = audio(); if (!c) return;
    const t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const sfx = {
    check() { tone(660, .12); tone(880, .16, .09); },
    tick()  { tone(520, .09, 0, .12); },
    go()    { tone(880, .25); },
    win()   { tone(523, .16); tone(659, .16, .14); tone(784, .16, .28); tone(1047, .4, .42); },
  };
  function buzz(p) { if (S.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { /* egal */ } } }

  /* ---------- Konfetti ---------- */
  const cv = $('#confetti');
  const cx = cv.getContext('2d');
  let parts = [], raf = 0;
  function sizeCanvas() {
    const r = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = innerWidth * r; cv.height = innerHeight * r;
    cx.setTransform(r, 0, 0, r, 0, 0);
  }
  on(window, 'resize', sizeCanvas); sizeCanvas();
  const palette = () => {
    const cs = getComputedStyle(document.documentElement);
    const list = ['--p1', '--p2', '--p3', '--p4', '--accent', '--flame'].map(k => cs.getPropertyValue(k).trim()).filter(Boolean);
    return list.length ? list : ['#d4553a', '#3d9a8b', '#e0a23c', '#8f6bb3'];
  };
  function confetti(n = 120, x = innerWidth / 2, y = innerHeight * 0.35, spread = 1) {
    if (reduceMotion) n = Math.min(n, 18);
    const COLORS = palette();
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, s = (4 + Math.random() * 9) * spread;
      parts.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5 * spread,
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
        c: COLORS[(Math.random() * COLORS.length) | 0], life: 0, max: 90 + Math.random() * 60, heart: Math.random() < .18,
      });
    }
    if (!raf) raf = requestAnimationFrame(stepConfetti);
  }
  function stepConfetti() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life < p.max && p.y < innerHeight + 30);
    parts.forEach(p => {
      p.life++; p.vy += .28; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save();
      cx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      if (p.heart) { cx.beginPath(); cx.moveTo(0, 5); cx.bezierCurveTo(-9, -2, -5, -9, 0, -3); cx.bezierCurveTo(5, -9, 9, -2, 0, 5); cx.fill(); }
      else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(stepConfetti);
    else { raf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }

  /* ---------- Tag abschließen ---------- */
  function ensureLog(i) {
    if (!S.log[i]) S.log[i] = { c: [], d: null };
    if (!Array.isArray(S.log[i].c)) S.log[i].c = [];
    return S.log[i];
  }
  function allChecked(i) {
    const d = S.days[i];
    return d.items.length > 0 && d.items.every((_, j) => checked(i, j));
  }
  // gibt eine Feier-Funktion zurück, wenn der Tag gerade fertig geworden ist
  function completeDay(i) {
    const l = ensureLog(i);
    if (l.d) return null;
    l.d = today();
    save();
    return () => celebrate(i);
  }

  function celebrate(i) {
    const d = S.days[i];
    const p = d.p;
    const phaseIdx = S.days.map((x, k) => x.p === p ? k : -1).filter(k => k >= 0);
    const phaseDone = phaseIdx.every(isDone);
    const allDone = S.days.every((_, k) => isDone(k));
    const { cur } = streaks();
    let ic, title, text;
    if (allDone) {
      ic = 'crown'; title = 'Du hast es geschafft!';
      text = `Alle ${S.days.length} Tage sind erledigt. Ich bin so stolz auf dich!`;
    } else if (phaseDone) {
      ic = 'medal'; title = `Phase ${p + 1} geschafft!`;
      text = `${phase(p).name} – abgehakt. Weiter geht’s!`;
    } else if (d.rest) {
      ic = 'moon'; title = 'Gut erholt!';
      text = 'Erholung gehört dazu. Morgen geht’s gestärkt weiter.';
    } else {
      const pool = [['sparkles', 'Tag geschafft!'], ['star', 'Stark gemacht!'], ['bloom', 'Wunderbar!'], ['trophy', 'Du bist großartig!']];
      [ic, title] = pool[i % pool.length];
      text = `Tag ${i + 1} von ${S.days.length} ist erledigt.`;
    }
    $('#celEmoji').innerHTML = icon(ic);
    $('#celTitle').textContent = title;
    $('#celText').textContent = text;
    $('#celStreak').innerHTML = cur > 1 ? `${icon('flame')} ${cur} Tage in Folge` : '';
    $('#celBtn').textContent = (!allDone && i < S.days.length - 1) ? 'Weiter' : 'Super';
    const el = $('#celebrate');
    openOv(el);
    sfx.win(); buzz([60, 40, 60, 40, 120]);
    confetti(allDone ? 260 : 150, innerWidth / 2, innerHeight * 0.38, allDone ? 1.3 : 1);
    if (allDone || phaseDone) setTimeout(() => confetti(120, innerWidth * .2, innerHeight * .5), 350);
    if (allDone || phaseDone) setTimeout(() => confetti(120, innerWidth * .8, innerHeight * .5), 600);
    renderHeader();
    $('#streak').classList.remove('bump'); void $('#streak').offsetWidth; $('#streak').classList.add('bump');
  }

  function setItem(i, j, on) {
    const l = ensureLog(i);
    l.c[j] = on;
    let after = null;
    if (on) {
      if (allChecked(i)) after = completeDay(i);
    } else if (l.d) {
      l.d = null;
    }
    save();
    return after;
  }

  /* ---------- Timer ---------- */
  const RING_C = 2 * Math.PI * 88;
  const T = { phase: 'idle', i: 0, j: 0, total: 0, prepEnd: 0, endAt: 0, remain: 0, iv: 0, lastSec: -1, after: null, lock: null };
  const ring = $('#timerRing');
  ring.style.strokeDasharray = RING_C;

  function timerOpen(j) {
    const it = S.days[sel].items[j];
    if (!it) return;
    audio();
    T.i = sel; T.j = j; T.total = seconds(it); T.after = null;
    $('#timerName').textContent = it.n;
    openOv($('#timer'));
    timerStart();
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { T.lock = l; }).catch(() => {}); } catch (e) { /* egal */ }
  }
  function timerStart() {
    clearInterval(T.iv);
    T.phase = 'prep'; T.prepEnd = Date.now() + 3000; T.lastSec = -1;
    ring.style.strokeDashoffset = 0;
    $('#timerPhase').textContent = 'Mach dich bereit …';
    setBtns();
    T.iv = setInterval(tick, 100);
    tick();
  }
  function setBtns() {
    const p = $('#timerPrimary'), r = $('#timerReset');
    const lab = { prep: 'Pause', run: 'Pause', pause: 'Weiter', done: 'Fertig', idle: 'Pause' }[T.phase];
    p.textContent = lab;
    p.disabled = T.phase === 'prep';
    r.disabled = T.phase === 'prep';
    r.hidden = T.phase === 'done';
  }
  function tick() {
    const now = Date.now(), tm = $('#timerTime');
    if (T.phase === 'prep') {
      const left = Math.ceil((T.prepEnd - now) / 1000);
      if (left <= 0) {
        T.phase = 'run'; T.endAt = now + T.total * 1000; T.lastSec = -1;
        $('#timerPhase').textContent = 'Los! Du schaffst das';
        sfx.go(); buzz(80); setBtns();
      } else {
        tm.className = 'timer-time prep';
        if (tm.textContent !== String(left)) { tm.textContent = left; sfx.tick(); }
        return;
      }
    }
    if (T.phase === 'run') {
      const ms = Math.max(0, T.endAt - now);
      const sec = Math.ceil(ms / 1000);
      tm.className = 'timer-time';
      tm.textContent = fmt(sec);
      ring.style.strokeDashoffset = RING_C * (1 - ms / (T.total * 1000));
      if (sec !== T.lastSec) { if (sec <= 3 && sec > 0) sfx.tick(); T.lastSec = sec; }
      if (ms <= 0) timerFinish();
    }
  }
  function timerFinish() {
    clearInterval(T.iv);
    T.phase = 'done';
    ring.style.strokeDashoffset = RING_C;
    const tm = $('#timerTime');
    tm.className = 'timer-time done'; tm.innerHTML = icon('check');
    $('#timerPhase').textContent = 'Geschafft!';
    sfx.win(); buzz([80, 50, 80, 50, 160]);
    confetti(90, innerWidth / 2, innerHeight * 0.4);
    T.after = setItem(T.i, T.j, true);
    setBtns();
  }
  function timerPrimary() {
    if (T.phase === 'run') {
      T.remain = Math.max(0, T.endAt - Date.now()); T.phase = 'pause';
      clearInterval(T.iv);
      $('#timerPhase').textContent = 'Pausiert';
    } else if (T.phase === 'pause') {
      T.endAt = Date.now() + T.remain; T.phase = 'run';
      $('#timerPhase').textContent = 'Weiter so';
      T.iv = setInterval(tick, 100);
    } else if (T.phase === 'done') { timerClose(); return; }
    setBtns();
  }
  function timerClose() {
    clearInterval(T.iv);
    const wasDone = T.phase === 'done';
    T.phase = 'idle';
    closeOv($('#timer'));
    try { if (T.lock) { T.lock.release(); T.lock = null; } } catch (e) { /* egal */ }
    if (wasDone) {
      popIdx = T.j;
      renderAll();
      if (T.after) { const f = T.after; T.after = null; setTimeout(f, 350); }
    }
  }
  on(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (T.phase === 'run' || T.phase === 'prep') tick();
      renderHeader();
    }
  });

  /* ---------- Bearbeiten (Bottom Sheet) ---------- */
  function openEdit() {
    draft = JSON.parse(JSON.stringify(S.days[sel]));
    if (!draft.items.length && !draft.rest) draft.items.push({ a: 10, u: 'x', n: '' });
    renderSheet();
    openOv($('#sheet'));
  }
  function renderSheet() {
    const isLast = sel === S.days.length - 1 && S.days.length > 1;
    const items = draft.items.map((it, k) => `
      <div class="editor" data-k="${k}">
        <div class="editor-line">
          <input class="in" type="number" inputmode="numeric" min="1" max="999" value="${it.a}" data-f="a" aria-label="Anzahl">
          <select class="in" data-f="u" aria-label="Einheit">
            <option value="x" ${it.u === 'x' ? 'selected' : ''}>Wiederholungen</option>
            <option value="s" ${it.u === 's' ? 'selected' : ''}>Sekunden</option>
            <option value="m" ${it.u === 'm' ? 'selected' : ''}>Minuten</option>
          </select>
          <button class="icon-btn danger" data-act="item-del" data-k="${k}" aria-label="Übung löschen">${icon('trash')}</button>
        </div>
        <input class="in" type="text" maxlength="40" placeholder="Name der Übung" value="${esc(it.n)}" data-f="n" aria-label="Name der Übung">
      </div>`).join('');
    $('#sheetBody').innerHTML = `
      <div class="sheet-head"><h3>Tag ${sel + 1} bearbeiten</h3><button class="icon-btn" data-act="sheet-close" aria-label="Schließen">${icon('close')}</button></div>
      <div class="switch-row"><span class="sw-label">${icon('heart')} Ruhetag</span><input class="switch" id="swRest" type="checkbox" ${draft.rest ? 'checked' : ''}></div>
      ${draft.rest ? '<p class="hint">An Ruhetagen gibt es keine Übungen.</p>' : `
        <div class="editor-list">${items}</div>
        <button class="btn ghost wide" data-act="item-add" style="margin-top:0">${icon('plus')} Übung hinzufügen</button>
        <p class="hint">Bei „Sekunden“ oder „Minuten“ bekommst du automatisch einen Timer.</p>`}
      <div class="sheet-actions">
        <button class="btn ghost grow" data-act="sheet-close">Abbrechen</button>
        <button class="btn primary grow" data-act="sheet-save">Speichern</button>
      </div>
      ${isLast ? '<p class="center" style="margin-top:14px"><button class="link" data-act="del-day">Diesen Tag löschen</button></p>' : ''}`;
  }
  function saveEdit() {
    const old = S.days[sel];
    let items = draft.items
      .map(it => ({ a: Math.max(1, Math.min(999, parseInt(it.a, 10) || 1)), u: it.u, n: String(it.n).trim() }))
      .filter(it => it.n);
    if (!draft.rest && !items.length) { toast('Bitte mindestens eine Übung eintragen'); return; }
    if (draft.rest) items = [];
    const restChanged = !!old.rest !== !!draft.rest;
    S.days[sel] = { p: old.p, rest: !!draft.rest, items };
    if (restChanged) delete S.log[sel];
    else if (S.log[sel]) {
      S.log[sel].c = (S.log[sel].c || []).slice(0, items.length);
      if (S.log[sel].d && !old.rest && !allChecked(sel)) S.log[sel].d = null;
    }
    save();
    closeOv($('#sheet'));
    renderAll();
    toast('Gespeichert');
  }

  /* ---------- Aktionen ---------- */
  function changeDay(n) {
    sel = n;
    barPrev = null;
    const v = $('#view-today');
    renderAll();
    v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
    window.scrollTo({ top: 0 });
  }

  on(document, 'click', async e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const a = b.dataset.act;

    switch (a) {
      case 'tab': showTab(b.dataset.tab); break;
      case 'prev': if (sel > 0) changeDay(sel - 1); break;
      case 'next': if (sel < S.days.length - 1) changeDay(sel + 1); break;
      case 'day': sel = +b.dataset.i; barPrev = null; showTab('today'); break;
      case 'toggle': {
        const j = +b.dataset.j;
        const on = !checked(sel, j);
        const after = setItem(sel, j, on);
        if (on) {
          popIdx = j; sfx.check(); buzz(25);
          const r = b.getBoundingClientRect();
          confetti(on ? 16 : 0, r.left + r.width / 2, r.top + r.height / 2, .45);
        }
        renderAll();
        if (after) setTimeout(after, 500);
        break;
      }
      case 'timer': timerOpen(+b.dataset.j); break;
      case 'rest-done': {
        const after = completeDay(sel);
        renderAll();
        if (after) setTimeout(after, 250);
        break;
      }
      case 'rest-undo': ensureLog(sel).d = null; save(); renderAll(); break;
      case 'edit': openEdit(); break;
      case 'sheet-close': closeOv($('#sheet')); break;
      case 'sheet-save': saveEdit(); break;
      case 'item-add': draft.items.push({ a: 10, u: 'x', n: '' }); renderSheet();
        { const ins = document.querySelectorAll('#sheetBody .editor [data-f="n"]'); if (ins.length) ins[ins.length - 1].focus(); }
        break;
      case 'item-del': draft.items.splice(+b.dataset.k, 1); renderSheet(); break;
      case 'del-day': {
        const ok = await ask('Tag löschen?', `Tag ${sel + 1} wird entfernt.`, 'Löschen', 'Abbrechen', true);
        if (!ok) break;
        S.days.pop(); delete S.log[sel];
        sel = S.days.length - 1;
        save(); closeOv($('#sheet')); renderAll(); toast('Tag gelöscht');
        break;
      }
      case 'add-day': {
        const last = S.days[S.days.length - 1];
        S.days.push({ p: last.p, rest: false, items: [{ a: 10, u: 'x', n: 'Neue Übung' }] });
        sel = S.days.length - 1; save(); showTab('today'); openEdit();
        break;
      }
      case 'timer-close': timerClose(); break;
      case 'timer-reset': timerStart(); break;
      case 'timer-primary': timerPrimary(); break;
      case 'theme': {
        const id = b.dataset.id;
        if (!THEMES.some(t => t.id === id)) break;
        S.theme = id; save(); applyTheme(id); renderMore();
        confetti(18, innerWidth / 2, innerHeight * 0.3, .6);
        break;
      }
      case 'rem-time': remSetTime(b.dataset.t); break;
      case 'rem-test': remTest(); break;
      case 'export': {
        const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const el = document.createElement('a');
        el.href = url; el.download = `mein-plan-${today()}.json`;
        document.body.appendChild(el); el.click(); el.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        toast('Sicherung erstellt');
        break;
      }
      case 'import': $('#file').click(); break;
      case 'reset-progress': {
        if (await ask('Fortschritt zurücksetzen?', 'Alle Häkchen werden gelöscht. Dein Plan bleibt erhalten.', 'Zurücksetzen', 'Abbrechen', true)) {
          S.log = {}; sel = 0; barPrev = null; save(); renderAll(); toast('Fortschritt zurückgesetzt');
        }
        break;
      }
      case 'reset-all': {
        if (await ask('Alles auf Anfang?', 'Plan und Fortschritt werden auf den Ursprung zurückgesetzt. Das lässt sich nicht rückgängig machen.', 'Alles löschen', 'Abbrechen', true)) {
          await remDisable(); S = normalize(defaultState()); applyTheme(S.theme); sel = 0; barPrev = null; save(); renderAll(); toast('Alles zurückgesetzt');
        }
        break;
      }
    }
  });

  on($('#celBtn'), 'click', () => {
    closeOv($('#celebrate'));
    const next = currentIndex();
    if (sel === next - 1 && next < S.days.length && !S.days[sel].rest || (S.days[sel].rest && isDone(sel) && next < S.days.length && sel === next - 1)) {
      changeDay(next);
    } else {
      renderAll();
    }
  });
  on($('#sheet'), 'click', e => { if (e.target === $('#sheet')) closeOv($('#sheet')); });

  // Eingaben im Bearbeiten-Fenster
  const sb = $('#sheetBody');
  const onField = e => {
    const f = e.target.dataset && e.target.dataset.f;
    const ed = e.target.closest('.editor');
    if (!f || !ed || !draft) return;
    const it = draft.items[+ed.dataset.k];
    if (!it) return;
    it[f] = f === 'a' ? e.target.value : f === 'u' ? e.target.value : e.target.value;
  };
  on(sb, 'input', onField);
  on(sb, 'change', e => {
    onField(e);
    if (e.target.id === 'swRest') { draft.rest = e.target.checked; if (!draft.rest && !draft.items.length) draft.items.push({ a: 10, u: 'x', n: '' }); renderSheet(); }
  });

  // Einstellungen
  on(document, 'change', e => {
    const t = e.target;
    if (t.id === 'inName') { S.name = t.value.trim(); save(); renderHeader(); toast('Gespeichert'); }
    if (t.id === 'inTitle') { S.title = t.value.trim() || DEFAULT_TITLE; t.value = S.title; save(); renderHeader(); toast('Gespeichert'); }
    if (t.id === 'swSound') { S.sound = t.checked; save(); if (S.sound) sfx.check(); }
    if (t.id === 'swVib') { S.vibrate = t.checked; save(); if (S.vibrate) buzz(40); }
    if (t.id === 'remTime') remSetTime(t.value);
    if (t.id === 'swRem') {
      t.disabled = true;
      if (t.checked) {
        remEnable(S.reminder.time).then(ok => { S.reminder.on = ok; save(); renderMore(); if (ok) toast(`Erinnerung: täglich um ${S.reminder.time} Uhr`); });
      } else {
        remDisable().then(() => { S.reminder.on = false; save(); renderMore(); toast('Erinnerung aus'); });
      }
    }
  });

  on($('#file'), 'change', e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => {
      try {
        const s = JSON.parse(rd.result);
        if (!valid(s)) throw new Error('bad');
        if (await ask('Sicherung laden?', 'Dein aktueller Stand wird durch die Sicherung ersetzt.', 'Laden', 'Abbrechen', true)) {
          normalize(s);
          s.reminder.on = false;
          S = s; applyTheme(S.theme); sel = Math.min(currentIndex(), S.days.length - 1); barPrev = null; save(); showTab('today', false); toast('Sicherung geladen');
        }
      } catch (err) { toast('Diese Datei passt leider nicht'); }
    };
    rd.readAsText(f);
  });

  /* ---------- Start ---------- */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(() => remCheck()).catch(() => {});
  }
  showTab('today', false);

  return () => {
    ac.abort();
    clearInterval(T.iv);
    clearTimeout(toastT);
    if (raf) cancelAnimationFrame(raf);
    try { if (T.lock) T.lock.release(); } catch (e) { /* egal */ }
    document.body.classList.remove('lock');
  };
}