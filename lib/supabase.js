// Minimaler Zugriff auf die Supabase-Tabelle "reminders" (nur auf dem Server benutzen!).
const base = () => `${process.env.SUPABASE_URL}/rest/v1`;
const headers = (extra = {}) => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const h = { apikey: key, 'Content-Type': 'application/json', ...extra };
  // Alte Schlüssel (eyJ...) gehen auch als Bearer, neue Schlüssel (sb_secret_...) nur als apikey
  if (!key.startsWith('sb_')) h.Authorization = `Bearer ${key}`;
  return h;
};
async function check(res) {
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res;
}

export const configured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function upsertReminder(row) {
  await check(await fetch(`${base()}/reminders?on_conflict=endpoint`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(row),
    cache: 'no-store',
  }));
}

export async function deleteReminder(endpoint) {
  await check(await fetch(`${base()}/reminders?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: 'DELETE', headers: headers(), cache: 'no-store',
  }));
}

export async function listReminders() {
  const res = await check(await fetch(`${base()}/reminders?select=*`, { headers: headers(), cache: 'no-store' }));
  return res.json();
}

export async function markSent(endpoint, date) {
  await check(await fetch(`${base()}/reminders?endpoint=eq.${encodeURIComponent(endpoint)}`, {
    method: 'PATCH', headers: headers({ Prefer: 'return=minimal' }), body: JSON.stringify({ last_sent: date }), cache: 'no-store',
  }));
}
