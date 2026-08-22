const { json, requireFirebaseUser, config, safeSegment, webdavUrl, ensureFolders } = require('./_storage-common');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Metode tidak diizinkan.' });
  try {
    const user = await requireFirebaseUser(event);
    const input = JSON.parse(event.body || '{}');
    const size = Number(input.size || 0);
    if (!input.data || size <= 0 || size > 4 * 1024 * 1024) return json(400, { error: 'File harus berukuran 1 byte sampai 4 MB.' });
    const allowed = /^(image\/|application\/pdf$|text\/plain$|application\/msword$|application\/vnd\.openxmlformats-officedocument\.)/;
    if (!allowed.test(input.type || '')) return json(400, { error: 'Jenis file tidak didukung.' });

    const cfg = config();
    const folder = [cfg.root, safeSegment(input.category, 'documents'), safeSegment(input.ownerId || user.localId, user.localId)].join('/');
    await ensureFolders(cfg, folder);
    const storedName = `${Date.now()}_${safeSegment(input.name)}`;
    const path = `${folder}/${storedName}`;
    const bytes = Buffer.from(input.data, 'base64');
    if (bytes.length !== size) return json(400, { error: 'Isi file tidak valid.' });
    const response = await fetch(webdavUrl(cfg, path), {
      method: 'PUT', headers: { Authorization: cfg.auth, 'content-type': input.type || 'application/octet-stream' }, body: bytes
    });
    if (!response.ok) return json(502, { error: 'Cloud Storage Drive menolak unggahan.' });
    return json(200, { url: `nextcloud:${path}`, path, name: input.name, type: input.type, size });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Unggahan gagal.' });
  }
};
