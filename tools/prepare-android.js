const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
const permissions = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.CAMERA'
];
for (const permission of permissions) {
  if (!manifest.includes(permission)) {
    manifest = manifest.replace(
      '</manifest>',
      `    <uses-permission android:name="${permission}" />\n</manifest>`
    );
  }
}
fs.writeFileSync(manifestPath, manifest, 'utf8');
console.log('Android location and camera permissions configured.');

