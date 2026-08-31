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

const MONCER_API_URL = 'https://absen.mipha.sch.id/api.php';

function resolveApiUrl(configured) {
  const url = String(configured || '').trim().replace(/\/$/, '');
  if (!url || url === MONCER_API_URL) return MONCER_API_URL;
  throw Object.assign(new Error('Alamat API Moncer tidak sesuai domain presensi sekolah. Periksa MONCER_API_BASE_URL.'), { statusCode: 503 });
}

function jakartaDate(now = new Date()) {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function requestMoncer(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { ...options, redirect: 'error', signal: controller.signal });
    let result;
    try { result = await response.json(); } catch { throw Object.assign(new Error('API Moncer mengembalikan respons bukan JSON.'), { statusCode: 502 }); }
    if (!response.ok && response.status !== 404) throw Object.assign(new Error(`API Moncer gagal (${response.status}). Periksa koneksi dan API key.`), { statusCode: 502 });
    return { response, result };
  } finally { clearTimeout(timeout); }
}

function verifiedArrival(result, code, date) {
  const data = result?.data;
  return result?.success === true && String(data?.kode_absen || '') === code
    && data?.tanggal === date && /^\d{2}:\d{2}(?::\d{2})?$/.test(String(data?.jam_datang || ''))
    && !/^00:00(?::00)?$/.test(data.jam_datang);
}

exports.handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  try {
    const user = await requireSupabaseUser(event);
    const input = JSON.parse(event.body || '{}');
    if (input.date && input.date !== jakartaDate()) return json(422, { error: 'Absensi hari sebelumnya tidak boleh dikirim sebagai kehadiran hari ini.' });
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
    const baseUrl = resolveApiUrl(process.env.MONCER_API_BASE_URL);
    if (!apiKey) return json(503, { error: 'Integrasi Moncer belum dikonfigurasi.' });

    const apiHeaders = { 'X-API-Key': apiKey };
    // School configuration: the attendance code is the authenticated student's NIS.
    // Do not search NISN or translate to a different card code.
    const attendanceCode = nis;

    const date = jakartaDate();
    const verifyTarget = new URL(baseUrl);
    verifyTarget.searchParams.set('action', 'cek_presensi');
    verifyTarget.searchParams.set('uid', attendanceCode);
    verifyTarget.searchParams.set('tanggal', date);
    const before = await requestMoncer(verifyTarget, { headers: apiHeaders });
    if (verifiedArrival(before.result, attendanceCode, date)) {
      return json(200, { success: true, verified: true, alreadyPresent: true, message: 'Check-in hari ini sudah terverifikasi di Moncer; tidak dikirim ulang.', data: before.result.data });
    }
    if (before.response.status !== 404) return json(502, { error: 'Status awal presensi Moncer belum dapat dipastikan. Pengiriman dibatalkan untuk mencegah presensi ganda.' });

    const target = new URL(baseUrl);
    target.searchParams.set('action', 'absen');
    const { response, result } = await requestMoncer(target, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...apiHeaders },
        body: JSON.stringify(method === 'gps' ? { kode: attendanceCode, latitude, longitude } : { kode: attendanceCode }),
      });
    if (!response.ok || result.success !== true) {
      const message = result.message || result.error || `Moncer menolak presensi (${response.status}).`;
      return json(response.status >= 400 && response.status < 500 ? response.status : 502, { error: message });
    }

    const { response: verifyResponse, result: verifyResult } = await requestMoncer(verifyTarget, { headers: apiHeaders });
    if (!verifyResponse.ok || !verifiedArrival(verifyResult, attendanceCode, date)) {
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

exports._test = { distanceMeters, resolveApiUrl, jakartaDate, verifiedArrival };
