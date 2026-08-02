import { haversineDistance, parseTimeToMinutes } from '../utils/geo-utils.js';

/*
 * Attendance Engine Module
 * Centralizes attendance status rules and campus containment logic.
 */

function isWithinCampus(lat, lon, campus) {
  const distance = haversineDistance(lat, lon, campus.lat, campus.lng);
  return { inside: distance <= (campus.radiusMeters || 75), distance };
}

function findContainingCampus(lat, lon, campuses) {
  if (!Array.isArray(campuses)) return null;
  for (const campus of campuses) {
    const result = isWithinCampus(lat, lon, campus);
    if (result.inside) return { campus, distance: result.distance };
  }
  return null;
}

function findNearestCampus(lat, lon, campuses) {
  if (!Array.isArray(campuses) || campuses.length === 0) return null;
  let nearest = null;
  for (const campus of campuses) {
    const distance = haversineDistance(lat, lon, campus.lat, campus.lng);
    if (!nearest || distance < nearest.distance) nearest = { campus, distance };
  }
  return nearest;
}

function determineStatus({ checkinTime, now = new Date(), config = {} }) {
  const onHour = Number(config.onTimeLimitHour ?? 7);
  const onMinute = Number(config.onTimeLimitMinute ?? 0);
  const deadlineMinutes = onHour * 60 + onMinute;

  if (!checkinTime) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes <= deadlineMinutes
      ? { code: 'belum_checkin', label: 'Belum Check-in' }
      : { code: 'A', label: 'Absent' };
  }

  const checkinDate = new Date(checkinTime);
  const checkinMinutes = checkinDate.getHours() * 60 + checkinDate.getMinutes();
  return checkinMinutes <= deadlineMinutes
    ? { code: 'tepat_waktu', label: 'Present' }
    : { code: 'terlambat', label: 'Late' };
}

const AttendanceEngine = {
  haversineDistance,
  parseTimeToMinutes,
  isWithinCampus,
  findContainingCampus,
  findNearestCampus,
  determineStatus
};

window.AttendanceEngine = AttendanceEngine;
export default AttendanceEngine;
