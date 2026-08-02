import APP_CONFIG from '../config/index.js';

/**
 * Campus service provides campus lookup and configuration helpers.
 */

export function getCampuses() {
  return Array.isArray(APP_CONFIG.campuses) ? APP_CONFIG.campuses : [];
}

export function getPrimaryCampus() {
  return getCampuses()[0] || null;
}

export function hasMultipleCampuses() {
  return getCampuses().length > 1;
}
