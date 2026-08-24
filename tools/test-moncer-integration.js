const assert = require('assert');
const { _test } = require('../netlify/functions/moncer-attendance');

const lookup = {
  success: true,
  data: [
    { kode_absen: '4592', nisn: '6289', nama: 'Siswa Contoh' },
    { kode_absen: '7777', nisn: '6290', nama: 'Siswa Kedua' }
  ]
};

assert.deepStrictEqual(_test.resolveAttendanceCode(lookup, '6289').code, '4592');
assert.deepStrictEqual(_test.resolveAttendanceCode(lookup, '4592').code, '4592');
assert.strictEqual(_test.resolveAttendanceCode(lookup, '9999'), null);
assert(_test.distanceMeters(-7.281462945129072, 110.09827607588974, -7.281462945129072, 110.09827607588974) === 0);
console.log('TEST PASS: NIS resolves to Moncer kode_absen and campus distance remains valid');
