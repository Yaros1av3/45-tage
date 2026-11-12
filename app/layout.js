import './globals.css';
import { Cormorant_Garamond, Jost } from 'next/font/google';

// Elegante Serifenschrift für Überschriften und Zahlen, ruhige Schrift für den Text
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});
const sans = Jost({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6efe6' },
    { media: '(prefers-color-scheme: dark)', color: '#1f1814' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
