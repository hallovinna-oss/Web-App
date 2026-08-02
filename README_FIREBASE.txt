MIPHA COMPANION v1.0 RC4 — Production Edition

Project Plan:
- Mobile-first PWA for SMK Bhumi Phala Parakan.
- Firebase Auth + Firestore backend.
- Multi-campus geofencing support.
- Offline-friendly attendance capture with auto-sync.
- Clean school data model for schools, campuses, students, teachers, classes, attendance, permissions, announcements, settings, and logs.
- Improved teacher dashboard, attendance engine, reports, and permission workflow.
- Production-ready deployment with better caching and version control.

Key updates:
- Updated visible app labels to RC4.
- Updated offline cache version and service worker identifiers.
- Prepared for a cleaner Firestore data structure and later migration to RC4.

Deploy:
1. Upload the CONTENTS of this folder to your static hosting provider.
2. Refresh the site twice and clear cache if needed.
3. If the app still shows old RC3 content, clear browser site data and reload.

Firestore rules should be reviewed and tightened for RC4 deployment; the current rules in this folder are a starting point and require proper role-based validation.
