'use client';

import { useEffect } from 'react';
import { initApp } from '../lib/initApp';

// Die Oberfläche wird hier als Grundgerüst gerendert,
// die Logik (lib/initApp.js) füllt sie im Browser mit Leben.
export default function FitnessApp() {
  useEffect(() => initApp(), []);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4924f" />
            <stop offset="1" stopColor="#8a6a58" />
          </linearGradient>
        </defs>
      </svg>

      <div id="app">
        <header className="top">
          <div className="top-text">
            <p id="hello" className="hello" suppressHydrationWarning></p>
            <h1 id="title" suppressHydrationWarning>Dein 45-Tage-Weg</h1>
          </div>
          <div id="streak" className="streak" title="Serie in Tagen" suppressHydrationWarning>0</div>
        </header>

        <main>
          <section id="view-today" className="view" suppressHydrationWarning></section>
          <section id="view-plan" className="view" hidden suppressHydrationWarning></section>
          <section id="view-progress" className="view" hidden suppressHydrationWarning></section>
          <section id="view-more" className="view" hidden suppressHydrationWarning></section>
        </main>
      </div>

      <nav className="tabs" aria-label="Hauptmenü">
        <button data-act="tab" data-tab="today" aria-label="Heute">
          <svg className="ic" viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.6-9.6A5.4 5.4 0 0 1 12 6.3a5.4 5.4 0 0 1 9.6 4.6c-2.1 5-9.6 9.6-9.6 9.6z" /></svg>
          <span>Heute</span>
        </button>
        <button data-act="tab" data-tab="plan" aria-label="Plan">
          <svg className="ic" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
          <span>Plan</span>
        </button>
        <button data-act="tab" data-tab="progress" aria-label="Fortschritt">
          <svg className="ic" viewBox="0 0 24 24"><path d="M5 20v-6M12 20V5M19 20v-10" /></svg>
          <span>Fortschritt</span>
        </button>
        <button data-act="tab" data-tab="more" aria-label="Mehr">
          <svg className="ic" viewBox="0 0 24 24"><path d="M4 7h9M19 7h1M4 17h1M11 17h9" /><circle cx="16" cy="7" r="2.2" /><circle cx="8" cy="17" r="2.2" /></svg>
          <span>Mehr</span>
        </button>
      </nav>

      {/* Übung bearbeiten (Bottom Sheet) */}
      <div id="sheet" className="overlay" aria-hidden="true">
        <div className="panel" role="dialog" aria-modal="true" aria-label="Tag bearbeiten">
          <div id="sheetBody" suppressHydrationWarning></div>
        </div>
      </div>

      {/* Bestätigungsdialog */}
      <div id="dialog" className="overlay center" aria-hidden="true">
        <div className="panel modal" role="alertdialog" aria-modal="true" aria-labelledby="dlgTitle">
          <h3 id="dlgTitle"></h3>
          <p id="dlgText" className="muted"></p>
          <div className="modal-actions">
            <button id="dlgCancel" className="btn ghost"></button>
            <button id="dlgOk" className="btn primary"></button>
          </div>
        </div>
      </div>

      {/* Feier-Fenster */}
      <div id="celebrate" className="overlay center" aria-hidden="true">
        <div className="panel modal celebrate" role="dialog" aria-modal="true" aria-labelledby="celTitle">
          <div className="cel-glow"></div>
          <div id="celEmoji" className="cel-icon" suppressHydrationWarning></div>
          <h2 id="celTitle"></h2>
          <p id="celText" className="muted"></p>
          <p id="celStreak" className="cel-streak"></p>
          <button id="celBtn" className="btn primary wide">Weiter</button>
        </div>
      </div>

      {/* Timer */}
      <div id="timer" className="overlay timer" aria-hidden="true">
        <div className="timer-wrap" role="dialog" aria-modal="true" aria-label="Timer">
          <div className="timer-top">
            <button className="icon-btn" data-act="timer-close" aria-label="Timer schließen"><svg className="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
          </div>
          <div className="timer-body">
            <p id="timerPhase" className="timer-phase">Mach dich bereit …</p>
            <h2 id="timerName">Plank</h2>
            <div className="timer-ring">
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <circle className="ring-bg" cx="100" cy="100" r="88" />
                <circle id="timerRing" className="ring-fg" cx="100" cy="100" r="88" transform="rotate(-90 100 100)" />
              </svg>
              <div id="timerTime" className="timer-time" aria-live="off">0:15</div>
            </div>
            <div className="timer-actions">
              <button id="timerReset" className="btn ghost" data-act="timer-reset">Neustart</button>
              <button id="timerPrimary" className="btn primary" data-act="timer-primary">Pause</button>
            </div>
          </div>
        </div>
      </div>

      <input id="file" type="file" accept="application/json,.json" hidden />
      <canvas id="confetti" aria-hidden="true"></canvas>
      <div id="toast" className="toast" role="status" aria-live="polite"></div>
    </>
  );
}
