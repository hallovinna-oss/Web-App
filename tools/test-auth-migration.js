const assert = require('assert');
const { emailFor, passwordFor, decodeFirestoreFields, ownerFor } = require('../netlify/functions/migrate-auth-login')._test;

assert.strictEqual(emailFor('admin', 'guru'), 'admin@mipha-companion.local');
assert.strictEqual(emailFor('6289', 'siswa'), '6289@mipha-companion.local');
assert.strictEqual(passwordFor('6289', '6289', 'siswa'), '628900');
assert.strictEqual(passwordFor('6289', 'rahasia', 'siswa'), 'rahasia');

const decoded = decodeFirestoreFields({
  name: { stringValue: 'Siswa' },
  score: { integerValue: '88' },
  active: { booleanValue: true },
  tags: { arrayValue: { values: [{ stringValue: 'A' }, { stringValue: 'B' }] } },
  profile: { mapValue: { fields: { nis: { stringValue: '6289' } } } }
});
assert.deepStrictEqual(decoded, { name: 'Siswa', score: 88, active: true, tags: ['A', 'B'], profile: { nis: '6289' } });
assert.strictEqual(ownerFor('attendance', { studentId: 'std_6289' }), 'std_6289');
assert.strictEqual(ownerFor('students', { id: 'std_6289' }), 'std_6289');

console.log('TEST PASS: Firebase auth and Firestore migration helpers');
