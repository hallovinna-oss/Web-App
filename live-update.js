/* MIPHA Companion live deployment update notifier. */
(function () {
  const CHECK_INTERVAL_MS = 5 * 60 * 1000;
  const CHECK_PATH = '/index.html';
  let currentSignature = null;
  let checking = false;
  let updateShown = false;

  async function deploymentSignature() {
    const response = await fetch(`${CHECK_PATH}?update-check=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error(`Update check failed: ${response.status}`);
    return [
      response.headers.get('etag') || '',
      response.headers.get('last-modified') || '',
      response.headers.get('content-length') || ''
    ].join('|');
  }

  function showUpdateNotice() {
    if (updateShown) return;
    updateShown = true;
    const notice = document.createElement('div');
    notice.id = 'mipha-live-update';
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'position:fixed;left:12px;right:12px;bottom:76px;z-index:10000;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:14px;background:#3b0764;color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.28);font:600 14px/1.35 system-ui,sans-serif';
    notice.innerHTML = '<span>Versi MIPHA terbaru tersedia.</span><button type="button" style="border:0;border-radius:10px;padding:9px 12px;background:#fff;color:#581c87;font-weight:800;white-space:nowrap">Muat sekarang</button>';
    notice.querySelector('button').addEventListener('click', () => window.location.reload());
    document.body.appendChild(notice);
  }

  async function checkForUpdate(initial = false) {
    if (checking || updateShown || !navigator.onLine) return;
    checking = true;
    try {
      const signature = await deploymentSignature();
      if (initial || !currentSignature) currentSignature = signature;
      else if (signature && signature !== currentSignature) showUpdateNotice();
    } catch (error) {
      console.warn('Live update check skipped:', error.message);
    } finally {
      checking = false;
    }
  }

  window.addEventListener('load', () => checkForUpdate(true));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate(false);
  });
  window.setInterval(() => checkForUpdate(false), CHECK_INTERVAL_MS);
})();
