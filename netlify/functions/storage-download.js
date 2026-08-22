const { json, requireFirebaseUser, config, webdavUrl } = require('./_storage-common');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  try {
    await requireFirebaseUser(event);
    const input = JSON.parse(event.body || '{}');
    const cfg = config();
    const path = String(input.path || '');
    if (!path.startsWith(`${cfg.root}/`) || path.includes('..')) return json(400, { error: 'Lokasi file tidak valid.' });
    const response = await fetch(webdavUrl(cfg, path), { headers: { Authorization: cfg.auth } });
    if (!response.ok) return json(response.status === 404 ? 404 : 502, { error: 'File tidak ditemukan.' });
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: { 'content-type': response.headers.get('content-type') || 'application/octet-stream', 'cache-control': 'private, no-store' },
      body: bytes.toString('base64')
    };
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'File gagal dibuka.' });
  }
};
