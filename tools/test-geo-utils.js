const path = require('path');
try {
  const geo = require(path.join(__dirname, '..', 'lib', 'geo-utils'));
  console.log('GeoUtils loaded:', typeof geo.haversineDistance === 'function');
  const d0 = geo.haversineDistance(0,0,0,0);
  const d1 = geo.haversineDistance(0,0,0,1);
  console.log('distance 0->0 (should be 0):', d0);
  console.log('distance 0,0 -> 0,1 (~>=111000m at equator):', d1);
  // consistency quick-check
  if (d0 === 0 && typeof d1 === 'number' && d1 > 100000) {
    console.log('TEST PASS');
    process.exit(0);
  }
  console.error('TEST FAIL');
  process.exit(2);
} catch (e) {
  console.error('ERROR running test:', e && e.stack ? e.stack : e);
  process.exit(3);
}
