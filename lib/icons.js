// Alle Symbole der App als schlichte Linien-Icons (SVG). Keine Emojis.
// Animationen laufen über CSS-Klassen (siehe globals.css).
const P = {
  flame:
    '<path class="f1 fill" d="M12 2.2c.5 3.2-1.4 5-3 7C7.3 11.3 6 13.2 6 15.6a6 6 0 0 0 12 0c0-2.2-1-3.9-2.2-5.2-.2 1.4-.8 2.3-1.8 2.8.6-3.9-.3-7.8-2-11z"/>' +
    '<path class="f2 fill" d="M12 21a3.2 3.2 0 0 1-3.2-3.2c0-1.5.9-2.5 1.8-3.5.4 1 1 1.6 1.7 1.8.3-.6.4-1.2.3-1.9 1.2.9 2.6 2.1 2.6 3.6A3.2 3.2 0 0 1 12 21z"/>',
  check: '<path class="draw" d="M5 12.5l4.5 4.5L19 7.5"/>',
  'check-circle': '<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.5 2.5 4.9-5.2"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-9.6-9.6A5.4 5.4 0 0 1 12 6.3a5.4 5.4 0 0 1 9.6 4.6c-2.1 5-9.6 9.6-9.6 9.6z"/>',
  moon: '<path d="M20 14.6A8 8 0 0 1 9.4 4a8 8 0 1 0 10.6 10.6z"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13c0-3.6-2.6-6-6.6-6 0 3.6 2.6 6 6.6 6z"/><path d="M12 11c0-3 2-5.4 6-5.4 0 3-2 5.4-6 5.4z"/>',
  tulip: '<path d="M12 21v-6"/><path d="M6.8 5.5C6.8 11 8.6 15 12 15s5.2-4 5.2-9.5l-2.6 2L12 3.5 9.4 7.5z"/><path d="M12 19c0-2 1.8-3.4 4-3.6"/>',
  bloom:
    '<circle cx="12" cy="12" r="1.7"/>' +
    [0, 72, 144, 216, 288].map(a => `<ellipse cx="12" cy="6.6" rx="2.6" ry="3.7" transform="rotate(${a} 12 12)"/>`).join(''),
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5.2A2.8 2.8 0 0 0 8 10M16 6h2.8A2.8 2.8 0 0 1 16 10"/><path d="M12 13v4M8.5 20h7M10 17h4"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  star: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.8L12 16.5l-5.1 2.8L8 13.5 3.7 9.5l5.8-.7z"/>',
  crown: '<path d="M4 18.5h16M4.5 18L3.5 8l5 4 3.5-6 3.5 6 5-4-1 10"/>',
  medal: '<circle cx="12" cy="9" r="5"/><path d="M9 13.4L7.5 21l4.5-2.5 4.5 2.5-1.5-7.6"/>',
  sparkles:
    '<path class="tw1" d="M11 3l1.9 5.4L18.3 10l-5.4 1.9L11 17.3l-1.9-5.4L3.7 10l5.4-1.6z"/>' +
    '<path class="tw2" d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M9.5 3h5M12 3v3M18.7 6.8l1.2-1.2"/>',
  pencil: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
  trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10.5 11v5M13.5 11v5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  'chev-left': '<path d="M15 5l-7 7 7 7"/>',
  'chev-right': '<path d="M9 5l7 7-7 7"/>',
  bell: '<g class="swing"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></g>',
  volume: '<path d="M4 10v4h3.5L12 18V6L7.5 10z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 7a7 7 0 0 1 0 10"/>',
  phone: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4.5 8v8M19.5 8v8"/>',
  download: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14"/>',
  upload: '<path d="M12 15V4M7.5 8L12 3.5 16.5 8M5 20h14"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5"/>',
  home: '<path d="M4 11l8-6.5 8 6.5M6 9.8V20h12V9.8M10 20v-5h4v5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  bars: '<path d="M5 20v-6M12 20V5M19 20v-10"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.2"/><circle cx="8" cy="17" r="2.2"/>',
};

export const PH_ICONS = ['sprout', 'tulip', 'bloom', 'heart'];

export function icon(name, cls = '') {
  const body = P[name];
  if (!body) return '';
  return `<svg class="ic ic-${name} ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const ICON_NAMES = Object.keys(P);
