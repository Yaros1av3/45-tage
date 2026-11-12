import webpush from 'web-push';
import { configured, listReminders, markSent, deleteReminder } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

// Wird von einem Cron-Dienst alle 5 Minuten aufgerufen.
// Schickt jedem, dessen Uhrzeit gerade dran ist (Fenster: 10 Min.), genau eine Erinnerung pro Tag.
const WINDOW_MIN = 10;

const MESSAGES = [
  'Zeit für dein Training. Du schaffst das!',
  'Ein kleiner Schritt heute, ein großer für morgen.',
  'Dein Körper freut sich auf dich. Los geht’s!',
  'Kurz Zeit nehmen für dich. Dein Training wartet.',
  'Dranbleiben lohnt sich. Heute auch!',
];

function localNow(tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(new Date()).map(p => [p.type, p.value])
  );
  const hour = parts.hour === '24' ? 0 : Number(parts.hour);
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: hour * 60 + Number(parts.minute) };
}

export async function GET(req) {
  const url = new URL(req.url);
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || url.searchParams.get('secret') || '';
  if (!secret || given !== secret) return Response.json({ error: 'unauthorized' }, { status: 401 });
  if (!configured() || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return Response.json({ error: 'Server nicht vollständig eingerichtet' }, { status: 500 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:example@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const force = url.searchParams.get('force') === '1'; // zum Testen: sofort an alle senden
  const result = { checked: 0, sent: 0, removed: 0, errors: 0 };
  let rows;
  try { rows = await listReminders(); } catch (e) { console.error(e); return Response.json({ error: 'Datenbank nicht erreichbar' }, { status: 500 }); }

  for (const r of rows) {
    result.checked++;
    try {
      const now = localNow(r.tz || 'Europe/Berlin');
      const [h, m] = String(r.time).split(':').map(Number);
      const diff = now.minutes - (h * 60 + m);
      const due = diff >= 0 && diff < WINDOW_MIN && r.last_sent !== now.date;
      if (!force && !due) continue;
      const payload = JSON.stringify({
        title: 'Mein 45-Tage-Weg',
        body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
        url: '/',
      });
      await webpush.sendNotification(r.subscription, payload, { TTL: 60 * 60 });
      if (!force) await markSent(r.endpoint, now.date);
      result.sent++;
    } catch (e) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) {
        await deleteReminder(r.endpoint).catch(() => {});
        result.removed++;
      } else {
        console.error('push error', e && (e.statusCode || e.message));
        result.errors++;
      }
    }
  }
  return Response.json(result);
}
