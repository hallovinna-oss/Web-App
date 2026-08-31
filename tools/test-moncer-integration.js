const assert = require('assert');
const { _test } = require('../netlify/functions/moncer-attendance');

assert.strictEqual(_test.resolveApiUrl(), 'https://absen.mipha.sch.id/api.php');
assert.strictEqual(_test.resolveApiUrl('https://absen.mipha.sch.id/api.php'), 'https://absen.mipha.sch.id/api.php');
assert.throws(() => _test.resolveApiUrl('https://absen.moncer.net/presensi/api.php'));
assert.throws(() => _test.resolveApiUrl('http://unknown.test/api.php'));
assert.strictEqual(_test.jakartaDate(new Date('2026-08-30T18:00:00Z')), '2026-08-31');
const arrival = { success: true, data: { kode_absen: '4592', tanggal: '2026-08-31', jam_datang: '06:40:00' } };
assert(_test.verifiedArrival(arrival, '4592', '2026-08-31'));
assert(!_test.verifiedArrival(arrival, '4593', '2026-08-31'));
assert(!_test.verifiedArrival(arrival, '4592', '2026-08-30'));
assert(!_test.verifiedArrival({ ...arrival, data: { ...arrival.data, jam_datang: '00:00:00' } }, '4592', '2026-08-31'));
assert(_test.distanceMeters(-7.281462945129072, 110.09827607588974, -7.281462945129072, 110.09827607588974) === 0);
console.log('TEST PASS: documented API URL, Jakarta date and attendance verification');

async function testHandler() {
  const { handler } = require('../netlify/functions/moncer-attendance');
  const originalFetch = global.fetch;
  const originalKey = process.env.MONCER_API_KEY;
  const originalUrl = process.env.MONCER_API_BASE_URL;
  process.env.MONCER_API_KEY = 'test-only';
  process.env.MONCER_API_BASE_URL = 'https://absen.mipha.sch.id/api.php';
  try {
    for (const scenario of ['existing', 'new', 'html', 'ambiguous', 'wrong-date']) {
      let posts = 0;
      global.fetch = async (url, options = {}) => {
        if (String(url).includes('/auth/v1/user')) return { ok: true, json: async () => ({ id: 'test-user', email: '6289@mipha-companion.local' }) };
        assert.strictEqual(new URL(url).origin, 'https://absen.mipha.sch.id');
        assert.strictEqual(new URL(url).pathname, '/api.php');
        const action = new URL(url).searchParams.get('action');
        if (scenario === 'html') return { ok: false, status: 404, json: async () => { throw new Error('HTML'); } };
        assert.notStrictEqual(action, 'cari', 'NIS must be sent directly, without lookup');
        if (action === 'absen') {
          assert.strictEqual(options.method, 'POST');
          assert.strictEqual(JSON.parse(options.body).kode, '6289');
          posts++; return { ok: true, status: 200, json: async () => ({ success: true }) };
        }
        assert.strictEqual(new URL(url).searchParams.get('uid'), '6289');
        if (!posts && scenario !== 'existing') return { ok: scenario === 'ambiguous', status: scenario === 'ambiguous' ? 200 : 404, json: async () => ({ success: false }) };
        return { ok: true, status: 200, json: async () => ({ ...arrival, data: { ...arrival.data, kode_absen: '6289', tanggal: scenario === 'wrong-date' ? '2020-01-01' : _test.jakartaDate() } }) };
      };
      const response = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer test' }, body: JSON.stringify({ nis: '6289', method: 'nis' }) });
      assert.strictEqual(response.statusCode, ['existing', 'new'].includes(scenario) ? 200 : 502, scenario);
      assert.strictEqual(posts, ['new', 'wrong-date'].includes(scenario) ? 1 : 0, scenario);
    }
    global.fetch = async url => {
      assert(String(url).includes('/auth/v1/user'), 'Invalid identity/GPS must never reach Moncer');
      return { ok: true, json: async () => ({ id: 'test-user', email: '6289@mipha-companion.local' }) };
    };
    for (const [body, expected] of [
      [{ nis: '6312', method: 'nis' }, 403],
      [{ nis: '6289', method: 'gps', latitude: 0, longitude: 0, gpsAccuracy: 5 }, 403],
      [{ nis: '6289', method: 'gps', latitude: -7.281462945129072, longitude: 110.09827607588974, gpsAccuracy: 99 }, 422]
    ]) {
      const response = await handler({ httpMethod: 'POST', headers: { authorization: 'Bearer test' }, body: JSON.stringify(body) });
      assert.strictEqual(response.statusCode, expected);
    }
    console.log('TEST PASS: direct NIS submission, identity/GPS checks, repeat prevention, malformed responses and verification');
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.MONCER_API_KEY; else process.env.MONCER_API_KEY = originalKey;
    if (originalUrl === undefined) delete process.env.MONCER_API_BASE_URL; else process.env.MONCER_API_BASE_URL = originalUrl;
  }
}
testHandler().catch(error => { console.error(error); process.exitCode = 1; });
