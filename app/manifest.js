export default function manifest() {
  return {
    name: 'Mein 45-Tage-Weg',
    short_name: '45 Tage',
    description: 'Dein persönlicher Übungsplan – abhaken, Timer, Fortschritt.',
    lang: 'de',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f6efe6',
    theme_color: '#f6efe6',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
