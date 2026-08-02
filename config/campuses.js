// Central campus configuration for MIPHA Companion
// Exported as an ES module and also attaches to window for legacy scripts.

export const CAMPUSES = [
  {
    id: 'campus_1',
    name: 'SMK Bhumi Phala Kampus 1',
    lat: -7.281462945129072,
    lng: 110.09827607588974,
    radiusMeters: 100
  },
  {
    id: 'campus_2',
    name: 'SMK Bhumi Phala Kampus 2',
    lat: -7.282467,
    lng: 110.096915,
    radiusMeters: 100
  }
];

if (typeof window !== 'undefined') window.MIPHA_CAMPUSES = CAMPUSES;

export default CAMPUSES;
