import './globals.css';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';

// Überschriften und Zahlen: Bricolage Grotesque (modern, mit Charakter)
// Fließtext: Figtree (freundlich und gut lesbar)
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const sans = Figtree({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Setzt das gespeicherte Farbthema, bevor die Seite sichtbar wird (kein Aufblitzen)
const themeScript = `try{var t=JSON.parse(localStorage.getItem('fit45.v1')||'{}').theme;if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata = {
  title: 'Mein 45-Tage-Weg',
  description: 'Dein persönlicher Übungsplan – abhaken, Timer, Fortschritt.',
  icons: {
    icon: [{ url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: { capable: true, title: '45 Tage', statusBarStyle: 'default' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Startfarbe (Pfirsich); die App passt sie je nach gewähltem Thema an
  themeColor: '#fff6f0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}