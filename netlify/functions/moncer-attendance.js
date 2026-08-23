const { json, requireFirebaseUser } = require('./_storage-common');

const CAMPUSES = [
  { id: 'campus_1', lat: -7.281462945129072, lng: 110.09827607588974, radiusMeters: 100 },
  { id: 'campus_2', lat: -7.282467, lng: 110.096915, radiusMeters: 100 }
];

function distanceMeters(lat1, lng1, lat2, lng2) {
  const toRadians = value => value * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  try {
    const user = await requireFirebaseUser(event);
    const input = JSON.parse(event.body || '{}');
    const nis = String(input.nis || '').trim();
    const method = input.method === 'nis' ? 'nis' : 'gps';
    const latitude = Number(input.latitude);
    const longitude = Number(input.longitude);
    const gpsAccuracy = Number(input.gpsAccuracy);

    if (!/^\d{4,20}$/.test(nis)) return json(422, { error: 'NIS tidak valid.' });
    if (String(user.email || '').toLowerCase() !== `${nis}@mipha-companion.local`) {
      return json(403, { error: 'Akun login tidak sesuai dengan NIS presensi.' });
    }
    let nearest = null;
    if (method === 'gps') {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return json(422, { error: 'Koordinat GPS wajib diisi.' });
      }
      if (!Number.isFinite(gpsAccuracy) || gpsAccuracy <= 0 || gpsAccuracy > 20) {
        return json(422, { error: 'Akurasi GPS harus 20 meter atau lebih baik.' });
      }

      nearest = CAMPUSES
        .map(campus => ({ campus, distance: distanceMeters(latitude, longitude, campus.lat, campus.lng) }))
        .sort((a, b) => a.distance - b.distance)[0];
      if (!nearest || nearest.distance > nearest.campus.radiusMeters) {
        return json(403, { error: 'Posisi berada di luar radius sekolah.', distance: nearest?.distance || null });
      }
    }

    const apiKey = String(process.env.MONCER_API_KEY || '').trim();
    const baseUrl = String(process.env.MONCER_API_BASE_URL || 'https://absen.mipha.sch.id/api.php').trim();
    if (!apiKey) return json(503, { error: 'Integrasi Moncer belum dikonfigurasi.' });

    const target = new URL(baseUrl);
    target.searchParams.set('action', 'absen');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(target, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify(method === 'gps' ? { kode: nis, latitude, longitude } : { kode: nis }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === false) {
      const message = result.message || result.error || `Moncer menolak presensi (${response.status}).`;
      return json(response.status >= 400 && response.status < 500 ? response.status : 502, { error: message });
    }

    return json(200, {
      success: true,
      message: result.message || 'Presensi berhasil dikirim ke Moncer.',
      data: {
        kode_absen: result.data?.kode_absen || nis,
        tanggal: result.data?.tanggal || null,
        jam_datang: result.data?.jam_datang || null,
        jam_pulang: result.data?.jam_pulang || null,
        keterangan: result.data?.keterangan || null,
        status: result.data?.status || null,
        method,
        campusId: nearest?.campus.id || null,
        distanceMeters: nearest?.distance || null
      },
      serverTime: result.meta?.server_time || null
    });
  } catch (error) {
    const message = error.name === 'AbortError' ? 'Koneksi ke Moncer melewati batas waktu.' : (error.message || 'Sinkronisasi Moncer gagal.');
    return json(error.statusCode || 500, { error: message });
  }
};
