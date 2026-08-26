const { json } = require('./_storage-common');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCz7C-Vq-l9Q1Vp3F_gFmbznmiLPs1ICPY';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vptvntgijeegognwuqzm.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

function emailFor(username, role) {
  const clean = String(username || '').trim().toLowerCase();
  return role === 'guru' ? 'admin@mipha-companion.local' : `${clean}@mipha-companion.local`;
}

function passwordFor(username, password, role) {
  const cleanUsername = String(username || '').trim();
  const cleanPassword = String(password || '');
  return role !== 'guru' && cleanPassword === cleanUsername && /^\d{4}$/.test(cleanUsername)
    ? `${cleanPassword}00`
    : cleanPassword;
}

async function verifyFirebase(email, password) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.localId) {
    throw Object.assign(new Error('Username atau password lama tidak valid.'), { statusCode: 401 });
  }
  return result;
}

function decodeFirestoreValue(value = {}) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {});
  return null;
}

function decodeFirestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

async function readFirebaseCollection(collection, idToken) {
  const rows = [];
  let pageToken = '';
  do {
    const target = new URL(`https://firestore.googleapis.com/v1/projects/mipha-companion/databases/(default)/documents/${encodeURIComponent(collection)}`);
    target.searchParams.set('pageSize', '300');
    if (pageToken) target.searchParams.set('pageToken', pageToken);
    const response = await fetch(target, { headers: { Authorization: `Bearer ${idToken}` } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(`Data ${collection} tidak dapat dibaca dari Firebase.`), { statusCode: 502 });
    for (const document of result.documents || []) {
      rows.push({ id: String(document.name || '').split('/').pop(), data: decodeFirestoreFields(document.fields || {}) });
    }
    pageToken = result.nextPageToken || '';
  } while (pageToken);
  return rows;
}

function ownerFor(collection, data) {
  if (collection === 'students') return data.id || data.studentId || null;
  return data.studentId || data.ownerId || null;
}

async function upsertAppRecords(rows) {
  for (let index = 0; index < rows.length; index += 200) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_records?on_conflict=collection,record_id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        'content-type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(rows.slice(index, index + 200))
    });
    if (!response.ok) throw Object.assign(new Error('Data aplikasi tidak dapat disimpan ke Supabase.'), { statusCode: 502 });
  }
}

async function hasCompletedDataMigration() {
  const target = `${SUPABASE_URL}/rest/v1/app_records?collection=eq.settings&record_id=eq.firebaseFullMigrationV1&select=record_id&limit=1`;
  const response = await fetch(target, { headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` } });
  if (!response.ok) return false;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows.length > 0;
}

async function migrateFirebaseData(idToken) {
  if (await hasCompletedDataMigration()) return { skipped: true };
  const collections = ['attendance', 'leaveRequests', 'students', 'assignments', 'assignmentSubmissions', 'gradeReports', 'homeVisits', 'announcements', 'settings'];
  const counts = {};
  for (const collection of collections) {
    const documents = await readFirebaseCollection(collection, idToken);
    const rows = documents.map(document => ({
      collection,
      record_id: document.id,
      owner_id: ownerFor(collection, document.data),
      record_date: document.data.date || null,
      data: document.data
    }));
    if (rows.length) await upsertAppRecords(rows);
    counts[collection] = rows.length;
  }
  await upsertAppRecords([{
    collection: 'settings',
    record_id: 'firebaseFullMigrationV1',
    owner_id: null,
    record_date: null,
    data: { completedAt: new Date().toISOString(), counts }
  }]);
  return counts;
}

async function supabaseAdmin(path, options = {}) {
  if (!SUPABASE_SECRET_KEY) throw Object.assign(new Error('Migrasi login belum diaktifkan pada server.'), { statusCode: 503 });
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result.msg || result.message || result.error || 'Migrasi akun gagal.'), { statusCode: 502 });
  return result;
}

async function findSupabaseUser(email) {
  const result = await supabaseAdmin('/users?page=1&per_page=1000');
  return (result.users || []).find(user => String(user.email || '').toLowerCase() === email.toLowerCase()) || null;
}

async function upsertProfile(user, username, role, student) {
  const profile = role === 'guru'
    ? { uid: user.id, student_id: null, username: 'admin', name: 'Gevin Dimas Eka Kusuma, A.Md.', role: 'guru', data: {} }
    : {
        uid: user.id,
        student_id: String(student?.id || username),
        username: String(username),
        name: String(student?.name || username),
        role: 'siswa',
        data: { ...(student || {}), password: undefined, pin: undefined }
      };
  delete profile.data.password;
  delete profile.data.pin;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=uid`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      'content-type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify(profile)
  });
  if (!response.ok) throw Object.assign(new Error('Profil Supabase tidak dapat disiapkan.'), { statusCode: 502 });
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  try {
    const input = JSON.parse(event.body || '{}');
    const role = input.role === 'guru' ? 'guru' : 'siswa';
    const username = String(input.username || '').trim();
    const password = String(input.password || '');
    if (!username || !password || (role === 'siswa' && !/^\d{4,20}$/.test(username))) {
      return json(422, { error: 'Data login tidak valid.' });
    }

    const email = emailFor(username, role);
    const realPassword = passwordFor(username, password, role);
    const firebaseUser = await verifyFirebase(email, realPassword);

    let user = await findSupabaseUser(email);
    if (user) {
      user = await supabaseAdmin(`/users/${encodeURIComponent(user.id)}`, {
        method: 'PUT',
        body: JSON.stringify({ password: realPassword, email_confirm: true })
      });
    } else {
      user = await supabaseAdmin('/users', {
        method: 'POST',
        body: JSON.stringify({ email, password: realPassword, email_confirm: true })
      });
    }
    await upsertProfile(user, username, role, input.student);
    const migrated = role === 'guru' ? await migrateFirebaseData(firebaseUser.idToken) : null;
    return json(200, { success: true, migrated });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Migrasi login gagal.' });
  }
};

exports._test = { emailFor, passwordFor, decodeFirestoreValue, decodeFirestoreFields, ownerFor };
