/* Attendance Engine 2.0 - RC4 helper module
   Provides geofencing and attendance status helpers.
   Exposes `window.AttendanceEngine` for backward-compatible access.
*/
(function () {
  function toRad(v) { return v * Math.PI / 180; }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    try {
      if (window.GeoUtils && typeof window.GeoUtils.haversineDistance === 'function') {
        return window.GeoUtils.haversineDistance(lat1, lon1, lat2, lon2);
      }
    } catch (e) {}
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function isWithinCampus(lat, lon, campus) {
    const d = haversineDistance(lat, lon, campus.lat, campus.lng);
    return { inside: d <= (campus.radiusMeters || 75), distance: d };
  }

  function findContainingCampus(lat, lon, campuses) {
    if (!Array.isArray(campuses)) return null;
    for (let i = 0; i < campuses.length; i++) {
      const c = campuses[i];
      const res = isWithinCampus(lat, lon, c);
      if (res.inside) return { campus: c, distance: res.distance };
    }
    return null;
  }

  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const parts = ('' + timeStr).split(':').map(p => parseInt(p, 10));
    if (parts.length < 2) return null;
    return parts[0] * 60 + parts[1];
  }

  function determineStatus({ checkinTime, now = new Date(), config = {} }) {
    // Returns app-compatible status codes used in AppState:
    // Missing check-in is not evidence of absence. Only an explicit, valid record
    // may become Alpha in the application.
    const onHour = config.onTimeLimitHour ?? 7;
    const onMinute = config.onTimeLimitMinute ?? 0;
    const deadlineMinutes = onHour * 60 + onMinute;

    if (!checkinTime) {
      return { code: 'belum_checkin', label: 'Belum Check-in' };
    }

    // has checkin
    const checkinDate = new Date(checkinTime);
    const checkinMinutes = checkinDate.getHours() * 60 + checkinDate.getMinutes();
    return { code: 'tepat_waktu', label: 'Hadir' };
  }

  function findNearestCampus(lat, lon, campuses) {
    if (!Array.isArray(campuses) || campuses.length === 0) return null;
    let nearest = null;
    for (let i = 0; i < campuses.length; i++) {
      const c = campuses[i];
      const d = haversineDistance(lat, lon, c.lat, c.lng);
      if (!nearest || d < nearest.distance) nearest = { campus: c, distance: d };
    }
    return nearest;
  }

  // Expose API only when not already defined by the new module.
  if (!window.AttendanceEngine) {
    window.AttendanceEngine = {
      haversineDistance,
      isWithinCampus,
      findContainingCampus,
      findNearestCampus,
      determineStatus,
      parseTimeToMinutes
    };
  }
})();
