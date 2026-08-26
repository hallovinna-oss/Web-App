const { json, requireSupabaseUser } = require('./_storage-common');

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

function resolveAttendanceCode(lookupResult, nis) {
  const rows = Array.isArray(lookupResult?.data) ? lookupResult.data : [];
  const matched = rows.find(item =>
    String(item.nisn || item.nis || '').trim() === String(nis).trim()
    || String(item.kode_absen || item.qr_codena || '').trim() === String(nis).trim()
  );
  if (!matched) return null;
  const code = String(matched.kode_absen || matched.qr_codena || '').trim();
  return code ? { code, student: matched } : null;
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  try {
    const user = await requireSupabaseUser(event);
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

    const apiHeaders = { 'X-API-Key': apiKey };
    const lookupTarget = new URL(baseUrl);
    lookupTarget.searchParams.set('action', 'cari');
    lookupTarget.searchParams.set('q', nis);
    lookupTarget.searchParams.set('limit', '20');
    const lookupResponse = await fetch(lookupTarget, { headers: apiHeaders });
    const lookupResult = await lookupResponse.json().catch(() => ({}));
    const resolvedStudent = resolveAttendanceCode(lookupResult, nis);
    if (!resolvedStudent) {
      return json(404, { error: `NIS ${nis} tidak ditemukan pada data Moncer. Hubungi admin untuk memeriksa kode absennya.` });
    }
    const attendanceCode = resolvedStudent.code;

    const target = new URL(baseUrl);
    target.searchParams.set('action', 'absen');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(target, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...apiHeaders },
        body: JSON.stringify(method === 'gps' ? { kode: attendanceCode, latitude, longitude } : { kode: attendanceCode }),
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

    const verifyTarget = new URL(baseUrl);
    verifyTarget.searchParams.set('action', 'cek_presensi');
    verifyTarget.searchParams.set('uid', attendanceCode);
    verifyTarget.searchParams.set('tanggal', new Date().toISOString().slice(0, 10));
    const verifyResponse = await fetch(verifyTarget, { headers: apiHeaders });
    const verifyResult = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok || verifyResult.success !== true || !verifyResult.data?.jam_datang) {
      return json(502, { error: 'Moncer merespons, tetapi presensi belum terverifikasi pada rekapan Moncer.' });
    }

    return json(200, {
      success: true,
      verified: true,
      message: 'Presensi berhasil dikirim dan diverifikasi pada Moncer.',
      data: {
        kode_absen: verifyResult.data.kode_absen || attendanceCode,
        nisn: verifyResult.data.nisn || nis,
        tanggal: verifyResult.data.tanggal || null,
        jam_datang: verifyResult.data.jam_datang || null,
        jam_pulang: verifyResult.data.jam_pulang || null,
        keterangan: verifyResult.data.keterangan || null,
        status: result.data?.status || verifyResult.data.status || null,
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

exports._test = { distanceMeters, resolveAttendanceCode };
