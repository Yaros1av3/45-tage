import { configured, upsertReminder, deleteReminder } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function validTz(tz) {
  try { new Intl.DateTimeFormat('de-DE', { timeZone: tz }); return true; } catch (e) { return false; }
}

// Erinnerung speichern oder ändern
export async function POST(req) {
  if (!configured()) return Response.json({ error: 'Server nicht eingerichtet' }, { status: 500 });
  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 }); }
  const { subscription, time, tz } = body || {};
  const ok =
    subscription && typeof subscription.endpoint === 'string' && subscription.endpoint.startsWith('https://') &&
    subscription.keys && subscription.keys.p256dh && subscription.keys.auth &&
    typeof time === 'string' && TIME.test(time) && typeof tz === 'string' && validTz(tz);
  if (!ok) return Response.json({ error: 'Ungültige Daten' }, { status: 400 });
  try {
    await upsertReminder({
      endpoint: subscription.endpoint,
      subscription: { endpoint: subscription.endpoint, keys: subscription.keys },
      time, tz, last_sent: null,
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 });
  }
}

// Erinnerung löschen
export async function DELETE(req) {
  if (!configured()) return Response.json({ error: 'Server nicht eingerichtet' }, { status: 500 });
  let body;
  try { body = await req.json(); } catch (e) { return Response.json({ error: 'Ungültige Anfrage' }, { status: 400 }); }
  if (!body || typeof body.endpoint !== 'string') return Response.json({ error: 'Ungültige Daten' }, { status: 400 });
  try {
    await deleteReminder(body.endpoint);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 });
  }
}
