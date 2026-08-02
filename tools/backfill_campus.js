// Backfill campusId/campusName for attendance documents based on distanceMeters.
// Usage:
// 1) Place your Firebase service account JSON at `tools/serviceAccountKey.json`.
// 2) Adjust `migration-config.json` if needed.
// 3) Run: `node tools/backfill_campus.js --year=2026 --dryRun` or without --dryRun to apply.

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { haversineDistance } = require('../lib/geo-utils');

(async function main() {
  const args = process.argv.slice(2);
  const opts = {};
  args.forEach(a => {
    const [k,v] = a.split('=');
    if (k === '--year') opts.year = v;
    if (k === '--dryRun') opts.dryRun = true;
    if (k === '--limit') opts.limit = parseInt(v,10) || undefined;
  });

  const svcPath = path.join(__dirname, 'serviceAccountKey.json');
  if (!fs.existsSync(svcPath)) {
    console.error('Missing service account key at tools/serviceAccountKey.json');
    process.exit(1);
  }
  const serviceAccount = require(svcPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  const configPath = path.join(__dirname, 'migration-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Missing migration-config.json');
    process.exit(1);
  }
  const cfg = require(configPath);
  const campuses = cfg.campuses || [];

  console.log('Starting backfill. Dry run:', !!opts.dryRun);

  let q = db.collection('attendance');
  const snapshot = await q.get();
  console.log('Fetched', snapshot.size, 'attendance docs');

  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    if (opts.year && !doc.id.startsWith(String(opts.year))) continue;
    const data = doc.data();
    if (data.campusId) { skipped++; continue; }

    const dist = data.distanceMeters;
    if (typeof dist === 'number') {
      // find any campus where distance <= radius
      let matched = campuses.find(c => dist <= (c.radiusMeters || 75));
      if (!matched) {
        // no match by radius; optionally choose nearest by comparing dist to campus center distance? We can't know student's coords, skip.
        skipped++; continue;
      }

      const update = { campusId: matched.id, campusName: matched.name };
      if (opts.dryRun) {
        console.log('[DRY]', doc.id, '->', update);
      } else {
        await doc.ref.set(update, { merge: true });
        console.log('Updated', doc.id, 'with', update);
      }
      updated++;
    } else {
      skipped++;
    }
    if (opts.limit && updated >= opts.limit) break;
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
  process.exit(0);
})();
