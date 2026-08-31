const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const method = source.slice(source.indexOf('  async retryMoncerSync()'), source.indexOf('  generateMonthlyAttendanceSeed()'));
const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
async function run() {
  for (const scenario of ['success', 'moncer-fails', 'database-fails', 'old', 'busy', 'already-synced']) {
    let sends = 0, writes = 0;
    const backend = { auth: { currentUser: {} },
      async syncMoncerAttendance(nis) { sends++; assert.equal(nis, '6289'); if (scenario === 'moncer-fails') throw Error('offline'); return { success: true, verified: true, message: 'verified' }; },
      async writeAttendanceRecord(id, date, status, data) { writes++; assert.equal(data.checkinTime, '06:37 WIB'); assert.equal(date, today); if (scenario === 'database-fails') throw Error('offline'); }
    };
    const context = { Date, alert() {}, window: { SupabaseBackend: backend }, SupabaseBackend: backend };
    const app = vm.runInNewContext(`({${method}})`, context);
    Object.assign(app, { currentUser: { id: 's1', nis: '6289', role: 'siswa' }, attendanceDate: today,
      attendance: { s1: { date: scenario === 'old' ? '2020-01-01' : today, checkinTime: '06:37 WIB', status: 'tepat_waktu', moncerSync: scenario === 'already-synced' ? 'success' : 'failed' } },
      moncerRetryBusy: scenario === 'busy', saveState() {}, render() {} });
    await app.retryMoncerSync();
    assert.equal(sends, ['old', 'busy', 'already-synced'].includes(scenario) ? 0 : 1);
    assert.equal(writes, ['old', 'busy'].includes(scenario) ? 0 : 1);
    assert.equal(app.attendance.s1.checkinTime, '06:37 WIB');
    if (scenario === 'moncer-fails') assert.equal(app.attendance.s1.cloudSync, 'success');
    if (scenario === 'database-fails') { assert.equal(app.attendance.s1.moncerSync, 'success'); assert.equal(app.attendance.s1.cloudSync, 'failed'); }
  }
  console.log('TEST PASS: retry preserves check-in; independent destinations; old-date and duplicate guards');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
