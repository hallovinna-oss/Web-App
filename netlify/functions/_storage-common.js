const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCz7C-Vq-l9Q1Vp3F_gFmbznmiLPs1ICPY';

function json(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) };
}

async function requireFirebaseUser(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw Object.assign(new Error('Login diperlukan.'), { statusCode: 401 });
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken: token })
  });
  const result = await response.json();
  if (!response.ok || !result.users?.[0]) throw Object.assign(new Error('Sesi login tidak valid.'), { statusCode: 401 });
  return result.users[0];
}

function config() {
  const baseUrl = String(process.env.NEXTCLOUD_URL || '').replace(/\/$/, '');
  const username = process.env.NEXTCLOUD_USERNAME || '';
  const password = process.env.NEXTCLOUD_APP_PASSWORD || '';
  const root = safeSegment(process.env.NEXTCLOUD_ROOT_FOLDER || 'MIPHA');
  if (!baseUrl || !username || !password) throw Object.assign(new Error('Cloud Storage Drive belum dikonfigurasi.'), { statusCode: 503 });
  return { baseUrl, username, root, auth: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}` };
}

function safeSegment(value, fallback = 'file') {
  const clean = String(value || '').normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(0, 100);
  return clean || fallback;
}

function webdavUrl(cfg, relativePath = '') {
  const parts = relativePath.split('/').filter(Boolean).map(encodeURIComponent);
  return `${cfg.baseUrl}/remote.php/dav/files/${encodeURIComponent(cfg.username)}/${parts.join('/')}`;
}

async function ensureFolders(cfg, relativeFolder) {
  const parts = relativeFolder.split('/').filter(Boolean);
  for (let i = 1; i <= parts.length; i += 1) {
    const response = await fetch(webdavUrl(cfg, parts.slice(0, i).join('/')), { method: 'MKCOL', headers: { Authorization: cfg.auth } });
    if (![201, 301, 405].includes(response.status)) throw Object.assign(new Error('Folder penyimpanan tidak dapat dibuat.'), { statusCode: 502 });
  }
}

module.exports = { json, requireFirebaseUser, config, safeSegment, webdavUrl, ensureFolders };
