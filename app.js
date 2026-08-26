/* ==========================================================================
   MIPHA COMPANION v1.0 RC5 — Production Edition
   SMK Bhumi Phala Parakan — Class X DKV F
   Wali Kelas: Gevin Dimas Eka Kusuma, A.Md.
   ========================================================================== */

const MIPHA_APP_CONFIG = window.MIPHA_CONFIG || {};

const ACADEMIC_ATTENDANCE_START = MIPHA_APP_CONFIG.attendanceStart || '2026-07-13';

const SCHOOL_CONFIG = MIPHA_APP_CONFIG.school || {
  id: 'campus_1',
  name: 'SMK Bhumi Phala Kampus 1',
  lat: -7.281462945129072,
  lng: 110.09827607588974,
  radiusMeters: 100,
  onTimeLimitHour: 7,
  onTimeLimitMinute: 0,
  dismissalHour: 15,
  dismissalMinute: 45,
  backupPin: '7575'
};

const DEFAULT_OFFICIAL_STUDENTS_LIST = [
  { no: 1, nis: '6289', name: 'Ahmad Azka Al Walid' },
  { no: 2, nis: '6290', name: 'Ahmad Wardanu' },
  { no: 3, nis: '6291', name: 'Aiska Yunna Zharifa' },
  { no: 4, nis: '6292', name: 'Ananda Guruh Setyawan' },
  { no: 5, nis: '6293', name: 'Ardi Nugroho' },
  { no: 6, nis: '6294', name: 'Ardina Zilda Agustin' },
  { no: 7, nis: '6295', name: 'Cendhana Putra Asmoro' },
  { no: 8, nis: '6296', name: 'Chika Nayda Kynatha Gavarani' },
  { no: 9, nis: '6297', name: 'Danish Luqmanul Hakim' },
  { no: 10, nis: '6298', name: 'Diah Ayu Maharani' },
  { no: 11, nis: '6299', name: 'Divkha Berlian' },
  { no: 12, nis: '6300', name: 'Elfa Syafina' },
  { no: 13, nis: '6301', name: 'Fahmi Dirga Al Khafis' },
  { no: 14, nis: '6302', name: 'Galang Satria Arga' },
  { no: 15, nis: '6303', name: 'Gilang Ady Febriyan' },
  { no: 16, nis: '6304', name: 'Ibra Cahyo' },
  { no: 17, nis: '6305', name: 'Jessieca Olivia' },
  { no: 18, nis: '6306', name: 'Keisha Ghassani Zulvia' },
  { no: 19, nis: '6307', name: 'Kola Raya Takbir Wisanggeni' },
  { no: 20, nis: '6308', name: 'Lintang Cahya Murni' },
  { no: 21, nis: '6309', name: 'Malika Maulana' },
  { no: 22, nis: '6310', name: 'Muhamad Lutfi Al Faiz' },
  { no: 23, nis: '6311', name: 'Muhammad Exel Saputra' },
  { no: 24, nis: '6312', name: 'Mukti Yusuf Maulana' },
  { no: 25, nis: '6313', name: 'Naura Dwi Syifana Putri' },
  { no: 26, nis: '6314', name: 'Nur Ridwan' },
  { no: 27, nis: '6315', name: 'Nurinnajwaa Rachmatika' },
  { no: 28, nis: '6316', name: 'Ragil Akbar Alfaridzi' },
  { no: 29, nis: '6317', name: 'Reval Ananda Lestari' },
  { no: 30, nis: '6318', name: 'Rizki Eko Setiawan' },
  { no: 31, nis: '6319', name: 'Setyani Firla Alfiana' },
  { no: 32, nis: '6320', name: 'Tri Saputri Amalia' },
  { no: 33, nis: '6321', name: 'Wildan Bagus Faizal Akbar' },
  { no: 34, nis: '6322', name: 'Yasmin Najwa Maulidda' },
  { no: 35, nis: '6323', name: 'Zanuba Arifa Hafshoh' },
  { no: 36, nis: '6324', name: 'Zulfa Dwi Charita' }
];

const OFFICIAL_STUDENTS_LIST = Array.isArray(MIPHA_APP_CONFIG.officialStudentsList)
  ? MIPHA_APP_CONFIG.officialStudentsList
  : DEFAULT_OFFICIAL_STUDENTS_LIST;

const INITIAL_STUDENTS = Array.isArray(MIPHA_APP_CONFIG.initialStudents)
  ? MIPHA_APP_CONFIG.initialStudents
  : OFFICIAL_STUDENTS_LIST.map((student) => ({
      id: `std_${String(student.no).padStart(2, '0')}`,
      nis: student.nis,
      username: student.name.toLowerCase().replace(/\s+/g, ''),
      name: student.name,
      role: 'siswa',
      class: 'X DKV F',
      pin: student.nis,
      password: student.nis,
      parentPhone: `081234567${String(student.no).padStart(3, '0')}`,
      teacherNotes: 'Siswa aktif, selalu hadir tepat waktu.',
      grades: {
        'Dasar Animasi': { formatif: 88, sumatif: 90, sikap: 'A' },
        'DKV / Fotografi': { formatif: 85, sumatif: 87, sikap: 'A' },
        'Informatika & AI': { formatif: 92, sumatif: 95, sikap: 'A' },
        'Bahasa Inggris': { formatif: 84, sumatif: 86, sikap: 'B' },
        'Matematika': { formatif: 80, sumatif: 82, sikap: 'B' }
      }
    }));

// IndexedDB Helper
const IDBNAME = 'mipha-companion-db';
const IDBSTORE = 'handles';
function idbOpen() {
  return new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') return rej('No IDB');
    const req = indexedDB.open(IDBNAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDBSTORE);
    req.onsuccess = e => res(e.target.result);
    req.onerror = e => rej(e);
  });
}
async function idbSave(key, val) {
  try {
    const db = await idbOpen();
    const tx = db.transaction(IDBSTORE, 'readwrite');
    tx.objectStore(IDBSTORE).put(val, key);
  } catch(e) {}
}
async function idbGet(key) {
  try {
    const db = await idbOpen();
    return new Promise((res) => {
      const tx = db.transaction(IDBSTORE, 'readonly');
      const req = tx.objectStore(IDBSTORE).get(key);
      req.onsuccess = () => res(req.result);
      req.onerror = () => res(null);
    });
  } catch(e) { return null; }
}
async function idbDelete(key) {
  try {
    const db = await idbOpen();
    const tx = db.transaction(IDBSTORE, 'readwrite');
    tx.objectStore(IDBSTORE).delete(key);
  } catch(e) {}
}

// App State Controller
const AppState = {
  currentUser: null,
  loginRole: 'siswa',
  activeView: 'dashboard',
  selectedStudentModal: null,
  selectedAttendanceEditStudentId: null,
  attachmentLightbox: null,
  uploadsDir: null,
  uploadsDirName: null,
  selectedAnalyticsMonth: 'Juli 2026',
  students: [],
  attendance: {},
  leaveRequests: [],
  announcements: [],
  timetables: [],
  auditLogs: [],
  monthlyAttendance: {},
  historicalAttendance: {},
  teacherProfile: {},
  homeVisits: [],
  assignments: [],
  gradeReports: {},
  selectedGradeSubject: 'Dasar Animasi',
  selectedGradeSemester: '2026/2027 - Ganjil',
  visitEditorOpen: false,
  editingVisitId: null,
  activeAssignmentSubmissionId: null,
  attendanceDate: null,
  themePreference: 'light',
  backendListenersStarted: false,

  init() {
    try {
      this.loadState();
      try { this.isMobile = (typeof window !== 'undefined' && window.innerWidth <= 720); if (this.isMobile) document.documentElement.setAttribute('data-mobile','1'); } catch(e) {}
      this.applyTheme(this.themePreference);
      this.setupListeners();
      window.addEventListener('beforeunload', () => this.saveState());
      window.addEventListener('pagehide', () => this.saveState());
      this.restorePersistedSessionIfAvailable();
      this.render();
      this.initUploadsDir();
    } catch (e) {
      console.error("Critical init error:", e);
      const appEl = document.getElementById('app-container');
      if (appEl) {
        appEl.innerHTML = `
          <div style="padding: 2rem; max-width: 550px; margin: 3rem auto; background: #ffffff; border-radius: 16px; border: 2px solid #fca5a5; box-shadow: 0 10px 25px rgba(0,0,0,0.1); font-family: sans-serif; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚠️</div>
            <h2 style="color: #991b1b; margin-bottom: 0.5rem; font-size: 1.3rem;">Gagal Memuat Aplikasi</h2>
            <p style="color: #4b5563; font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.25rem;">Terjadi kendala saat membaca penyimpanan data local. Klik di bawah untuk memulihkan.</p>
            <button onclick="localStorage.clear(); location.reload();" style="background: #581c87; color: white; border: none; padding: 0.75rem 1.5rem; font-weight: 700; border-radius: 10px; cursor: pointer;">🔄 Reset Data & Muat Ulang</button>
          </div>
        `;
      }
    }
  },

  async initUploadsDir() {
    try {
      const handle = await idbGet('lampiran-dir');
      if (!handle) return;
      let perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        this.uploadsDir = handle;
        this.uploadsDirName = handle.name;
        this.render();
      }
    } catch(e) {}
  },

  async setupUploadsDir() {
    if (!window.showDirectoryPicker) {
      alert('⚠️ Fitur ini memerlukan Google Chrome atau Microsoft Edge versi terbaru.');
      return;
    }
    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const lampiranHandle = await rootHandle.getDirectoryHandle('lampiran', { create: true });
      await idbSave('lampiran-dir', lampiranHandle);
      this.uploadsDir = lampiranHandle;
      this.uploadsDirName = rootHandle.name + '/lampiran';
      this.logAudit(`Wali Kelas mengatur folder lampiran: ${this.uploadsDirName}`);
      alert(`✅ Folder lampiran berhasil diatur!\n\nFile lampiran siswa akan tersimpan di:\n📁 ${rootHandle.name}\\lampiran\\`);
      this.render();
    } catch(e) {
      if (e.name !== 'AbortError') alert('Gagal mengatur folder: ' + e.message);
    }
  },

  async clearUploadsDir() {
    await idbDelete('lampiran-dir');
    this.uploadsDir = null;
    this.uploadsDirName = null;
    this.render();
  },

  async saveFileToUploads(file) {
    if (!this.uploadsDir) return null;
    try {
      const ts = Date.now();
      const safeName = `${ts}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const fh = await this.uploadsDir.getFileHandle(safeName, { create: true });
      const writable = await fh.createWritable();
      await writable.write(file);
      await writable.close();
      return safeName;
    } catch(e) {
      console.error('Gagal simpan lampiran ke folder:', e);
      return null;
    }
  },

  async listLampiranFiles() {
    if (!this.uploadsDir) return [];
    const files = [];
    try {
      for await (const [name, handle] of this.uploadsDir.entries()) {
        if (handle.kind === 'file') files.push(name);
      }
    } catch(e) {}
    return files.sort().reverse();
  },

  async renderLampiranList() {
    const listEl = document.getElementById('lampiran-file-list');
    if (!listEl) return;
    listEl.innerHTML = 'Memuat daftar file...';
    const files = await this.listLampiranFiles();
    if (files.length === 0) {
      listEl.innerHTML = '<div style="color: var(--text-muted); font-style: italic; padding: 0.5rem 0;">Belum ada file lampiran tersimpan di folder ini.</div>';
      return;
    }
    listEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 200px; overflow-y: auto;">
        ${files.map(f => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg-main); border: 1px solid var(--border-light); border-radius: var(--radius-sm); font-size: 0.8rem;">
            <span style="font-weight: 600; color: var(--primary-dark); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75%;">📄 ${f}</span>
            <span style="font-size: 0.72rem; color: var(--status-success); font-weight: 700;">✅ Tersimpan</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  safeJSONParse(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      localStorage.removeItem(key);
      return fallback;
    }
  },

  getPersistedCurrentUser() {
    const user = this.safeJSONParse('dkvf_current_user', null);
    if (!user || typeof user !== 'object' || !user.role) return null;
    return user;
  },

  persistCurrentUser() {
    if (!this.currentUser) return;
    const safeUser = {
      id: this.currentUser.id,
      role: this.currentUser.role,
      name: this.currentUser.name,
      nis: this.currentUser.nis,
      username: this.currentUser.username,
      class: this.currentUser.class,
      parentPhone: this.currentUser.parentPhone,
      emergencyPhone: this.currentUser.emergencyPhone,
      phone: this.currentUser.phone,
      email: this.currentUser.email,
      address: this.currentUser.address,
      homeLat: this.currentUser.homeLat ?? null,
      homeLng: this.currentUser.homeLng ?? null
    };
    localStorage.setItem('dkvf_current_user', JSON.stringify(safeUser));
  },

  clearPersistedCurrentUser() {
    localStorage.removeItem('dkvf_current_user');
  },

  restorePersistedSessionIfAvailable() {
    const persisted = this.getPersistedCurrentUser();
    if (!persisted || !window.SupabaseBackend || !SupabaseBackend.auth) return;

    this.currentUser = persisted;

    SupabaseBackend.auth.onAuthStateChanged((user) => {
      if (user && !this.backendListenersStarted) {
        this.backendListenersStarted = true;
        SupabaseBackend.startListeners(this);
      } else if (!user && this.currentUser) {
        // Never keep a local-only "logged in" screen: cloud writes require a
        // verified Supabase user. The next login is persisted by Supabase Auth.
        this.currentUser = null;
        this.backendListenersStarted = false;
        this.clearPersistedCurrentUser();
        this.render();
      }
    });
  },

  loadState() {
    this.students = this.safeJSONParse('dkvf_students', INITIAL_STUDENTS).map((student) => ({
      ...student,
      parentName: student.parentName || '',
      address: student.address || '',
      homeLat: student.homeLat ?? null,
      homeLng: student.homeLng ?? null,
      emergencyPhone: student.emergencyPhone || '',
      portfolio: student.portfolio || [],
      achievements: student.achievements || [],
      password: student.password || student.pin || student.nis,
      pin: student.password || student.pin || student.nis
    }));
    if (!localStorage.getItem('dkvf_students')) {
      localStorage.setItem('dkvf_students', JSON.stringify(this.students));
    }
    const persistedCurrentUser = this.getPersistedCurrentUser();
    if (persistedCurrentUser && persistedCurrentUser.role === 'siswa') {
      const student = this.students.find(s => s.id === persistedCurrentUser.id || s.nis === persistedCurrentUser.nis);
      this.currentUser = student
        ? { ...student, ...persistedCurrentUser, role: 'siswa' }
        : persistedCurrentUser;
    } else if (persistedCurrentUser && persistedCurrentUser.role === 'guru') {
      this.currentUser = { ...this.teacherProfile, ...persistedCurrentUser, role: 'guru' };
    } else {
      this.currentUser = persistedCurrentUser;
    }
    this.attendanceDate = localStorage.getItem('mipha_attendance_date');
    const todayKey = new Date().toISOString().split('T')[0];
    const persistedAttendance = this.safeJSONParse('dkvf_attendance', null);
    const isAttendanceForToday = (attendance) => {
      if (!attendance || typeof attendance !== 'object') return false;
      const firstKey = Object.keys(attendance)[0];
      if (!firstKey) return false;
      return attendance[firstKey] && attendance[firstKey].date === todayKey;
    };

    if (this.attendanceDate === todayKey && persistedAttendance) {
      this.attendance = persistedAttendance;
    } else if (!this.attendanceDate && isAttendanceForToday(persistedAttendance)) {
      this.attendance = persistedAttendance;
      this.attendanceDate = todayKey;
      localStorage.setItem('mipha_attendance_date', todayKey);
    } else if (this.attendanceDate !== todayKey) {
      this.archiveAttendanceDay(this.attendanceDate);
      this.attendance = this.generateEmptyDailyAttendance();
      this.attendanceDate = todayKey;
      localStorage.setItem('mipha_attendance_date', todayKey);
      localStorage.setItem('dkvf_attendance', JSON.stringify(this.attendance));
    } else {
      this.attendance = this.safeJSONParse('dkvf_attendance', this.generateEmptyDailyAttendance());
    }
    Object.values(this.attendance || {}).forEach((record) => {
      if (record && ['terlambat', 'late', 'l'].includes(String(record.status || '').toLowerCase())) {
        record.status = 'tepat_waktu';
      }
    });
    this.leaveRequests = this.safeJSONParse('dkvf_leave_requests', this.generateSampleLeaves());
    this.monthlyAttendance = this.safeJSONParse('dkvf_monthly_attendance', this.generateMonthlyAttendanceSeed());
    this.historicalAttendance = this.safeJSONParse('dkvf_historical_attendance', {});
    if (!localStorage.getItem('dkvf_monthly_attendance')) {
      localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
    }
    if (!localStorage.getItem('dkvf_historical_attendance')) {
      localStorage.setItem('dkvf_historical_attendance', JSON.stringify(this.historicalAttendance));
    }
    this.repairMonthlyAttendanceFromHistory();
    this.announcements = this.safeJSONParse('dkvf_announcements', [
      { id: 'anc_1', title: 'Peralatan Gambar Sketsa Besok', content: 'Wajib membawa pensil 2B, 4B, dan drawing pen untuk mata pelajaran Sketsa Dasar.', date: '2026-07-24', author: 'Gevin Dimas Eka Kusuma, A.Md. (Wali Kelas)' },
      { id: 'anc_2', title: 'Praktek Studio Fotografi', content: 'Siswa kelompok A menggunakan Lab Kamera lantai 2.', date: '2026-07-23', author: 'Gevin Dimas Eka Kusuma, A.Md.' }
    ]);
    this.auditLogs = this.safeJSONParse('dkvf_audit_logs', [
      { id: 'log_1', action: 'Inisialisasi Sistem Prototipe', user: 'System', timestamp: '2026-07-24 07:00:00' }
    ]);

    this.teacherProfile = this.safeJSONParse('mipha_teacher_profile', {
      name: 'Gevin Dimas Eka Kusuma, A.Md.',
      title: 'Wali Kelas X DKV F',
      subject: 'Dasar Animasi',
      phone: '',
      email: '',
      bio: 'Teaching smarter. Caring better.',
      photo: null
    });
    this.homeVisits = this.safeJSONParse('mipha_home_visits', [
      { id:'hv_1', studentId:'std_07', status:'urgent', scheduledDate:'2026-08-01', address:'Alamat belum dilengkapi', mapsUrl:'', parentPhone:'081234567007', notes:'Perlu tindak lanjut karena riwayat ketidakhadiran.', followUp:true },
      { id:'hv_2', studentId:'std_12', status:'scheduled', scheduledDate:'2026-08-03', address:'Alamat belum dilengkapi', mapsUrl:'', parentPhone:'081234567012', notes:'Kunjungan pengenalan keluarga.', followUp:false },
      { id:'hv_3', studentId:'std_20', status:'completed', scheduledDate:'2026-07-25', address:'Alamat tersimpan', mapsUrl:'', parentPhone:'081234567020', notes:'Keluarga kooperatif. Tidak ada tindak lanjut mendesak.', followUp:false }
    ]);
    this.assignments = this.safeJSONParse('mipha_assignments', [
      { id:'as_1', title:'Poster Kampanye Sekolah', subject:'Dasar Animasi', dueDate:'2026-08-05', description:'Buat poster digital bertema disiplin sekolah.', submitted:28, total:36 },
      { id:'as_2', title:'Latihan Komposisi Foto', subject:'DKV / Fotografi', dueDate:'2026-08-08', description:'Kumpulkan tiga foto dengan rule of thirds.', submitted:19, total:36 }
    ]);
    this.gradeReports = this.safeJSONParse('mipha_grade_reports', {});

    this.teacherCodes = {
      '14': 'Prabowo Hadi Saputro, S.Kom.',
      '15': 'Nur Alizzatun Sugiarti, S.Pd.',
      '29': 'Ahmad Munir, S.Kom.',
      '31': 'Aziz Nur Isnaini, S.Pd.',
      '36': 'Awan Gumono, S.Pd.',
      '40': 'Felia Listyo Pamilih, S.Psi.',
      '54': 'Yuli Susanto, S.Pd.',
      '57': 'Gevin Dimas Eka Kusuma, A.Md.',
      '58': 'Ulinnuha Nur Alfissuroya, S.Pd.',
      '63': 'Muhamad Anang Adib Karim, S.Pd.',
      '66': 'Aniza Latifah Hanum, S.Sn.',
      '70': 'Defani Ardiyanto, S.Sn.',
      '72': 'Oktavia Putri Wijayanti, S.Pd.',
      '74': 'Islah Tri Kartiko, M.Pd.',
      '75': 'Ayu Riski Munfadriyah, S.Pd.'
    };

    this.timetables = [
      {
        day: 'Senin',
        uniform: 'OSIS LENGKAP',
        location: 'Kampus 2 (Ruang E5)',
        subjects: [
          { time: '07.15 - 07.55', name: 'Upacara / Perwalian', teacher: 'Gevin Dimas Eka Kusuma, A.Md. (Wali Kelas)', teacherCode: '57', room: 'K2 - E5' },
          { time: '07.55 - 11.05', name: 'Dasar Animasi', teacher: 'Gevin Dimas Eka Kusuma, A.Md.', teacherCode: '57', room: 'K2 - E5' },
          { time: '09.55 - 10.25', name: '☕ Istirahat 1', teacher: '-', teacherCode: '-', room: '-' },
          { time: '11.05 - 12.25', name: 'Bahasa Inggris', teacher: 'Yuli Susanto, S.Pd.', teacherCode: '54', room: 'K2 - E5' },
          { time: '12.25 - 13.45', name: 'Matematika', teacher: 'Nur Alizzatun Sugiarti, S.Pd.', teacherCode: '15', room: 'K2 - E5' },
          { time: '13.05 - 13.45', name: '☕ Istirahat 2', teacher: '-', teacherCode: '-', room: '-' },
          { time: '14.25 - 15.45', name: 'Bahasa Indonesia', teacher: 'Ulinnuha Nur Alfissuroya, S.Pd.', teacherCode: '58', room: 'K2 - E5' }
        ]
      },
      {
        day: 'Selasa',
        uniform: 'OSIS LENGKAP',
        location: 'Kampus 1 (Ruang B18, L5, B17)',
        subjects: [
          { time: '07.15 - 08.35', name: 'Sejarah Indonesia', teacher: 'Ayu Riski Munfadriyah, S.Pd.', teacherCode: '75', room: 'K1 - B18' },
          { time: '08.35 - 09.55', name: 'Seni Tari', teacher: 'Defani Ardiyanto, S.Sn.', teacherCode: '70', room: 'K1 - B18' },
          { time: '09.55 - 10.25', name: '☕ Istirahat 1', teacher: '-', teacherCode: '-', room: '-' },
          { time: '10.25 - 13.05', name: 'Informatika & AI', teacher: 'Prabowo Hadi Saputro, S.Kom.', teacherCode: '14', room: 'K1 - L5' },
          { time: '13.05 - 13.45', name: '☕ Istirahat 2', teacher: '-', teacherCode: '-', room: '-' },
          { time: '13.45 - 15.45', name: 'Pendidikan Agama Islam (PAI)', teacher: 'Muhamad Anang Adib Karim, S.Pd.', teacherCode: '63', room: 'K1 - B17' }
        ]
      },
      {
        day: 'Rabu',
        uniform: 'IDENTITAS',
        location: 'Kampus 2 (Ruang E6)',
        subjects: [
          { time: '07.15 - 07.55', name: 'Bimbingan Konseling (BK)', teacher: 'Felia Listyo Pamilih, S.Psi.', teacherCode: '40', room: 'K2 - E6' },
          { time: '07.55 - 11.45', name: 'DKV / Fotografi', teacher: 'Ahmad Munir, S.Kom.', teacherCode: '29', room: 'K2 - E6' },
          { time: '09.55 - 10.25', name: '☕ Istirahat 1', teacher: '-', teacherCode: '-', room: '-' },
          { time: '11.45 - 13.05', name: 'Pendidikan Pancasila', teacher: 'Aziz Nur Isnaini, S.Pd.', teacherCode: '31', room: 'K2 - E6' },
          { time: '13.05 - 13.45', name: '☕ Istirahat 2', teacher: '-', teacherCode: '-', room: '-' },
          { time: '13.45 - 15.45', name: 'Penjasorkes / Olahraga', teacher: 'Islah Tri Kartiko, M.Pd.', teacherCode: '74', room: 'K2 - Lapangan / E6' }
        ]
      },
      {
        day: 'Kamis',
        uniform: 'WP JURUSAN (Wearpack DKV)',
        location: 'Kampus 2 (Ruang E4)',
        subjects: [
          { time: '07.15 - 09.15', name: 'IPAS', teacher: 'Awan Gumono, S.Pd.', teacherCode: '36', room: 'K2 - E4' },
          { time: '09.15 - 11.05', name: 'Bahasa Indonesia', teacher: 'Ulinnuha Nur Alfissuroya, S.Pd.', teacherCode: '58', room: 'K2 - E4' },
          { time: '09.55 - 10.25', name: '☕ Istirahat 1', teacher: '-', teacherCode: '-', room: '-' },
          { time: '11.05 - 12.25', name: 'Matematika', teacher: 'Nur Alizzatun Sugiarti, S.Pd.', teacherCode: '15', room: 'K2 - E4' },
          { time: '12.25 - 14.25', name: 'Bahasa Inggris', teacher: 'Yuli Susanto, S.Pd.', teacherCode: '54', room: 'K2 - E4' },
          { time: '13.05 - 13.45', name: '☕ Istirahat 2', teacher: '-', teacherCode: '-', room: '-' },
          { time: '14.25 - 15.45', name: 'Bahasa Jawa', teacher: 'Oktavia Putri Wijayanti, S.Pd.', teacherCode: '72', room: 'K2 - E4' }
        ]
      },
      {
        day: 'Jumat',
        uniform: 'PRAMUKA LENGKAP',
        location: 'Kampus 1 (Ruang L3)',
        subjects: [
          { time: '07.15 - 11.00', name: 'DKV / Dasar Desain', teacher: 'Aniza Latifah Hanum, S.Sn.', teacherCode: '66', room: 'K1 - L3' },
          { time: '09.35 - 09.50', name: '☕ Istirahat Jumat', teacher: '-', teacherCode: '-', room: '-' }
        ]
      }
    ];
  },

  saveState() {
    localStorage.setItem('dkvf_students', JSON.stringify(this.students));
    localStorage.setItem('dkvf_attendance', JSON.stringify(this.attendance));
    localStorage.setItem('dkvf_leave_requests', JSON.stringify(this.leaveRequests));
    localStorage.setItem('dkvf_announcements', JSON.stringify(this.announcements));
    localStorage.setItem('dkvf_audit_logs', JSON.stringify(this.auditLogs));
    localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
    localStorage.setItem('dkvf_historical_attendance', JSON.stringify(this.historicalAttendance));
    localStorage.setItem('mipha_teacher_profile', JSON.stringify(this.teacherProfile));
    localStorage.setItem('mipha_home_visits', JSON.stringify(this.homeVisits));
    localStorage.setItem('mipha_assignments', JSON.stringify(this.assignments));
    localStorage.setItem('mipha_grade_reports', JSON.stringify(this.gradeReports));
    localStorage.setItem('mipha_attendance_date', this.attendanceDate || new Date().toISOString().split('T')[0]);
    if (this.currentUser) {
      this.persistCurrentUser();
    }
    if (window.SupabaseBackend) SupabaseBackend.scheduleSync(this);
  },

  async uploadCloudFile(file, category, ownerId, metadata = {}) {
    if (!file) return null;
    if (!window.SupabaseBackend || !SupabaseBackend.auth.currentUser) {
      throw new Error('Login Supabase diperlukan untuk menyimpan file di cloud.');
    }
    return SupabaseBackend.uploadFile(file, category, ownerId, metadata);
  },

  generateEmptyDailyAttendance() {
    const todayStr = new Date().toISOString().split('T')[0];
    const map = {};
    this.students.forEach((student) => {
      map[student.id] = {
        date: todayStr,
        studentId: student.id,
        studentNis: student.nis,
        studentName: student.name,
        status: 'belum_checkin',
        checkinTime: null,
        checkinMethod: null,
        distanceMeters: null,
        checkoutTime: null,
        homeConfirmed: false,
        homeArrivalTime: null
      };
    });
    return map;
  },

  archiveAttendanceDay(dateKey) {
    if (!dateKey) return;
    const previous = this.safeJSONParse('dkvf_attendance', null);
    if (!previous) return;
    const history = this.safeJSONParse('mipha_attendance_history', {});
    history[dateKey] = previous;
    localStorage.setItem('mipha_attendance_history', JSON.stringify(history));
    this.recordMonthlyAttendanceForDate(dateKey, previous);
  },

  monthlyStatusFromAttendance(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'tepat_waktu' || normalized === 'hadir') return 'tepat_waktu';
    if (normalized === 'terlambat' || normalized === 'late' || normalized === 'l') return 'tepat_waktu';
    if (normalized === 'sakit') return 'sakit';
    if (normalized === 'izin' || normalized === 'permission' || normalized === 'lom' || normalized.includes('lom')) return 'izin';
    if (normalized === 'alpha') return 'alpha';
    return 'no_record';
  },

  recordMonthlyAttendanceForDate(dateKey, attendanceMap) {
    if (!dateKey || !attendanceMap || typeof attendanceMap !== 'object') return;
    Object.entries(attendanceMap).forEach(([studentId, record]) => {
      const status = this.monthlyStatusFromAttendance(record && record.status);
      if (status === 'no_record') return;
      if (!this.monthlyAttendance[studentId]) this.monthlyAttendance[studentId] = {};
      this.monthlyAttendance[studentId][dateKey] = status;
      if (!this.historicalAttendance[studentId]) this.historicalAttendance[studentId] = {};
      this.historicalAttendance[studentId][dateKey] = status;
    });
    localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
    localStorage.setItem('dkvf_historical_attendance', JSON.stringify(this.historicalAttendance));
  },

  isSchoolDayDate(date) {
    const d = typeof date === 'string' ? this.parseLocalDate(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const academicStart = this.parseLocalDate(ACADEMIC_ATTENDANCE_START);
    return dow >= 1 && dow <= 5 && d >= academicStart;
  },

  isAttendanceDeadlinePassed(date) {
    const checkDate = typeof date === 'string' ? this.parseLocalDate(date) : new Date(date);
    const deadline = new Date(checkDate);
    deadline.setHours(SCHOOL_CONFIG.dismissalHour, SCHOOL_CONFIG.dismissalMinute, 0, 0);
    return new Date() > deadline;
  },

  parseLocalDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return new Date(dateString);
    const [year, month, day] = dateString.split('-').map(Number);
    if ([year, month, day].some((n) => Number.isNaN(n))) return new Date(dateString);
    return new Date(year, month - 1, day);
  },

  formatDateKey(date) {
    const d = typeof date === 'string' ? this.parseLocalDate(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getTodayKey() {
    return this.formatDateKey(new Date());
  },

  attendanceStatusForDate(studentId, date) {
    const d = typeof date === 'string' ? this.parseLocalDate(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    const dateKey = this.formatDateKey(d);
    const todayKey = this.getTodayKey();
    const historical = this.historicalAttendance || {};
    const monthly = this.monthlyAttendance || {};
    if (historical[studentId] && typeof historical[studentId][dateKey] !== 'undefined') {
      return this.monthlyStatusFromAttendance(historical[studentId][dateKey]);
    }
    if (monthly[studentId] && typeof monthly[studentId][dateKey] !== 'undefined') {
      return this.monthlyStatusFromAttendance(monthly[studentId][dateKey]);
    }
    if (!this.isSchoolDayDate(d)) {
      if (d < this.parseLocalDate(ACADEMIC_ATTENDANCE_START)) return 'before_start';
      if (d > this.parseLocalDate(todayKey)) return 'future';
      return 'weekend';
    }
    if (d > this.parseLocalDate(todayKey)) {
      return 'future';
    }
    return 'no_record';
  },

  calculateStudentAttendanceSummary(studentId, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let present = 0, sick = 0, izin = 0, alpha = 0, schoolDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const status = this.attendanceStatusForDate(studentId, date);
      if (!this.isSchoolDayDate(date)) continue;
      if (!['tepat_waktu', 'sakit', 'izin', 'alpha'].includes(status)) continue;
      schoolDays += 1;
      if (status === 'tepat_waktu') present += 1;
      else if (status === 'sakit') sick += 1;
      else if (status === 'izin') izin += 1;
      else if (status === 'alpha') alpha += 1;
    }
    const percentage = schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 100;
    return { present, sick, izin, alpha, schoolDays, percentage };
  },

  calculateAttendanceStreak(studentId, asOfDate = new Date()) {
    const today = new Date(asOfDate);
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let d = new Date(today); d >= new Date(ACADEMIC_ATTENDANCE_START + 'T00:00:00'); d.setDate(d.getDate() - 1)) {
      if (!this.isSchoolDayDate(d)) continue;
      const status = this.attendanceStatusForDate(studentId, d);
      if (status === 'tepat_waktu') {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  },

  getRecentAttendanceHistory(studentId, count = 7) {
    const history = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let dayOffset = 0; history.length < count && dayOffset < 30; dayOffset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      const status = this.attendanceStatusForDate(studentId, date);
      history.push({ date: date.toISOString().split('T')[0], status });
    }
    return history;
  },

  calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    try {
      if (window.AttendanceEngine && typeof AttendanceEngine.haversineDistance === 'function') {
        return AttendanceEngine.haversineDistance(lat1, lon1, lat2, lon2);
      }
    } catch (e) {}

    // Fallback: local haversine implementation
    const R = 6371000;
    const rad = (v) => v * Math.PI / 180;
    const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  },

  async performGPSCheckin() {
    if (!navigator.geolocation) return { success:false, message:'GPS Disabled: Geolocation not supported.' };
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition((position) => {
        try {
          const accuracy = position.coords && typeof position.coords.accuracy === 'number' ? position.coords.accuracy : Infinity;
          if (accuracy > 20) {
            return resolve({ success:false, message: `GPS Accuracy Too Low: ${Math.round(accuracy)}m. Tunggu hingga akurasi < 20m.` });
          }

          const campuses = Array.isArray(MIPHA_APP_CONFIG.campuses) ? MIPHA_APP_CONFIG.campuses : [];
          if (campuses.length !== 2) {
            return resolve({ success:false, message:'Konfigurasi lokasi sekolah tidak valid. Hubungi administrator.' });
          }

          if (window.AttendanceEngine && typeof AttendanceEngine.findContainingCampus === 'function') {
            const found = AttendanceEngine.findContainingCampus(position.coords.latitude, position.coords.longitude, campuses);
            if (found && found.campus) {
              return resolve(this.performCheckin('gps', found.distance, null, { ...found.campus, _gps: position.coords }));
            }

            // not inside any campus -> compute nearest campus to give helpful message
            if (typeof AttendanceEngine.findNearestCampus === 'function') {
              const nearest = AttendanceEngine.findNearestCampus(position.coords.latitude, position.coords.longitude, campuses);
              if (nearest && nearest.campus) {
                return resolve({ success:false, message: `Outside School Radius: Anda berada ${nearest.distance}m dari ${nearest.campus.name} (allowed ${nearest.campus.radiusMeters}m).`, nearest: { distance: nearest.distance, campus: nearest.campus } });
              }
            }
          }

          resolve({ success:false, message:'Mesin validasi GPS tidak tersedia. Muat ulang aplikasi dan coba lagi.' });
        } catch (e) {
          console.warn('GPS check-in error:', e);
          resolve({ success:false, message: 'GPS check-in failed: ' + (e && e.message ? e.message : 'unknown') });
        }
      }, (error) => {
        const msg = (error && error.code === 1) ? 'GPS Permission Denied' : 'Location permission failed: ' + (error && error.message ? error.message : 'unknown');
        resolve({ success:false, message: msg });
      }, { enableHighAccuracy:true, timeout:10000 });
    });
  },

  generateTodayDefaultAttendance() {
    const todayStr = new Date().toISOString().split('T')[0];
    const attendanceMap = {};
    INITIAL_STUDENTS.forEach((student, index) => {
      let status = 'belum_checkin';
      let checkinTime = null;
      let isHomeConfirmed = false;
      // Seed some realistic defaults
      if (index < 25) {
        checkinTime = '06:45 WIB'; isHomeConfirmed = true;
      } else if (index < 29) {
        checkinTime = '07:06 WIB'; isHomeConfirmed = true;
      } else if (index === 29 || index === 30) {
        status = 'sakit';
      } else if (index === 31) {
        status = 'izin';
      }

      // Determine status using AttendanceEngine when possible (keeps logic centralized)
      try {
        if (!status || status === 'belum_checkin') {
          if (checkinTime && window.AttendanceEngine && typeof AttendanceEngine.determineStatus === 'function') {
            const isoTime = `${todayStr}T${checkinTime.split(' ')[0]}:00`;
            const res = AttendanceEngine.determineStatus({ checkinTime: isoTime, now: new Date(`${todayStr}T${checkinTime.split(' ')[0]}:00`), config: SCHOOL_CONFIG });
            if (res && res.code) status = res.code;
          } else if (checkinTime) {
            status = (checkinTime.indexOf('06:') === 0 || checkinTime.indexOf('07:0') === 0)
              ? 'tepat_waktu'
              : 'tepat_waktu';
          }
        }
      } catch (e) {}

      attendanceMap[student.id] = {
        date: todayStr,
        studentId: student.id,
        studentNis: student.nis,
        studentName: student.name,
        status: status,
        checkinTime: checkinTime,
        checkinMethod: (status !== 'belum_checkin' && status !== 'sakit' && status !== 'izin') ? 'gps' : null,
        distanceMeters: status === 'tepat_waktu' ? 35 : null,
        checkoutTime: isHomeConfirmed ? '15:48 WIB' : null,
        homeConfirmed: isHomeConfirmed,
        homeArrivalTime: isHomeConfirmed ? '16:15 WIB' : null
      };
    });
    return attendanceMap;
  },

  async performCheckin(method, customDistance = null, pinInput = null, campus = null) {
    if (!this.currentUser || this.currentUser.role !== 'siswa') return;
    const studentId = this.currentUser.id;
    const now = new Date();

    const existing = this.attendance[studentId];
    if (existing?.checkinTime && existing?.status && existing.status !== 'belum_checkin') {
      return { success: false, message: 'Anda sudah melakukan check-in hari ini. Presensi tidak dikirim ulang ke Moncer.' };
    }

    if ((method === 'pin' || method === 'nis') && String(pinInput || '').trim() !== String(this.currentUser.nis || '').trim()) {
      this.logAudit(`Verifikasi NIS ditolak untuk akun ${this.currentUser.name}: NIS tidak sesuai`);
      return { success: false, message: 'NIS tidak sesuai dengan akun siswa yang sedang login.' };
    }

    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const isoCheckin = `${now.toISOString().slice(0, 10)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    let status = 'tepat_waktu';

    if (window.AttendanceEngine && typeof AttendanceEngine.determineStatus === 'function') {
      const result = AttendanceEngine.determineStatus({ checkinTime: isoCheckin, now, config: SCHOOL_CONFIG });
      status = result && result.code ? result.code : 'tepat_waktu';
    } else {
      status = 'tepat_waktu';
    }

    const distance = customDistance !== null ? customDistance : Math.floor(Math.random() * 45) + 15;
    const latitude = campus && campus._gps && typeof campus._gps.latitude === 'number' ? campus._gps.latitude : (campus && campus.lat) || null;
    const longitude = campus && campus._gps && typeof campus._gps.longitude === 'number' ? campus._gps.longitude : (campus && campus.lng) || null;
    const gpsAccuracy = campus && campus._gps && typeof campus._gps.accuracy === 'number' ? campus._gps.accuracy : null;
    const gpsTimestamp = campus && campus._gps && campus._gps.timestamp ? new Date(campus._gps.timestamp).toISOString() : new Date().toISOString();

    const attendanceRecord = {
      ...existing,
      status,
      checkinTime: timeString,
      checkinMethod: method,
      distanceMeters: distance,
      campusId: campus && campus.id ? campus.id : (this.attendance[studentId] && this.attendance[studentId].campusId) || null,
      campusName: campus && campus.name ? campus.name : (this.attendance[studentId] && this.attendance[studentId].campusName) || null,
      latitude,
      longitude,
      gpsAccuracy,
      gpsTimestamp
    };

    if (method === 'gps' || method === 'nis' || method === 'pin') {
      attendanceRecord.moncerSync = 'pending';
      attendanceRecord.moncerMessage = 'Menunggu sinkronisasi Moncer.';
    }

    this.attendance[studentId] = attendanceRecord;
    this.logAudit(`Check-in Sekolah oleh ${this.currentUser.name} (${status.toUpperCase()}, ${distance}m)${campus && campus.name ? ' @ ' + campus.name : ''}`);
    this.saveState();
    const todayDate = this.attendanceDate || new Date().toISOString().split('T')[0];
    if (window.SupabaseBackend && SupabaseBackend.auth.currentUser) {
      try {
        await SupabaseBackend.writeAttendanceRecord(studentId, todayDate, status, this.attendance[studentId]);
        attendanceRecord.cloudSync = 'success';
      } catch (error) {
        attendanceRecord.cloudSync = 'failed';
        attendanceRecord.cloudSyncMessage = error.message || 'Sinkronisasi database gagal.';
        console.warn('Cloud sync failed:', error);
      }
    } else {
      attendanceRecord.cloudSync = 'pending';
      attendanceRecord.cloudSyncMessage = 'Menunggu login Supabase.';
    }

    if ((method === 'gps' || method === 'nis' || method === 'pin') && window.SupabaseBackend && SupabaseBackend.auth.currentUser) {
      try {
        const moncerResult = await SupabaseBackend.syncMoncerAttendance(this.currentUser.nis, attendanceRecord);
        attendanceRecord.moncerSync = 'success';
        attendanceRecord.moncerSyncedAt = new Date().toISOString();
        attendanceRecord.moncerStatus = moncerResult.data?.status || null;
        attendanceRecord.moncerMessage = moncerResult.message || null;
      } catch (error) {
        attendanceRecord.moncerSync = 'failed';
        attendanceRecord.moncerMessage = error.message || 'Sinkronisasi Moncer gagal.';
      }

      this.attendance[studentId] = attendanceRecord;
      this.saveState();
      SupabaseBackend.writeAttendanceRecord(studentId, todayDate, status, attendanceRecord)
        .catch(error => console.warn('Cloud sync status update failed:', error));
    }
    return {
      success: true,
      status,
      distance,
      time: timeString,
      campusId: this.attendance[studentId].campusId || null,
      campusName: this.attendance[studentId].campusName || null,
      latitude: this.attendance[studentId].latitude || null,
      longitude: this.attendance[studentId].longitude || null,
      gpsAccuracy: this.attendance[studentId].gpsAccuracy || null,
      gpsTimestamp: this.attendance[studentId].gpsTimestamp || null,
      moncerSync: attendanceRecord.moncerSync || null,
      moncerMessage: attendanceRecord.moncerMessage || null
    };
  },

  generateMonthlyAttendanceSeed() {
    // Date-based attendance seed used by the monthly analytics view.
    // Structure: { studentId: { 'YYYY-MM-DD': 'hadir|sakit|izin|alpha|no_record' } }
    // Keep this function available even when no historical dataset is bundled,
    // so first-time startup never fails.
    const seed = {};
    INITIAL_STUDENTS.forEach((student) => {
      seed[student.id] = {};
    });
    return seed;
  },

  repairMonthlyAttendanceFromHistory() {
    const history = this.safeJSONParse('mipha_attendance_history', {});
    if (!history || typeof history !== 'object') return;
    let changed = false;
    Object.entries(history).forEach(([dateKey, attendanceMap]) => {
      if (!attendanceMap || typeof attendanceMap !== 'object') return;
      Object.entries(attendanceMap).forEach(([studentId, record]) => {
        const status = this.monthlyStatusFromAttendance(record.status);
        if (!this.monthlyAttendance[studentId]) this.monthlyAttendance[studentId] = {};
        if (this.monthlyAttendance[studentId][dateKey] !== status) {
          this.monthlyAttendance[studentId][dateKey] = status;
          changed = true;
        }
      });
    });
    if (changed) {
      localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
    }
  },

  generateSampleLeaves() {
    return [
      {
        id: 'lv_101',
        studentId: 'std_30',
        studentName: 'Rizki Eko Setiawan',
        type: 'sakit',
        startDate: '2026-07-24',
        endDate: '2026-07-24',
        reason: 'Demam dan flu, beristirahat sesuai anjuran dokter.',
        attachment: 'surat_dokter_rizki.jpg',
        attachmentData: null,
        parentPhone: '081234567030',
        status: 'approved',
        teacherNote: 'Disetujui. Cepat sembuh.',
        submittedAt: '2026-07-24 06:30'
      }
    ];
  },

  logAudit(action) {
    if (!this.currentUser) return;
    const now = new Date().toLocaleString('id-ID');
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: action,
      user: `${this.currentUser.name} (${this.currentUser.role.toUpperCase()})`,
      timestamp: now
    });
    this.saveState();
  },

  setupListeners() {
    document.addEventListener('click', (e) => {
      let target = e.target;
      if (target.nodeType !== Node.ELEMENT_NODE) target = target.parentElement;
      if (!target) return;

      const navBtn = target.closest('[data-view]');
      if (navBtn) {
        e.preventDefault();
        const view = navBtn.getAttribute('data-view');
        this.switchView(view);
        return;
      }

      const cell = target.closest('td.editable-attendance-cell');
      if (cell) {
        e.preventDefault();
        const studentId = cell.dataset.studentId;
        const date = cell.dataset.date;
        if (!studentId || !date) return;
        this.toggleMonthlyAttendanceStatus(studentId, date);
        this.render();
      }
    });
  },

  switchView(viewName) {
    this.activeView = viewName;
    this.render();
  },

  async login(username, password, role) {
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');
    try {
      if (!window.SupabaseBackend) throw new Error('Supabase gagal dimuat. Periksa koneksi internet.');
      const profile = await SupabaseBackend.login(cleanUsername, cleanPassword, role, this.students);
      if (role === 'guru') {
        this.currentUser = { ...profile, role: 'guru' };
        await SupabaseBackend.seedStudents(this.students);
      } else {
        const localStudent = this.students.find(s => String(s.nis) === cleanUsername);
        this.currentUser = { ...(localStudent || {}), ...profile, role: 'siswa' };
      }
      this.persistCurrentUser();
      this.activeView = 'dashboard';
      this.backendListenersStarted = true;
      SupabaseBackend.startListeners(this);
      this.logAudit(`${this.currentUser.name} berhasil masuk melalui Supabase`);
      this.render();
      if (window.MiphaAndroidNotifications) window.MiphaAndroidNotifications.sync(this);
      return { success: true };
    } catch (error) {
      console.error('Supabase login error:', error);
      const messages = {
        'auth/invalid-credential': 'NIS/username atau password salah.',
        'auth/wrong-password': 'NIS/username atau password salah.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
        'auth/network-request-failed': 'Tidak dapat terhubung ke Supabase. Periksa internet.'
      };
      return { success: false, message: messages[error.code] || error.message || 'Login gagal.' };
    }
  },

  async logout() {
    if (this.currentUser) this.logAudit(`Pengguna ${this.currentUser.name} keluar`);
    try { if (window.SupabaseBackend) await SupabaseBackend.logout(); } catch (e) { console.warn(e); }
    this.currentUser = null;
    this.backendListenersStarted = false;
    this.clearPersistedCurrentUser();
    sessionStorage.clear();
    this.render();
    if (window.MiphaAndroidNotifications) window.MiphaAndroidNotifications.sync(this);
  },

  performCheckout() {
    if (!this.currentUser || this.currentUser.role !== 'siswa') return;
    const studentId = this.currentUser.id;
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    this.attendance[studentId] = { ...this.attendance[studentId], checkoutTime: timeString };
    this.logAudit(`Check-out Pulang Sekolah oleh ${this.currentUser.name}`);
    this.saveState();
    return { success: true, time: timeString };
  },

  updateAttendanceRecord(studentId, updates) {
    if (!studentId || !this.students.find((s) => s.id === studentId)) return;
    const todayDate = this.attendanceDate || new Date().toISOString().split('T')[0];
    const existing = this.attendance[studentId] || {};
    this.attendance[studentId] = {
      ...existing,
      ...updates
    };
    this.recordMonthlyAttendanceForDate(todayDate, this.attendance);
    this.logAudit(`Manual edit attendance for ${this.students.find((s) => s.id === studentId).name}`);
    this.saveState();
    if (window.SupabaseBackend && SupabaseBackend.auth.currentUser) {
      SupabaseBackend.writeAttendanceRecord(studentId, todayDate, this.attendance[studentId].status, this.attendance[studentId]).catch(error => console.warn('Cloud sync failed:', error));
    }
  },

  toggleMonthlyAttendanceStatus(studentId, date) {
    if (!this.currentUser || this.currentUser.role !== 'guru') return;
    if (!this.students.find((s) => s.id === studentId)) return;
    const currentStatus = this.attendanceStatusForDate(studentId, date);
    const cycle = ['no_record', 'alpha', 'tepat_waktu', 'sakit', 'izin'];
    const currentIndex = cycle.indexOf(currentStatus);
    const normalizedIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextStatus = cycle[(normalizedIndex + 1) % cycle.length];
    this.setAttendanceStatusForDate(studentId, date, nextStatus);
    this.saveState();
    if (window.SupabaseBackend && SupabaseBackend.auth.currentUser) {
      SupabaseBackend.writeAttendanceRecord(studentId, this.formatDateKey(date), nextStatus, this.students.find((s) => s.id === studentId)).catch(error => console.warn('Cloud sync failed:', error));
    }
  },

  setAttendanceStatusForDate(studentId, date, status) {
    const dateKey = this.formatDateKey(date);
    if (!this.historicalAttendance[studentId]) this.historicalAttendance[studentId] = {};
    this.historicalAttendance[studentId][dateKey] = status;
    if (!this.monthlyAttendance[studentId]) this.monthlyAttendance[studentId] = {};
    this.monthlyAttendance[studentId][dateKey] = status;
    localStorage.setItem('dkvf_historical_attendance', JSON.stringify(this.historicalAttendance));
    localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
  },

  confirmHomeArrival() {
    if (!this.currentUser || this.currentUser.role !== 'siswa') return;
    const studentId = this.currentUser.id;
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    this.attendance[studentId] = { ...this.attendance[studentId], homeConfirmed: true, homeArrivalTime: timeString };
    this.logAudit(`Konfirmasi Sampai Rumah oleh ${this.currentUser.name}`);
    this.saveState();
    return { success: true, time: timeString };
  },

  submitLeaveRequest(data) {
    const newLeave = {
      id: data.id || `lv_${Date.now()}`,
      studentId: this.currentUser.id,
      studentName: this.currentUser.name,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      attachment: data.attachmentName || null,
      attachmentData: data.attachmentData || null,
      attachmentPath: data.attachmentPath || null,
      attachmentType: data.attachmentType || null,
      attachmentSize: data.attachmentSize || null,
      archivePath: data.archivePath || null,
      attachmentSaved: data.attachmentSaved || null,
      parentPhone: data.parentPhone,
      status: 'pending',
      teacherNote: null,
      submittedAt: data.submittedAt || new Date().toLocaleString('id-ID')
    };

    this.leaveRequests.unshift(newLeave);
    this.logAudit(`Pengajuan Izin (${data.type}) oleh ${this.currentUser.name}`);
    this.saveState();
    return { success: true };
  },

  updateLeaveStatus(leaveId, newStatus, note) {
    const leave = this.leaveRequests.find(l => l.id === leaveId);
    if (leave) {
      leave.status = newStatus;
      leave.teacherNote = note;
      if (newStatus === 'approved') {
        const studentId = leave.studentId;
        this.attendance[studentId] = {
          ...this.attendance[studentId],
          status: leave.type === 'sakit' ? 'sakit' : 'izin',
          checkinTime: `Disetujui (${leave.type.toUpperCase()})`
        };
      }
      this.logAudit(`Status Izin #${leaveId} diperbarui menjadi ${newStatus.toUpperCase()} oleh Wali Kelas`);
      this.saveState();
      this.render();
    }
  },

  saveTeacherStudentNotes(studentId, notes) {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      student.teacherNotes = notes;
      this.logAudit(`Wali Kelas memperbarui catatan profil siswa ${student.name}`);
      this.saveState();
      alert(`✅ Catatan & Penilaian Wali Kelas untuk ${student.name} berhasil disimpan!`);
      this.render();
    }
  },

  getGradeSubjects() {
    const ignored = /istirahat|upacara|perwalian/i;
    const subjects = [];
    (this.timetables || []).forEach(day => (day.subjects || []).forEach(item => {
      const name = String(item.name || '').trim();
      if (name && !ignored.test(name) && !subjects.includes(name)) subjects.push(name);
    }));
    return subjects.length ? subjects : ['Dasar Animasi', 'DKV / Fotografi', 'Informatika & AI'];
  },

  gradeReportKey(studentId, subject, semester = this.selectedGradeSemester) {
    const slug = String(subject || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const term = String(semester || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${studentId}_${term}_${slug}`;
  },

  getStudentGradeReports(studentId) {
    return Object.values(this.gradeReports || {}).filter(item => item.studentId === studentId && item.semester === this.selectedGradeSemester).sort((a, b) => String(a.subject).localeCompare(String(b.subject), 'id'));
  },

  getGradeEntries(report = {}) {
    if (Array.isArray(report.entries)) return report.entries;
    const legacy = [
      ['formatif', 'Nilai Formatif', report.formatif, 30],
      ['sumatif', 'Nilai Sumatif', report.sumatif, 30],
      ['praktik', 'Praktik / Proyek', report.praktik, 40]
    ];
    return legacy.filter(([, , score]) => Number.isFinite(Number(score))).map(([type, title, score, weight], index) => ({ id: `legacy-${index}`, type, title, score: Number(score), weight, date: '' }));
  },

  calculateGradeBook(entries = []) {
    const valid = entries.filter(item => Number.isFinite(Number(item.score)) && Number(item.weight) > 0);
    if (!valid.length) return null;
    const totalWeight = valid.reduce((sum, item) => sum + Number(item.weight), 0);
    return Math.round(valid.reduce((sum, item) => sum + (Number(item.score) * Number(item.weight)), 0) / totalWeight);
  },

  calculateFinalGrade(formatif, sumatif, praktik) {
    return this.calculateGradeBook([
      { score: formatif, weight: 30 }, { score: sumatif, weight: 30 }, { score: praktik, weight: 40 }
    ]);
  },

  async saveStudentGrade(studentId, subject, entries, sikap, capaian) {
    const student = this.students.find(s => s.id === studentId);
    if (!student || this.currentUser?.role !== 'guru') return;
    const cleanEntries = (entries || []).map((item, index) => ({
      id: item.id || `nilai-${Date.now()}-${index}`,
      type: String(item.type || 'tugas'), title: String(item.title || '').trim(), date: String(item.date || ''),
      score: Number(item.score), weight: Number(item.weight)
    })).filter(item => item.title || Number.isFinite(item.score));
    if (!cleanEntries.length) return alert('Tambahkan minimal satu komponen nilai.');
    if (cleanEntries.some(item => !item.title || !Number.isFinite(item.score) || item.score < 0 || item.score > 100 || !Number.isFinite(item.weight) || item.weight <= 0 || item.weight > 100)) return alert('Setiap komponen harus memiliki nama, nilai 0–100, dan bobot 1–100.');
    const id = this.gradeReportKey(studentId, subject);
    const report = { id, studentId, studentNis: student.nis, studentName: student.name, className: student.class || 'X DKV F', subject, semester: this.selectedGradeSemester, entries: cleanEntries, sikap: sikap || 'B', capaian: String(capaian || '').trim(), finalGrade: this.calculateGradeBook(cleanEntries) };
    try {
      if (!window.SupabaseBackend || !SupabaseBackend.auth.currentUser) throw new Error('Login Supabase diperlukan.');
      await SupabaseBackend.writeGradeReport(report);
      this.gradeReports[id] = report;
      this.logAudit(`Nilai ${subject} untuk ${student.name} diperbarui`);
      this.saveState();
      alert(`✅ Nilai ${subject} untuk ${student.name} tersimpan ke cloud.`);
      this.render({ silent: true, preserveUi: true });
    } catch (error) { console.error(error); alert('Gagal menyimpan nilai: ' + error.message); }
  },

  async openAttachment(leaveId) {
    const leave = this.leaveRequests.find(l => l.id === leaveId);
    if (!leave || !leave.attachmentData) return;
    if (leave.attachmentPath) {
      try {
        await SupabaseBackend.downloadFile(leave.attachmentPath, leave.attachmentName || leave.attachment);
      } catch (error) {
        alert('Gagal membuka lampiran: ' + error.message);
      }
    } else if (leave.attachmentData.startsWith('data:image')) {
      this.attachmentLightbox = { data: leave.attachmentData, name: leave.attachment };
      this.render();
    } else {
      const link = document.createElement('a');
      link.href = leave.attachmentData;
      link.download = leave.attachment;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  closeAttachmentLightbox() {
    this.attachmentLightbox = null;
    this.render();
  },

  renderAttachmentLightbox() {
    const lb = this.attachmentLightbox;
    return `
      <div class="modal-overlay" id="attachment-lightbox-overlay"
        style="z-index: 2000; background: rgba(46,16,101,0.85); backdrop-filter: blur(8px);"
        onclick="if(event.target.id==='attachment-lightbox-overlay') AppState.closeAttachmentLightbox()">
        <div style="background: #fff; border-radius: var(--radius-lg); padding: 1.5rem; max-width: min(92vw, 700px); width: 100%; max-height: 92vh; overflow-y: auto; box-shadow: 0 30px 60px rgba(59,7,100,0.5); border: 2px solid var(--border-light);">

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--border-light);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">📎</span>
              <div>
                <div style="font-weight: 800; font-size: 1rem; color: var(--primary-dark);">${lb.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Lampiran Pengajuan Izin Siswa</div>
              </div>
            </div>
            <button onclick="AppState.closeAttachmentLightbox()"
              style="background: var(--status-danger-bg); border: 1.5px solid rgba(239,68,68,0.3); color: var(--status-danger); font-size: 1.25rem; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-weight: 800;">&times;</button>
          </div>

          <div style="text-align: center; background: var(--primary-soft); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <img src="${lb.data}" alt="${lb.name}"
              style="max-width: 100%; max-height: 65vh; object-fit: contain; border-radius: var(--radius-sm); display: block; margin: 0 auto; box-shadow: var(--shadow-md);">
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <a href="${lb.data}" download="${lb.name}" class="btn btn-primary" style="flex: 1; justify-content: center;">
              📥 Unduh Lampiran
            </a>
            <button onclick="AppState.closeAttachmentLightbox()" class="btn btn-secondary" style="flex: 1;">
              ✖ Tutup
            </button>
          </div>
        </div>
      </div>
    `;
  },

  applyTheme() {
    this.themePreference = 'light';
    localStorage.setItem('mipha_theme', 'light');
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.themePreference = 'light';
  },

  cycleTheme() {
    this.applyTheme();
  },

  renderThemeControl() {
    return '';
  },

  render(options = {}) {
    const appEl = document.getElementById('app-container');
    if (!appEl) return;
    const preserveUi = options.preserveUi === true;
    const previousScrollY = preserveUi ? window.scrollY : 0;
    const activeElement = preserveUi ? document.activeElement : null;
    const activeElementId = activeElement && activeElement.id ? activeElement.id : null;
    const selectionStart = activeElement && typeof activeElement.selectionStart === 'number' ? activeElement.selectionStart : null;
    const selectionEnd = activeElement && typeof activeElement.selectionEnd === 'number' ? activeElement.selectionEnd : null;
    if (!this.currentUser) {
      appEl.innerHTML = this.renderLoginView();
      this.setupLoginEvents();
      return;
    }

    appEl.innerHTML = `
      ${this.renderHeader()}
      <main class="main-content${options.silent ? '' : ' fade-in'}">
        ${this.renderActiveView()}
      </main>
      ${this.renderBottomNav()}
      ${this.selectedStudentModal ? this.renderStudentProfileModal(this.selectedStudentModal) : ''}
      ${this.selectedAttendanceEditStudentId ? this.renderAttendanceEditModal(this.selectedAttendanceEditStudentId) : ''}
      ${this.attachmentLightbox ? this.renderAttachmentLightbox() : ''}
      ${localStorage.getItem('mipha_debug') === '1' ? this.renderDebugPanel() : ''}
    `;
    this.setupViewEvents();
    if (preserveUi) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: previousScrollY, left: 0, behavior: 'auto' });
        if (!activeElementId) return;
        const restored = document.getElementById(activeElementId);
        if (!restored) return;
        restored.focus({ preventScroll: true });
        if (selectionStart !== null && typeof restored.setSelectionRange === 'function') {
          restored.setSelectionRange(selectionStart, selectionEnd);
        }
      });
    }
  },

  renderDebugPanel() {
    try {
      const enginePresent = !!(window.AttendanceEngine && typeof AttendanceEngine.determineStatus === 'function');
      const sample = enginePresent ? AttendanceEngine.determineStatus({ checkinTime: new Date().toISOString(), now: new Date(), config: SCHOOL_CONFIG }) : null;
      const campuses = Array.isArray(MIPHA_APP_CONFIG.campuses) ? MIPHA_APP_CONFIG.campuses : [SCHOOL_CONFIG];
      return `
        <div id="dev-debug-panel" style="position:fixed;right:12px;bottom:80px;z-index:9999;max-width:340px;background:rgba(0,0,0,0.78);color:#fff;padding:10px;border-radius:8px;font-size:12px;box-shadow:0 6px 18px rgba(0,0,0,0.3);">
          <div style="font-weight:800;margin-bottom:6px;">MIPHA Dev Panel</div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px;">AttendanceEngine: <b style="color:#a7f3d0">${enginePresent ? 'loaded' : 'missing'}</b></div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px;">Sample status: <b>${sample ? JSON.stringify(sample) : '-'}</b></div>
          <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px;">Campuses: <b>${campuses.length}</b></div>
          <div style="max-height:120px;overflow:auto;font-size:11px;color:#e2e8f0;">${campuses.map(c=>`<div style=\"margin-bottom:6px;\"><b>${c.name || c.id}</b><div style=\"font-size:11px;color:#cbd5e1;\">${c.lat}, ${c.lng} • ${c.radiusMeters}m</div></div>`).join('')}</div>
          <div style="margin-top:8px;font-size:11px;color:#fef3c7;">Enable with: <code>localStorage.setItem('mipha_debug','1');location.reload();</code></div>
        </div>
      `;
    } catch (e) { return ''; }
  },


  renderHeader() {
    return `
      <header class="app-header">
        <div class="header-brand">
          <div class="brand-icon">
            <img class="brand-logo" src="./logo.png" alt="SMK Bhumi Phala">
          </div>
          <div>
            <div class="brand-title">MIPHA KU</div>
            <div class="brand-subtitle">Portal Kelas X DKV F</div>
          </div>
        </div>
        <div class="header-user-info">
          <div class="user-badge">
            ${this.currentUser.role === 'guru' ? '👑 Wali Kelas' : '🎓 Siswa'}
          </div>
          ${this.renderThemeControl(true)}
          <button class="btn-logout" id="btn-logout">Keluar</button>
        </div>
      </header>
    `;
  },

  renderBottomNav() {
    const role = this.currentUser.role;
    let items = role === 'siswa' ? [
      { view: 'dashboard', icon: '🏠', label: 'Beranda' },
      { view: 'checkin', icon: '📍', label: 'Check-in' },
      { view: 'leave', icon: '📝', label: 'Izin' },
      { view: 'timetable', icon: '📅', label: 'Jadwal' },
      { view: 'my_grades', icon: '📊', label: 'Nilai Saya' },
      { view: 'student_profile', icon: '👤', label: 'Profil' }
    ] : [
      { view: 'dashboard', icon: '🏠', label: 'Beranda' },
      { view: 'grades', icon: '📊', label: 'Nilai' },
      { view: 'home_visits', icon: '🏡', label: 'Home Visit' },
      { view: 'assignments', icon: '📚', label: 'Tugas' },
      { view: 'students', icon: '👥', label: 'Siswa' },
      { view: 'ai_assistant', icon: '🤖', label: 'AI' },
      { view: 'teacher_profile', icon: '👤', label: 'Profile' }
    ];

    return `
      <nav class="bottom-nav">
        ${items.map(item => `
          <button class="nav-item ${this.activeView === item.view ? 'active' : ''}" data-view="${item.view}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </button>
        `).join('')}
      </nav>
    `;
  },

  renderLoginView() {
    return `
      <div class="login-container">
        <div class="login-card fade-in">
          <div class="login-header">
            <div class="login-logo">
              <img src="./logo.png" alt="SMK Bhumi Phala">
            </div>
            <h2 style="color: var(--primary-dark); font-weight: 800; font-size: 1.3rem;">MIPHA KU</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; font-weight: 600;">Portal Digital X DKV F · SMK Bhumi Phala</p>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem;">
            <button type="button" class="btn btn-block ${this.loginRole !== 'guru' ? 'btn-primary' : 'btn-secondary'}" id="tab-login-siswa">🎓 Login Siswa</button>
            <button type="button" class="btn btn-block ${this.loginRole === 'guru' ? 'btn-primary' : 'btn-secondary'}" id="tab-login-guru">👑 Login Wali Kelas</button>
          </div>

          <form id="form-login" autocomplete="off">
            <div class="form-group">
              <label class="form-label">${this.loginRole === 'guru' ? 'Username Wali Kelas' : 'Nomor Induk Siswa (NIS)'}</label>
              <input type="text" inputmode="numeric" class="form-input" id="login-username" autocomplete="off" placeholder="${this.loginRole === 'guru' ? 'Masukkan username wali kelas' : 'Masukkan NIS Anda'}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="login-pin" autocomplete="new-password" placeholder="Masukkan password" required>
            </div>

            <div id="login-error" style="color: var(--status-danger); font-size: 0.82rem; margin-bottom: 1rem; display: none;"></div>

            <button type="submit" class="btn btn-primary btn-block" style="padding: 0.85rem;">Masuk ke Aplikasi 👉</button>
          </form>

          <div style="margin-top: 1rem; text-align: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 1rem;">
            MIPHA KU · Portal Kelas X DKV F<br>Radius dua kampus: <b>100 meter</b> · Jam masuk: <b>07.00 WIB</b>
          </div>
        </div>
      </div>
    `;
  },

  setupLoginEvents() {
    this.loginRole = this.loginRole || 'siswa';
    const tabSiswa = document.getElementById('tab-login-siswa');
    const tabGuru = document.getElementById('tab-login-guru');
    if (tabSiswa && tabGuru) {
      tabSiswa.onclick = () => { this.loginRole = 'siswa'; this.render(); };
      tabGuru.onclick = () => { this.loginRole = 'guru'; this.render(); };
    }

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) themeBtn.onclick = () => this.cycleTheme();

    const form = document.getElementById('form-login');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const username = document.getElementById('login-username').value;
        const pin = document.getElementById('login-pin').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menghubungkan ke Supabase...'; }
        const res = await this.login(username, pin, this.loginRole);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Masuk ke Aplikasi 👉'; }
        if (!res.success) {
          const errDiv = document.getElementById('login-error');
          errDiv.style.display = 'block';
          errDiv.textContent = res.message;
        }
      });
    }
  },

  renderActiveView() {
    switch(this.activeView) {
      case 'dashboard': return this.currentUser.role === 'guru' ? this.renderTeacherDashboard() : this.renderStudentDashboard();
      case 'checkin': return this.renderCheckinView();
      case 'leave': return this.renderLeaveView();
      case 'leaves_manage': return this.renderTeacherLeavesView();
      case 'students': return this.renderStudentsView();
      case 'analytics': return this.renderAnalyticsView();
      case 'grades': return this.renderTeacherGradesView();
      case 'my_grades': return this.renderStudentMyGradesView();
      case 'timetable': return this.renderTimetableView();
      case 'reports': return this.renderReportsView();
      case 'account': return this.renderAccountView();
      case 'home_visits': return this.renderHomeVisitsView();
      case 'assignments': return this.renderAssignmentsView();
      case 'ai_assistant': return this.renderAIAssistantView();
      case 'teacher_profile': return this.renderTeacherProfileView();
      case 'student_profile': return this.renderStudentProfileView();
      default: return this.renderStudentDashboard();
    }
  },

  renderStudentDashboard() {
    const student = this.currentUser;
    const att = this.attendance[student.id] || {};
    const statusBadges = {
      'tepat_waktu': '<span class="badge badge-success">✅ Tepat Waktu</span>',
      'sakit': '<span class="badge badge-info">🩺 Sakit</span>',
      'izin': '<span class="badge badge-info">📝 Izin</span>',
      'belum_checkin': '<span class="badge badge-danger">⏳ Belum Check-in</span>'
    };

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayName = days[new Date().getDay()];
    const todaySchedule = this.timetables.find(t => t.day === todayName) || this.timetables[0];

    return `
      <div class="welcome-banner">
        <span class="banner-role">Siswa X DKV F</span>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Halo, ${student.name} 👋</h2>
        <p style="font-size: 0.88rem; opacity: 0.95; margin-top: 4px;">NIS: <b>${student.nis}</b> | SMK Bhumi Phala Parakan</p>
      </div>

      <div class="card" style="border-left:4px solid var(--accent-magenta);">
        <div class="card-header-flex"><div class="card-title">🎒 Aktivitas Sekolahku</div><button class="btn btn-secondary" data-view="student_profile">Lengkapi Profil</button></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.75rem;font-size:.85rem;">
          <div><b>📚 Tugas</b><br>${this.assignments.length} aktif</div>
          <div><b>🏆 Prestasi</b><br>${(student.achievements||[]).length} tercatat</div>
          <div><b>📍 Lokasi Rumah</b><br>${student.homeLat ? '✅ Terdaftar' : '⚠️ Belum terdaftar'}</div>
          <div><b>📢 Pengumuman</b><br>${this.announcements.length} tersedia</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
        <div class="card" style="padding: 1rem; margin-bottom: 0; border-left: 4px solid var(--accent-yellow-bright); background: linear-gradient(135deg, #ffffff 0%, var(--accent-yellow-light) 100%);">
          <div style="font-size: 0.75rem; font-weight: 800; color: #854d0e; text-transform: uppercase;">👔 Seragam Hari Ini (${todaySchedule.day})</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary-dark); margin-top: 2px;">${todaySchedule.uniform}</div>
        </div>
        <div class="card" style="padding: 1rem; margin-bottom: 0; border-left: 4px solid var(--accent-magenta); background: linear-gradient(135deg, #ffffff 0%, var(--accent-magenta-soft) 100%);">
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-magenta); text-transform: uppercase;">📍 Lokasi Pembelajaran Hari Ini</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--primary-dark); margin-top: 2px;">${todaySchedule.location}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">📍 Status Kehadiran Hari Ini</div>
          <div>${statusBadges[att.status] || statusBadges['belum_checkin']}</div>
        </div>
          <div style="font-size: 0.88rem; color: var(--text-muted); display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: var(--primary-soft); padding: 0.85rem; border-radius: var(--radius-sm);">
          <div>Jam Check-in: <b>${att.checkinTime || '-'}</b></div>
          <div>Metode: <b>${att.checkinMethod ? att.checkinMethod.toUpperCase() : '-'}</b></div>
          <div>Campus: <b>${att.campusName || '-'}</b></div>
          <div>Check-out Sekolah: <b>${att.checkoutTime || '-'}</b></div>
          <div>Sampai Rumah: <b>${att.homeConfirmed ? `✅ (${att.homeArrivalTime})` : '⏳ Belum Konfirmasi'}</b></div>
        </div>
        ${att.checkinTime ? `<div class="moncer-sync-status ${att.moncerSync || 'pending'}">
          <b>${att.moncerSync === 'success' ? '✅ Terverifikasi di Moncer' : att.moncerSync === 'failed' ? '⚠️ Belum masuk Moncer' : '⏳ Sinkronisasi Moncer'}</b>
          <span>${att.moncerMessage || 'Menunggu konfirmasi dari server Moncer.'}</span>
        </div>` : ''}
      </div>

      <div class="card-title" style="margin-top: 1.5rem;">⚡ Aksi Cepat Presensi</div>
      <div class="action-grid">
        <button class="action-card checkin" data-view="checkin">
          <div class="action-icon">📍</div>
          <div class="action-title">Check-in Sekolah</div>
          <div class="action-desc">Verifikasi GPS / PIN (75m)</div>
        </button>
        <button class="action-card leave" data-view="leave">
          <div class="action-icon">📝</div>
          <div class="action-title">Form Izin / Sakit</div>
          <div class="action-desc">Pengajuan & Bukti Surat</div>
        </button>
        <button class="action-card checkout" id="btn-quick-checkout">
          <div class="action-icon">🏫</div>
          <div class="action-title">Check-out Pulang</div>
          <div class="action-desc">Jam >= 15.45 WIB</div>
        </button>
        <button class="action-card home" id="btn-quick-home">
          <div class="action-icon">🏠</div>
          <div class="action-title">Sampai Rumah</div>
          <div class="action-desc">Konfirmasi Kedatangan</div>
        </button>
      </div>

      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-header-flex">
          <div class="card-title">📝 Tugas Terbaru</div>
          <button class="btn btn-secondary" data-view="assignments">Lihat Semua</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${this.assignments.length ? this.assignments.slice(0, 3).map((assignment) => {
            const submittedBy = Array.isArray(assignment.submittedBy) ? assignment.submittedBy : [];
            const alreadySubmitted = submittedBy.includes(student.id);
            const submittedCount = submittedBy.length || Number(assignment.submitted || 0);
            const pct = assignment.total ? Math.round((submittedCount / assignment.total) * 100) : 0;
            return `
              <div style="border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.8rem; background: var(--bg-main);">
                <div style="display:flex; justify-content:space-between; gap:0.5rem; align-items:start; flex-wrap:wrap;">
                  <div>
                    <div style="font-weight: 800; color: var(--primary-dark);">${assignment.title}</div>
                    <div style="font-size: 0.77rem; color: var(--text-muted); margin-top: 2px;">${assignment.subject || '-'} • Deadline ${assignment.dueDate || '-'}</div>
                  </div>
                  <span class="badge ${alreadySubmitted ? 'badge-success' : 'badge-warning'}">${alreadySubmitted ? '✅ Terkumpul' : '⏳ Belum'}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-main); margin-top: 0.45rem;">${assignment.description || 'Tidak ada deskripsi.'}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 0.6rem; gap: 0.5rem; flex-wrap:wrap;">
                  <div style="font-size: 0.74rem; color: var(--text-muted);">${submittedCount}/${assignment.total || 0} terkumpul • ${pct}%</div>
                  ${alreadySubmitted ? '<span class="badge badge-success">Sudah dikumpulkan</span>' : `<button class="btn btn-primary btn-submit-assignment" data-assignment-id="${assignment.id}" style="padding: 0.35rem 0.7rem; font-size: 0.78rem;">📤 Kumpulkan</button>`}
                </div>
              </div>
            `;
          }).join('') : '<div style="font-size: 0.82rem; color: var(--text-muted);">Belum ada tugas yang dibagikan untuk kelas ini.</div>'}
        </div>
      </div>

      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-title">📢 Pengumuman Wali Kelas Terbaru</div>
        ${this.announcements.map(a => `
          <div style="border-bottom: 1px solid var(--border-light); padding: 0.75rem 0;">
            <div style="font-weight: 700; color: var(--primary-dark);">${a.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 2px;">${a.content}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Diposting oleh ${a.author} • ${a.date}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderTeacherDashboard() {
    const allAtt = Object.values(this.attendance);
    const total = this.students.length;
    const hadir = allAtt.filter(a => a.status === 'tepat_waktu').length;
    const izinSakit = allAtt.filter(a => a.status === 'sakit' || a.status === 'izin').length;
    const belumCheckin = allAtt.filter(a => a.status === 'belum_checkin').length;
    const confirmedHome = allAtt.filter(a => a.homeConfirmed).length;

    return `
      <div class="welcome-banner" style="background: linear-gradient(135deg, var(--primary-dark) 0%, var(--accent-magenta) 100%);">
        <span class="banner-role">Wali Kelas X DKV F</span>
        <h2 style="font-size: 1.35rem; font-weight: 800;">Selamat datang, ${this.teacherProfile.name} 👋</h2>
        <p style="font-size: 0.88rem; opacity: 0.95; margin-top: 4px; font-weight: 500;">Ruang kerja wali kelas untuk presensi, pendampingan siswa, tugas, nilai, dan home visit.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
        <div class="card" style="padding: 0.85rem; text-align: center; border-left: 4px solid var(--status-success);">
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--status-success);">${hadir}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Tepat Waktu</div>
        </div>
        <div class="card" style="padding: 0.85rem; text-align: center; border-left: 4px solid var(--status-info);">
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--status-info);">${izinSakit}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Sakit / Izin</div>
        </div>
        <div class="card" style="padding: 0.85rem; text-align: center; border-left: 4px solid var(--status-danger);">
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--status-danger);">${belumCheckin}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Belum Check-in</div>
        </div>
        <div class="card" style="padding: 0.85rem; text-align: center; border-left: 4px solid var(--status-purple);">
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--status-purple);">${confirmedHome} / ${total}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Sampai Rumah</div>
        </div>
      </div>

      ${(() => {
        const pendingLeaves = this.leaveRequests.filter(l => l.status === 'pending');
        return `
        <div class="card" style="border-left: 4px solid var(--accent-magenta); background: linear-gradient(135deg, #fff 0%, var(--accent-magenta-soft) 100%);">
          <div class="card-header-flex" style="margin-bottom: 0.5rem;">
            <div class="card-title" style="color: var(--accent-magenta);">📩 Pengajuan Izin Siswa Menunggu</div>
            ${pendingLeaves.length > 0 ? `<span class="badge badge-danger" style="font-size: 1rem; padding: 0.4rem 0.85rem;">${pendingLeaves.length} Pending</span>` : `<span class="badge badge-success">✅ Semua Ditangani</span>`}
          </div>
          <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 0.85rem;">
            ${pendingLeaves.length > 0 ? `Ada <b>${pendingLeaves.length} pengajuan izin</b> yang memerlukan persetujuan Wali Kelas.` : 'Tidak ada pengajuan izin yang perlu ditangani saat ini.'}
          </p>
          <button class="btn btn-primary btn-block" data-view="leaves_manage" style="padding: 0.7rem;">
            📩 Buka Halaman Kelola Izin Siswa
          </button>
        </div>
        `;
      })()}

      <div class="card" style="margin-bottom: 1rem; border-left: 4px solid var(--accent-yellow-bright);">
        <div class="card-header-flex">
          <div class="card-title">📝 Tugas Aktif Kelas</div>
          <button class="btn btn-primary btn-add-assignment">+ Tambah Tugas</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.7rem;">
          ${this.assignments.length ? this.assignments.slice(0, 3).map((assignment) => {
            const submittedBy = Array.isArray(assignment.submittedBy) ? assignment.submittedBy : [];
            const submittedCount = submittedBy.length || Number(assignment.submitted || 0);
            const pct = assignment.total ? Math.round((submittedCount / assignment.total) * 100) : 0;
            return `
              <div style="border:1px solid var(--border-light); border-radius: var(--radius-sm); padding:0.8rem; background: var(--bg-main);">
                <div style="display:flex; justify-content:space-between; gap:0.5rem; align-items:start; flex-wrap:wrap;">
                  <div>
                    <div style="font-weight:800; color: var(--primary-dark);">${assignment.title}</div>
                    <div style="font-size:0.76rem; color:var(--text-muted); margin-top:2px;">${assignment.subject || '-'} • Deadline ${assignment.dueDate || '-'}</div>
                  </div>
                  <span class="badge badge-info">${submittedCount}/${assignment.total || 0}</span>
                </div>
                <div style="font-size:0.79rem; color:var(--text-main); margin-top:0.45rem;">${assignment.description || 'Tidak ada deskripsi.'}</div>
                <div style="font-size:0.74rem; color:var(--text-muted); margin-top:0.4rem;">${pct}% terkumpul</div>
              </div>
            `;
          }).join('') : '<div style="font-size:0.82rem; color:var(--text-muted);">Belum ada tugas yang dibagikan.</div>'}
        </div>
      </div>

      <div class="mipha-grid">
        <button class="mipha-module" data-view="grades"><span>📊</span><b>Rapor Capaian</b><small>Kelola nilai semua mata pelajaran</small></button>
        <button class="mipha-module urgent" data-view="home_visits"><span>🏡</span><b>Home Visit Center</b><small>${this.homeVisits.filter(v=>v.status!=='completed').length} visits need action</small></button>
        <button class="mipha-module" data-view="assignments"><span>📚</span><b>Assignment Center</b><small>${this.assignments.reduce((n,a)=>n+(a.total-a.submitted),0)} missing submissions</small></button>
        <button class="mipha-module warning" data-view="students"><span>🚨</span><b>Student Warning</b><small>${allAtt.filter(a=>['sakit','izin','belum_checkin'].includes(a.status)).length} students flagged today</small></button>
        <button class="mipha-module ai" data-view="ai_assistant"><span>🤖</span><b>AI Teacher Assistant</b><small>Create summaries and reports</small></button>
      </div>

      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">📋 Presensi Siswa Real-time (36 Siswa)</div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" data-view="analytics">📈 Grafik Absensi</button>
            <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" data-view="reports">📥 Unduh Rekap</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Status Presensi</th>
                <th>Jam Check-in</th>
                <th>Jarak GPS</th>
                <th>Status Rumah</th>
                <th>Aksi Wali Kelas</th>
              </tr>
            </thead>
            <tbody>
              ${this.students.map((st, idx) => {
                const a = this.attendance[st.id] || {};
                const badges = {
                  'tepat_waktu': '<span class="badge badge-success">Tepat Waktu</span>',
                  'sakit': '<span class="badge badge-info">Sakit</span>',
                  'izin': '<span class="badge badge-info">Izin</span>',
                  'belum_checkin': '<span class="badge badge-danger">Belum Check-in</span>'
                };
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><b>${st.nis}</b></td>
                    <td><b>${st.name}</b></td>
                    <td>${badges[a.status] || badges['belum_checkin']}</td>
                    <td>${a.checkinTime || '-'}${a.campusName ? `<div style="font-size:0.72rem;color:var(--text-muted);">@ ${a.campusName}</div>` : ''}</td>
                    <td>${a.distanceMeters !== null && a.distanceMeters !== undefined ? `${a.distanceMeters}m` : '-'}</td>
                    <td>${a.homeConfirmed ? `<span class="badge badge-purple">✅ Sampai Rumah</span>` : '<span class="badge badge-warning">⏳ Belum Konfirm</span>'}</td>
                    <td>
                      <button class="btn btn-secondary btn-open-student-modal" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" data-student-id="${st.id}">
                        🔍 Dashboard Profil
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderStudentsView() {
    return `
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">👥 Dashboard Profil 36 Siswa X DKV F</div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th><th>NIS</th><th>Nama Siswa</th><th>Kelas</th><th>No Ortu</th><th>Password Siswa</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${this.students.map((s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><b>${s.nis}</b></td>
                  <td><b>${s.name}</b></td>
                  <td>${s.class}</td>
                  <td>${s.parentPhone}</td>
                  <td><span class="badge badge-info">${s.password || s.pin || s.nis}</span></td>
                  <td>
                    <div style="display:flex;gap:.35rem;flex-wrap:wrap">
                      <button class="btn btn-primary btn-open-student-modal" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" data-student-id="${s.id}">🔍 Profil</button>
                      <button class="btn btn-secondary btn-reset-student-password" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" data-student-id="${s.id}">🔑 Atur Password</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderTeacherLeavesView() {
    return `
      <div class="card">
        <div class="card-title">📩 Kelola Pengajuan Izin Siswa</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Daftar pengajuan izin masuk yang memerlukan persetujuan Wali Kelas.</p>

        ${this.leaveRequests.length === 0 ? '<p style="font-size: 0.85rem; color: var(--text-muted);">Tidak ada pengajuan izin.</p>' : `
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${this.leaveRequests.map(l => `
              <div style="border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1rem; background: var(--bg-main);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <div style="font-weight: 800; font-size: 1rem; color: var(--primary-dark);">${l.studentName}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Jenis: <b>${l.type.toUpperCase()}</b> | Tgl: ${l.startDate} s/d ${l.endDate}</div>
                  </div>
                  <div>
                    ${l.status === 'approved' ? '<span class="badge badge-success">Disetujui</span>' : (l.status === 'rejected' ? '<span class="badge badge-danger">Ditolak</span>' : '<span class="badge badge-warning">Menunggu</span>')}
                  </div>
                </div>

                <div style="font-size: 0.88rem; margin: 0.6rem 0; background: #fff; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                  " ${l.reason} "
                </div>

                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">No Ortu: <b>${l.parentPhone}</b></div>

                ${l.attachmentData ? `
                  <div style="margin: 0.5rem 0 0.75rem;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: var(--primary-dark); margin-bottom: 0.4rem;">📎 Lampiran:</div>
                    ${l.attachmentData.startsWith('data:image') ? `
                      <div style="position: relative; display: inline-block;">
                        <img src="${l.attachmentData}" alt="${l.attachment}"
                          style="max-width: 100%; max-height: 180px; object-fit: cover; border-radius: var(--radius-sm); border: 2px solid var(--border-light); display: block; cursor: pointer;"
                          onclick="AppState.openAttachment('${l.id}')">
                        <div style="position: absolute; bottom: 6px; right: 6px;">
                          <button onclick="AppState.openAttachment('${l.id}')" style="background: rgba(88,28,135,0.85); color: #fff; border: none; border-radius: 8px; padding: 0.3rem 0.6rem; font-size: 0.75rem; font-weight: 700; cursor: pointer;">🔍 Perbesar</button>
                        </div>
                      </div>
                      <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">📄 ${l.attachment}</div>
                    ` : `
                      <button onclick="AppState.openAttachment('${l.id}')" style="display: inline-flex; align-items: center; gap: 0.4rem; background: var(--primary-soft); border: 1.5px solid var(--border-light); border-radius: var(--radius-sm); padding: 0.5rem 0.85rem; font-size: 0.82rem; font-weight: 700; color: var(--primary-dark); cursor: pointer;">
                        📎 ${l.attachment} &nbsp;<span style="color: var(--accent-magenta);">— Klik untuk unduh</span>
                      </button>
                    `}
                  </div>
                ` : `
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">📎 Lampiran: <b>${l.attachment || 'Tidak ada'}</b></div>
                `}

                ${l.status === 'pending' ? `
                  <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button class="btn btn-success" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="AppState.updateLeaveStatus('${l.id}', 'approved', 'Disetujui oleh Wali Kelas')">✅ Setujui</button>
                    <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: var(--status-danger); color: #fff;" onclick="AppState.updateLeaveStatus('${l.id}', 'rejected', 'Alasan kurang lengkap')">❌ Tolak</button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ── Monthly Attendance Matrix ─────────────────────────────────────────────
  getMonthMatrix(year, month) {
    // month is 0-indexed (0=Jan)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const SCHOOL_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri
    const academicStart = this.parseLocalDate(ACADEMIC_ATTENDANCE_START);
    const todayBoundary = this.parseLocalDate(this.getTodayKey());

    const matrix = this.students.map(student => {
      let countS = 0, countI = 0, countA = 0, countH = 0, schoolDaysTotal = 0;
      const days = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        date.setHours(0, 0, 0, 0);
        const dow = date.getDay(); // 0=Sun, 6=Sat
        const isSchoolDay = SCHOOL_DAYS.includes(dow) && date >= academicStart && date <= todayBoundary;
        const status = this.attendanceStatusForDate(student.id, date);

        if (isSchoolDay) {
          schoolDaysTotal += 1;
          if (status === 'tepat_waktu') countH += 1;
          else if (status === 'sakit') countS += 1;
          else if (status === 'izin') countI += 1;
          else if (status === 'alpha') countA += 1;
        }

        days.push({ d, status, isSchoolDay });
      }

      const attended = countH;
      const pct = schoolDaysTotal > 0 ? Math.round((attended / schoolDaysTotal) * 100) : 100;
      return { student, days, countS, countI, countA, countH, schoolDaysTotal, pct, daysInMonth };
    });

    return { matrix, daysInMonth, year, month };
  },

  renderAnalyticsView() {
    const now = new Date();
    const selYear = this.matrixYear || now.getFullYear();
    const selMonth = this.matrixMonth !== undefined ? this.matrixMonth : now.getMonth();

    const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const { matrix, daysInMonth } = this.getMonthMatrix(selYear, selMonth);

    // Summary stats
    const totalStudents = this.students.length;
    const avgPct = Math.round(matrix.reduce((sum, r) => sum + r.pct, 0) / totalStudents);
    const totalPresent = matrix.reduce((sum, r) => sum + r.countH, 0);
    const totalS = matrix.reduce((sum, r) => sum + r.countS, 0);
    const totalI = matrix.reduce((sum, r) => sum + r.countI, 0);
    const totalA = matrix.reduce((sum, r) => sum + r.countA, 0);

    // Day of week headers
    const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(selYear, selMonth, i + 1);
      const dow = d.getDay();
      const isWeekend = dow === 0 || dow === 6;
      return { num: i + 1, dow, dayName: DAYS_SHORT[dow], isWeekend };
    });

    // Cell color logic
    const isEditableMatrix = this.currentUser && this.currentUser.role === 'guru';
    const cellStyle = (status, isSchoolDay) => {
      if (status === 'before_start') return 'background:#f8fafc; color:#cbd5e1;';
      if (!isSchoolDay) return 'background:#e5e7eb; color:#9ca3af;';
      switch (status) {
        case 'tepat_waktu':  return 'background:#16a34a; color:#fff;';
        case 'sakit':  return 'background:#eab308; color:#1a1a1a;';
        case 'izin':   return 'background:#1f2937; color:#fff;';
        case 'alpha':  return 'background:#dc2626; color:#fff;';
        case 'no_record': return 'background:#f8fafc; color:#64748b;';
        case 'future': return 'background:#f3e8ff; color:#c084fc;';
        default:       return 'background:#e5e7eb; color:#9ca3af;';
      }
    };

    const cellContent = (status, isSchoolDay) => {
      if (!isSchoolDay) return '·';
      switch (status) {
        case 'tepat_waktu':  return '✓';
        case 'sakit':  return 'S';
        case 'izin':   return 'I';
        case 'alpha':  return 'A';
        case 'no_record': return '·';
        case 'future': return '–';
        default:       return '·';
      }
    };

    return `
      <!-- Summary Banner -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px,1fr)); gap:0.75rem; margin-bottom:1.25rem;">
        <div style="background:linear-gradient(135deg,var(--primary-dark),var(--accent-magenta)); color:#fff; border-radius:var(--radius-md); padding:1rem; text-align:center;">
          <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;opacity:0.9;">Rata-rata Kehadiran</div>
          <div style="font-size:2rem;font-weight:800;">${avgPct}%</div>
          <div style="font-size:0.72rem;opacity:0.85;">${MONTH_NAMES[selMonth]} ${selYear}</div>
        </div>
        <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:var(--radius-md);padding:1rem;text-align:center;">
          <div style="font-size:0.72rem;font-weight:700;color:#065f46;text-transform:uppercase;">Total Present (Tepat Waktu)</div>
          <div style="font-size:1.75rem;font-weight:800;color:#16a34a;">${totalPresent}</div>
          <div style="font-size:0.7rem;color:#6b7280;">kumulatif semua siswa</div>
        </div>
        <div style="background:#fef9c3;border:1.5px solid #fde68a;border-radius:var(--radius-md);padding:1rem;text-align:center;">
          <div style="font-size:0.72rem;font-weight:700;color:#854d0e;text-transform:uppercase;">Total Sakit (S)</div>
          <div style="font-size:1.75rem;font-weight:800;color:#ca8a04;">${totalS}</div>
          <div style="font-size:0.7rem;color:#6b7280;">kumulatif semua siswa</div>
        </div>
        <div style="background:#f1f5f9;border:1.5px solid #cbd5e1;border-radius:var(--radius-md);padding:1rem;text-align:center;">
          <div style="font-size:0.72rem;font-weight:700;color:#374151;text-transform:uppercase;">Total Izin (I)</div>
          <div style="font-size:1.75rem;font-weight:800;color:#1f2937;">${totalI}</div>
          <div style="font-size:0.7rem;color:#6b7280;">kumulatif semua siswa</div>
        </div>
        <div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:var(--radius-md);padding:1rem;text-align:center;">
          <div style="font-size:0.72rem;font-weight:700;color:#991b1b;text-transform:uppercase;">Total Alpha (A)</div>
          <div style="font-size:1.75rem;font-weight:800;color:#dc2626;">${totalA}</div>
          <div style="font-size:0.7rem;color:#6b7280;">kumulatif semua siswa</div>
        </div>
      </div>

      <!-- Month Selector & Title -->
      <div class="card" style="margin-bottom:0.75rem; padding:0.85rem 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--primary-dark);">📊 Rekap Absensi Bulanan Per Siswa</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">Kelas X DKV F — SMK Bhumi Phala Parakan — Tahun Ajaran 2026/2027</div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center;">
            <select id="sel-matrix-month" class="form-select" style="padding:0.35rem 0.5rem;font-size:0.82rem;width:auto;">
              ${MONTH_NAMES.map((m,i) => `<option value="${i}" ${i===selMonth?'selected':''}>${m}</option>`).join('')}
            </select>
            <select id="sel-matrix-year" class="form-select" style="padding:0.35rem 0.5rem;font-size:0.82rem;width:auto;">
              ${[2025,2026,2027].map(y => `<option value="${y}" ${y===selYear?'selected':''}>${y}</option>`).join('')}
            </select>
            <button class="btn btn-primary" id="btn-matrix-refresh" style="padding:0.35rem 0.75rem;font-size:0.82rem;">🔄 Tampilkan</button>
          </div>
        </div>
      </div>

      <!-- Matrix Grid -->
      <div style="overflow-x: visible; border:2px solid var(--border-light); border-radius:var(--radius-md); background:#fff; box-shadow:var(--shadow-md); width: 100%;">
        <table id="attendance-matrix-table" style="border-collapse:collapse; font-family:var(--font-family); width:100%; min-width:100%;">

          <!-- Title Row -->
          <thead>
            <tr>
              <td colspan="${daysInMonth + 7}"
                style="background:var(--primary-soft); text-align:center; padding:0.6rem 1rem; border-bottom:2px solid var(--border-light);">
                <div style="font-weight:800;color:var(--primary-dark);font-size:0.95rem;">Absensi Kelas X DKV F</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">SMK Bhumi Phala Parakan — Tahun Ajaran 2026/2027</div>
              </td>
            </tr>

            <!-- Wali Kelas Row -->
            <tr>
              <td colspan="3" style="padding:0.4rem 0.75rem;font-size:0.8rem;color:var(--text-muted);border-bottom:1px solid var(--border-light);">Wali Kelas:</td>
              <td colspan="${daysInMonth + 4}" style="padding:0.4rem 0.75rem;font-size:0.82rem;font-weight:800;color:var(--primary-dark);border-bottom:1px solid var(--border-light);">Gevin Dimas Eka Kusuma, A.Md.</td>
            </tr>

            <!-- Month Header -->
            <tr>
              <th rowspan="2" style="background:var(--primary-dark);color:#fff;font-size:0.75rem;padding:0.4rem 0.3rem;text-align:center;border:1px solid rgba(255,255,255,0.15);min-width:28px;">No</th>
              <th rowspan="2" style="background:var(--primary-dark);color:#fff;font-size:0.75rem;padding:0.4rem 0.4rem;text-align:center;border:1px solid rgba(255,255,255,0.15);min-width:44px;">NIS</th>
              <th rowspan="2" style="background:var(--primary-dark);color:#fff;font-size:0.75rem;padding:0.4rem 0.6rem;text-align:left;border:1px solid rgba(255,255,255,0.15);min-width:140px;">NAMA</th>
              <th colspan="${daysInMonth}" style="background:var(--accent-magenta);color:#fff;font-size:0.8rem;padding:0.4rem;text-align:center;border:1px solid rgba(255,255,255,0.2);">
                Bulan ${MONTH_NAMES[selMonth]} ${selYear}
              </th>
              <th colspan="3" rowspan="2" style="background:var(--primary-dark);color:#fff;font-size:0.72rem;padding:0.4rem;text-align:center;border:1px solid rgba(255,255,255,0.15);min-width:36px;">Jumlah</th>
              <th rowspan="2" style="background:#ca8a04;color:#fff;font-size:0.72rem;padding:0.4rem;text-align:center;border:1px solid rgba(255,255,255,0.15);min-width:60px;">Persen-tasi Kehadiran</th>
            </tr>

            <!-- Day Number Headers -->
            <tr>
              ${dayHeaders.map(h => `
                <th style="background:${h.isWeekend ? '#6b7280' : 'var(--primary-medium)'};color:#fff;font-size:0.65rem;padding:0.2rem 0.1rem;text-align:center;min-width:22px;border:1px solid rgba(255,255,255,0.15);">
                  <div style="font-weight:800;">${h.num}</div>
                  <div style="opacity:0.8;font-size:0.55rem;">${h.dayName}</div>
                </th>
              `).join('')}
            </tr>

            <!-- Jumlah sub-headers (S, I, A) -->
            <!-- injected inline in colspan above -->
          </thead>

          <tbody>
            ${matrix.map((row, idx) => {
              const isEven = idx % 2 === 0;
              const rowBg = isEven ? '#ffffff' : '#faf5ff';
              return `
                <tr>
                  <td style="background:${rowBg};text-align:center;font-size:0.78rem;font-weight:700;color:var(--text-muted);padding:0.2rem 0.25rem;border:1px solid #f0e6ff;">${idx + 1}</td>
                  <td style="background:${rowBg};text-align:center;font-size:0.72rem;color:var(--primary-dark);padding:0.2rem 0.3rem;border:1px solid #f0e6ff;white-space:nowrap;">${row.student.nis}</td>
                  <td style="background:${rowBg};font-size:0.78rem;font-weight:700;color:var(--primary-dark);padding:0.2rem 0.6rem;border:1px solid #f0e6ff;white-space:nowrap;">${row.student.name}</td>
                  ${row.days.map(cell => {
                    const cellDate = this.formatDateKey(new Date(selYear, selMonth, cell.d));
                    const editableAttrs = cell.isSchoolDay && isEditableMatrix ? `class="editable-attendance-cell" data-student-id="${row.student.id}" data-date="${cellDate}"` : '';
                    const cursorStyle = cell.isSchoolDay && isEditableMatrix ? 'cursor:pointer;' : '';
                    const titleText = cell.isSchoolDay ? (isEditableMatrix ? 'Klik untuk mengubah status absensi' : cell.status) : 'Libur';
                    return `
                      <td ${editableAttrs} style="${cellStyle(cell.status, cell.isSchoolDay)}font-size:0.7rem;font-weight:800;text-align:center;padding:0.2rem 0;border:1px solid rgba(0,0,0,0.06);${cursorStyle}" title="${titleText}">
                        ${cellContent(cell.status, cell.isSchoolDay)}
                      </td>
                    `;
                  }).join('')}
                  <td style="background:${row.countS > 0 ? '#fef9c3' : rowBg};text-align:center;font-size:0.78rem;font-weight:800;color:#854d0e;padding:0.2rem 0.3rem;border:1px solid #f0e6ff;">${row.countS}</td>
                  <td style="background:${row.countI > 0 ? '#1f2937' : rowBg};text-align:center;font-size:0.78rem;font-weight:800;color:${row.countI > 0 ? '#fff' : '#374151'};padding:0.2rem 0.3rem;border:1px solid #f0e6ff;">${row.countI}</td>
                  <td style="background:${row.countA > 0 ? '#fef2f2' : rowBg};text-align:center;font-size:0.78rem;font-weight:800;color:${row.countA > 0 ? '#dc2626' : '#374151'};padding:0.2rem 0.3rem;border:1px solid #f0e6ff;">${row.countA}</td>
                  <td style="background:${row.pct >= 90 ? '#ecfdf5' : (row.pct >= 75 ? '#fef9c3' : '#fef2f2')};text-align:center;font-size:0.8rem;font-weight:800;color:${row.pct >= 90 ? '#16a34a' : (row.pct >= 75 ? '#92400e' : '#dc2626')};padding:0.2rem 0.4rem;border:1px solid #f0e6ff;">
                    ${row.pct}%
                  </td>
                </tr>
              `;
            }).join('')}

            <!-- TOTALS ROW -->
            <tr style="background:var(--primary-soft);">
              <td colspan="3" style="text-align:right;font-size:0.8rem;font-weight:800;color:var(--primary-dark);padding:0.4rem 0.75rem;border-top:2px solid var(--primary-medium);">TOTAL KELAS</td>
              ${dayHeaders.map(h => {
                if (!h.isSchoolDay || h.isWeekend) return `<td style="background:#e5e7eb;border:1px solid #d1d5db;"></td>`;
                const dayNum = h.num;
                const hadir = matrix.filter(r => r.days[dayNum-1].status === 'tepat_waktu').length;
                const total = matrix.filter(r => r.days[dayNum-1].isSchoolDay && r.days[dayNum-1].status !== 'future').length;
                const pct = total > 0 ? Math.round((hadir/total)*100) : 0;
                return `<td style="background:${pct>=80?'#dcfce7':(pct>0?'#fef9c3':'#f3e8ff')};text-align:center;font-size:0.65rem;font-weight:800;color:var(--primary-dark);border:1px solid #e0d4f5;padding:0.1rem;" title="${hadir} hadir dari ${total}">${pct > 0 ? pct+'%' : ''}</td>`;
              }).join('')}
              <td style="background:#fef9c3;text-align:center;font-weight:800;font-size:0.78rem;color:#854d0e;border:1px solid #e0d4f5;">${totalS}</td>
              <td style="background:#1f2937;text-align:center;font-weight:800;font-size:0.78rem;color:#fff;border:1px solid #e0d4f5;">${totalI}</td>
              <td style="background:#fef2f2;text-align:center;font-weight:800;font-size:0.78rem;color:#dc2626;border:1px solid #e0d4f5;">${totalA}</td>
              <td style="background:var(--primary-soft);text-align:center;font-weight:800;font-size:0.8rem;color:var(--primary-dark);border:1px solid #e0d4f5;">${avgPct}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;margin-top:1rem;padding:0.75rem 1rem;background:#fff;border-radius:var(--radius-md);border:1px solid var(--border-light);font-size:0.82rem;font-weight:700;">
        <span style="color:var(--text-muted);">Keterangan:</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="display:inline-block;width:22px;height:22px;background:#16a34a;border-radius:4px;text-align:center;line-height:22px;color:#fff;font-size:0.7rem;">✓</span> Hadir</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="display:inline-block;width:22px;height:22px;background:#eab308;border-radius:4px;text-align:center;line-height:22px;color:#1a1a1a;font-size:0.7rem;font-weight:800;">S</span> Sakit</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="display:inline-block;width:22px;height:22px;background:#1f2937;border-radius:4px;text-align:center;line-height:22px;color:#fff;font-size:0.7rem;font-weight:800;">I</span> Izin</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="display:inline-block;width:22px;height:22px;background:#dc2626;border-radius:4px;text-align:center;line-height:22px;color:#fff;font-size:0.7rem;font-weight:800;">A</span> Alpha</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="display:inline-block;width:22px;height:22px;background:#e5e7eb;border-radius:4px;text-align:center;line-height:22px;color:#9ca3af;font-size:0.7rem;">·</span> Libur / Akhir Pekan</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;"><span style="display:inline-block;width:22px;height:22px;background:#f3e8ff;border-radius:4px;text-align:center;line-height:22px;color:#c084fc;font-size:0.7rem;">–</span> Belum Tercatat</span>
      </div>
    `;
  },

  renderTeacherGradesView() {
    const subjects = this.getGradeSubjects();
    const subject = subjects.includes(this.selectedGradeSubject) ? this.selectedGradeSubject : subjects[0];
    this.selectedGradeSubject = subject;
    const completed = this.students.filter(student => this.gradeReports[this.gradeReportKey(student.id, subject)]).length;
    return `
      <div class="welcome-banner grade-hero"><span class="banner-role">Rapor Capaian Kejuruan</span><h2>Penilaian Kelas X DKV F</h2><p>Nilai tersimpan di cloud dan otomatis tampil pada dashboard siswa.</p></div>
      <div class="card grade-toolbar">
        <div class="form-group"><label class="form-label">Semester</label><select id="grade-semester" class="form-select">${['2026/2027 - Ganjil','2026/2027 - Genap'].map(item => `<option ${item === this.selectedGradeSemester ? 'selected' : ''}>${item}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Mata Pelajaran</label><select id="grade-subject" class="form-select">${subjects.map(item => `<option ${item === subject ? 'selected' : ''}>${item}</option>`).join('')}</select></div>
        <div class="grade-progress"><b>${completed}/${this.students.length}</b><span>Siswa sudah dinilai</span></div>
      </div>
      <div class="card">
        <div class="card-title">📝 Buku Nilai — ${subject}</div>
        <p class="grade-help">Catat seluruh tugas, kuis, praktik, STS/UTS, SAS/UAS, dan remedial. Nilai akhir dihitung otomatis dari bobot semua komponen. KKM 75.</p>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>No</th><th>NIS</th><th>Nama Siswa</th><th>Komponen</th><th>Nilai Akhir</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${this.students.map((st, idx) => {
                const g = this.gradeReports[this.gradeReportKey(st.id, subject)] || {};
                const entries = this.getGradeEntries(g);
                const finalGrade = this.calculateGradeBook(entries);
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><b>${st.nis}</b></td>
                    <td><b>${st.name}</b></td>
                    <td>${entries.length} nilai</td>
                    <td><span class="badge ${finalGrade === null ? 'badge-info' : finalGrade >= 75 ? 'badge-success' : 'badge-danger'}">${finalGrade ?? 'Belum'}</span></td>
                    <td>${finalGrade === null ? 'Belum dinilai' : finalGrade >= 75 ? 'Tuntas' : 'Perlu bimbingan'}</td>
                    <td>
                      <button class="btn btn-secondary btn-toggle-grade-detail" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" data-student-id="${st.id}">✏️ Rincian</button>
                    </td>
                  </tr>
                  <tr class="grade-detail-row grade-detail-${st.id}" hidden><td colspan="7">
                    <div class="grade-entry-panel" data-student-id="${st.id}">
                      <div class="grade-entry-list">${entries.map(item => this.renderGradeEntryInput(st.id, item)).join('')}</div>
                      <button class="btn btn-secondary btn-add-grade-entry" data-student-id="${st.id}">＋ Tambah Nilai</button>
                      <div class="grade-meta-grid">
                        <div><label class="form-label">Sikap</label><select class="form-select select-sikap-${st.id}"><option value="A" ${g.sikap === 'A' ? 'selected' : ''}>A</option><option value="B" ${!g.sikap || g.sikap === 'B' ? 'selected' : ''}>B</option><option value="C" ${g.sikap === 'C' ? 'selected' : ''}>C</option></select></div>
                        <div><label class="form-label">Capaian Kompetensi</label><textarea class="form-input input-capaian-${st.id}" rows="2" placeholder="Catatan capaian siswa...">${g.capaian || ''}</textarea></div>
                      </div>
                      <button class="btn btn-primary btn-save-student-grade" data-student-id="${st.id}">💾 Simpan Semua Nilai</button>
                    </div>
                  </td></tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderGradeEntryInput(studentId, item = {}) {
    const types = [['tugas','Tugas'],['kuis','Kuis'],['praktik','Praktik/Proyek'],['sts','STS/UTS'],['sas','SAS/UAS'],['remedial','Remedial'],['lainnya','Lainnya']];
    return `<div class="grade-entry" data-entry-id="${item.id || ''}">
      <select class="form-select grade-entry-type">${types.map(([value,label]) => `<option value="${value}" ${item.type === value ? 'selected' : ''}>${label}</option>`).join('')}</select>
      <input class="form-input grade-entry-title" value="${item.title || ''}" placeholder="Contoh: Tugas Logo 1">
      <input type="date" class="form-input grade-entry-date" value="${item.date || ''}">
      <input type="number" min="0" max="100" class="form-input grade-entry-score" value="${Number.isFinite(Number(item.score)) ? item.score : ''}" placeholder="Nilai">
      <input type="number" min="1" max="100" class="form-input grade-entry-weight" value="${Number(item.weight) || 10}" placeholder="Bobot">
      <button class="btn btn-danger btn-remove-grade-entry" type="button" title="Hapus nilai">×</button>
    </div>`;
  },

  renderStudentMyGradesView() {
    const student = this.currentUser;
    const grades = this.getStudentGradeReports(student.id);
    const average = grades.length ? Math.round(grades.reduce((sum, item) => sum + Number(item.finalGrade || 0), 0) / grades.length) : 0;
    return `
      <div class="welcome-banner grade-hero"><span class="banner-role">Rapor Capaian</span><h2>Nilai Saya</h2><p>${this.selectedGradeSemester} • ${student.name}</p></div>
      <div class="grade-summary-grid"><div class="card"><b>${grades.length}</b><span>Mapel dinilai</span></div><div class="card"><b>${grades.length ? average : '-'}</b><span>Rata-rata</span></div><div class="card"><b>${grades.filter(g => Number(g.finalGrade) >= 75).length}</b><span>Tuntas</span></div></div>
      <div class="card">
        <div class="card-title">📊 Rekap Nilai Akademik & Kejuruan</div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Mata Pelajaran</th><th>Rincian Nilai</th><th>Sikap</th><th>Nilai Akhir</th><th>Status</th><th>Capaian</th></tr>
            </thead>
            <tbody>
              ${grades.length ? grades.map(item => `
                  <tr>
                    <td><b>${item.subject}</b></td>
                    <td><div class="student-grade-chips">${this.getGradeEntries(item).map(entry => `<span><b>${entry.title}</b>: ${entry.score} <small>(${entry.weight}%)</small></span>`).join('') || 'Belum ada rincian'}</div></td>
                    <td><span class="badge badge-purple">${item.sikap}</span></td>
                    <td><b>${item.finalGrade}</b></td>
                    <td><span class="badge ${Number(item.finalGrade) >= 75 ? 'badge-success' : 'badge-danger'}">${Number(item.finalGrade) >= 75 ? '✅ Tuntas' : 'Perlu bimbingan'}</span></td>
                    <td class="grade-achievement">${item.capaian || 'Belum ada catatan capaian.'}</td>
                  </tr>
                `).join('') : '<tr><td colspan="6" class="empty-state">Belum ada nilai yang diterbitkan oleh guru.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderStudentProfileModal(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return '';
    const att = this.attendance[student.id] || {};
    const grades = student.grades || {};

    return `
      <div class="modal-overlay">
        <div class="modal-card fade-in">
          <div class="modal-header">
            <div class="modal-title">🎓 Dashboard Profil: ${student.name}</div>
            <button class="btn-close" id="btn-close-modal">&times;</button>
          </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: var(--primary-soft); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.88rem;">
            <div><b>NIS:</b> ${student.nis}</div>
            <div><b>Kelas:</b> ${student.class}</div>
            <div><b>No Ortu:</b> ${student.parentPhone}</div>
            <div><b>PIN Login:</b> ${student.pin}</div>
            <div><b>Status Hari Ini:</b> <span class="badge badge-success">${att.status || 'BELUM CHECKIN'}</span></div>
            <div><b>Jam Check-in:</b> ${att.checkinTime || '-'}</div>
            <div><b>Campus:</b> ${att.campusName || '-'}</div>
          ${this.currentUser.role === 'guru' ? `<div><button class="btn btn-secondary btn-edit-attendance" data-student-id="${student.id}" style="padding:0.35rem 0.65rem;font-size:0.8rem;">✏️ Edit Presensi</button></div>` : ''}
          </div>

          <div class="card-title" style="font-size: 1rem;">📝 Input Catatan & Pembinaan Wali Kelas</div>
          <div class="form-group">
            <textarea class="form-textarea" id="modal-teacher-notes" rows="3" placeholder="Tuliskan catatan perkembangan...">${student.teacherNotes || ''}</textarea>
          </div>

          <button class="btn btn-primary btn-block" id="btn-save-modal-notes" style="margin-bottom: 1.5rem;">
            💾 Simpan Catatan Wali Kelas
          </button>
        </div>
      </div>
    `;
  },

  renderAttendanceEditModal(studentId) {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return '';
    const att = this.attendance[student.id] || {};
    const statusOptions = [
      { value: 'belum_checkin', label: 'Belum Check-in' },
      { value: 'tepat_waktu', label: 'Hadir (Tepat Waktu)' },
      { value: 'sakit', label: 'Sakit' },
      { value: 'izin', label: 'Izin' }
    ];

    return `
      <div class="modal-overlay">
        <div class="modal-card fade-in">
          <div class="modal-header">
            <div class="modal-title">✏️ Edit Presensi: ${student.name}</div>
            <button type="button" class="btn-close" id="btn-close-attendance-modal">&times;</button>
          </div>
          <form id="form-edit-attendance">
            <div class="form-group">
              <label class="form-label">Status Presensi</label>
              <select class="form-select" id="edit-attendance-status" required>
                ${statusOptions.map(option => `<option value="${option.value}" ${att.status === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Jam Check-in</label><input class="form-input" id="edit-attendance-checkin" value="${att.checkinTime || ''}" placeholder="07:05 WIB"></div>
            <div class="form-group"><label class="form-label">Metode Check-in</label><input class="form-input" id="edit-attendance-method" value="${att.checkinMethod || ''}" placeholder="gps / pin"></div>
            <div class="form-group"><label class="form-label">Jarak GPS (m)</label><input type="number" min="0" class="form-input" id="edit-attendance-distance" value="${att.distanceMeters || ''}" placeholder="35"></div>
            <div class="form-group"><label class="form-label">Campus</label><input class="form-input" id="edit-attendance-campus" value="${att.campusName || ''}" placeholder="Kampus 1"></div>
            <div class="form-group"><label class="form-label">Check-out Sekolah</label><input class="form-input" id="edit-attendance-checkout" value="${att.checkoutTime || ''}" placeholder="15:45 WIB"></div>
            <div class="form-group"><label class="form-label">Sampai Rumah</label><input class="form-input" id="edit-attendance-home-arrival" value="${att.homeArrivalTime || ''}" placeholder="16:20 WIB"></div>
            <div class="form-group"><label class="form-label">Konfirmasi Sampai Rumah</label><label class="check-row"><input type="checkbox" id="edit-attendance-home-confirmed" ${att.homeConfirmed ? 'checked' : ''}> Sudah sampai rumah</label></div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:1rem;">💾 Simpan Perubahan</button>
          </form>
        </div>
      </div>
    `;
  },

  renderCheckinView() {
    return `
      <div class="card">
        <div class="card-title">📍 Check-in Lokasi Sekolah</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Ketentuan Presensi Sekolah: Radius Maksimal <b>100 Meter</b> dari Kampus 1 atau Kampus 2. Batas Tepat Waktu <b>07.00 WIB</b>.
        </p>

        <div style="background: var(--primary-soft); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; margin-bottom: 1.25rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.4rem;">📍</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">SMK Bhumi Phala Parakan</div>
          <div id="checkin-gps-result" style="margin-top: 1rem; font-weight: 700; font-size: 0.95rem; color: var(--status-success);">
            📍 Posisi Anda Terdeteksi: <b>35 Meter dari Sekolah</b> (Dalam Radius)
          </div>
        </div>

        <button class="btn btn-success btn-block" id="btn-do-gps-checkin" style="padding: 0.9rem; font-size: 1rem;">
          🔘 Saya Sudah Sampai Sekolah (GPS Instant)
        </button>

        <div style="margin-top: 1.5rem; border-top: 1px dashed var(--border-light); padding-top: 1.25rem;">
          <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem;">Alternatif: Verifikasi NIS Pribadi</div>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.6rem;">NIS harus sesuai dengan akun siswa yang sedang login dan tidak dapat dipakai untuk siswa lain.</div>
          <div class="form-group">
            <div style="display: flex; gap: 0.5rem;">
              <input type="text" inputmode="numeric" autocomplete="off" class="form-input" id="input-pin-backup" placeholder="Masukkan NIS pribadi">
              <button class="btn btn-primary" id="btn-do-pin-checkin">Verifikasi NIS</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderLeaveView() {
    const studentLeaves = this.leaveRequests.filter(l => l.studentId === this.currentUser.id);
    return `
      <div class="card">
        <div class="card-title">📝 Form Pengajuan Izin / Sakit</div>
      ${!this.currentUser.parentPhone ? `
        <div class="alert alert-warning" style="margin-bottom:1rem;">
          Nomor WhatsApp orang tua/wali wajib diisi untuk mengajukan izin. Lokasi rumah dapat dilengkapi nanti.
        </div>
      ` : ''}
        <form id="form-submit-leave">
          <div class="form-group">
            <label class="form-label">Jenis Izin</label>
            <select class="form-select" id="leave-type" required>
              <option value="sakit">Sakit</option>
              <option value="keperluan_keluarga">Keperluan Keluarga</option>
              <option value="pulang_awal">Pulang Lebih Awal</option>
              <option value="kegiatan_sekolah">Kegiatan Sekolah / Lomba</option>
              <option value="lainnya">Alasan Lainnya</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Tanggal Mulai</label>
              <input type="date" class="form-input" id="leave-start" value="2026-07-24" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Selesai</label>
              <input type="date" class="form-input" id="leave-end" value="2026-07-24" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Alasan Lengkap</label>
            <textarea class="form-textarea" id="leave-reason" rows="3" placeholder="Jelaskan alasan pengajuan izin..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Lampiran Bukti Surat / Foto (Opsional)</label>
            <input type="file" class="form-input" id="leave-file">
          </div>

          <div class="form-group">
            <label class="form-label">Nomor WhatsApp Orang Tua / Wali</label>
            <input type="text" class="form-input" id="leave-parent-phone" value="${this.currentUser.parentPhone || ''}" required>
          </div>

          <button type="submit" class="btn btn-primary btn-block">Kirim Pengajuan Izin 👉</button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">📜 Riwayat Pengajuan Izin Saya</div>
        ${studentLeaves.length === 0 ? '<p style="font-size: 0.85rem; color: var(--text-muted);">Belum ada riwayat pengajuan izin.</p>' : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Jenis</th><th>Alasan</th><th>Status</th><th>Catatan Wali Kelas</th></tr>
              </thead>
              <tbody>
                ${studentLeaves.map(l => `
                  <tr>
                    <td>${l.startDate}</td>
                    <td><b>${l.type.toUpperCase()}</b></td>
                    <td>${l.reason}</td>
                    <td>${l.status === 'approved' ? '<span class="badge badge-success">Disetujui</span>' : (l.status === 'rejected' ? '<span class="badge badge-danger">Ditolak</span>' : '<span class="badge badge-warning">Menunggu</span>')}</td>
                    <td>${l.teacherNote || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  renderTimetableView() {
    return `
      <div class="card">
        <div class="card-title">📅 Jadwal Pembelajaran X DKV F</div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem;">
          ${this.timetables.map(t => `
            <div style="border: 2px solid var(--border-light); border-radius: var(--radius-md); padding: 1.1rem; background: #fff;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-light); padding-bottom: 0.6rem; margin-bottom: 0.75rem;">
                <div>
                  <span style="font-weight: 800; color: var(--primary-dark); font-size: 1.1rem;">📌 Hari ${t.day}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">(Lokasi: <b>${t.location}</b>)</span>
                </div>
                <span class="badge badge-warning">👔 ${t.uniform}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${t.subjects.map(s => `
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 0.5rem 0.75rem; background: var(--bg-main); border-radius: var(--radius-sm);">
                    <div>
                      <b>${s.name}</b> ${s.room !== '-' ? `[${s.room}]` : ''}
                      ${s.teacher !== '-' ? `<div style="font-size: 0.75rem; color: var(--text-muted);">👨‍🏫 ${s.teacher}</div>` : ''}
                    </div>
                    <b>${s.time}</b>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderReportsView() {
    return `
      <div class="card">
        <div class="card-title">📥 Rekap & Laporan Presensi Harian</div>
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; align-items: center;">
          <button class="btn btn-primary" id="btn-export-csv">📄 Unduh Rekap (CSV)</button>
          <button class="btn btn-primary" id="btn-export-xlsx">📄 Unduh Rekap (XLSX)</button>
          <button class="btn btn-secondary" id="btn-import-csv">📥 Import Data Presensi</button>
          <button class="btn btn-secondary" onclick="window.print()">🖨️ Cetak / Save PDF</button>
          <input id="import-csv-input" type="file" accept=".csv,.xlsx,.xls" style="display:none" />
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>No</th><th>NIS</th><th>Nama Siswa</th><th>Status</th><th>Check-in</th><th>Jarak</th><th>Check-out</th><th>Rumah</th>${this.currentUser.role === 'guru' ? '<th>Aksi</th>' : ''}</tr>
            </thead>
            <tbody>
              ${this.students.map((st, idx) => {
                const a = this.attendance[st.id] || {};
                return `
                  <tr>
                    <td>${idx + 1}</td><td><b>${st.nis}</b></td><td><b>${st.name}</b></td>
                    <td>${a.status ? a.status.toUpperCase() : 'BELUM CHECKIN'}</td>
                    <td>${a.checkinTime || '-'}</td><td>${a.distanceMeters ? `${a.distanceMeters}m` : '-'}</td>
                    <td>${a.checkoutTime || '-'}</td><td>${a.homeConfirmed ? 'YA' : 'BELUM'}</td>
                    ${this.currentUser.role === 'guru' ? `<td><button class="btn btn-secondary btn-edit-attendance" data-student-id="${st.id}" style="padding:0.3rem 0.5rem;font-size:0.75rem;">✏️ Edit</button></td>` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderAccountView() {
    const isDirSet = !!this.uploadsDir;
    return `
      <div class="card">
        <div class="card-title">⚙️ Pengaturan Akun & Prototipe</div>
        <p style="font-size: 0.9rem;">Logged as: <b>${this.currentUser.name}</b> (${this.currentUser.role.toUpperCase()})</p>
      </div>

      ${this.currentUser.role === 'guru' ? `
      <div class="card" style="border-left: 4px solid ${isDirSet ? 'var(--status-success)' : 'var(--accent-magenta)'};">
        <div class="card-title">📁 Folder Penyimpanan Lampiran Siswa</div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Atur folder proyek lokal agar lampiran (foto surat sakit) tersimpan otomatis di komputer Anda.
        </p>

        <div style="background: var(--primary-soft); border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 1rem; font-size: 0.85rem;">
          Status Folder: ${isDirSet ? `<b>✅ Aktif (${this.uploadsDirName})</b>` : '<b>⚠️ Belum diatur</b>'}
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary" id="btn-setup-uploads-dir">📂 ${isDirSet ? 'Ganti Folder' : 'Atur Folder Lampiran'}</button>
          ${isDirSet ? `<button class="btn btn-secondary" id="btn-clear-uploads-dir" style="color: var(--status-danger);">Hapus</button>` : ''}
        </div>
      </div>

      ${isDirSet ? `
      <div class="card">
        <div class="card-header-flex">
          <div class="card-title">📄 Daftar File Lampiran Tersimpan</div>
          <button class="btn btn-secondary" id="btn-refresh-lampiran-list" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">🔄 Refresh</button>
        </div>
        <div id="lampiran-file-list" style="font-size: 0.85rem; color: var(--text-muted);">Memuat file...</div>
      </div>
      ` : ''}
      ` : ''}

      ${this.currentUser.role === 'siswa' ? `
      <div class="card">
        <div class="card-title">🔐 Ubah Password</div>
        <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:1rem">Login awal tetap menggunakan NIS 4 digit. Setelah itu, password baru harus minimal 6 karakter. Wali kelas dapat membantu proses reset akun bila diperlukan.</p>
        <form id="student-password-form" autocomplete="off">
          <div class="form-group"><label class="form-label">Password Saat Ini</label><input class="form-input" type="password" id="current-student-password" autocomplete="current-password" required></div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Password Baru</label><input class="form-input" type="password" id="new-student-password" minlength="6" autocomplete="new-password" required></div>
            <div class="form-group"><label class="form-label">Ulangi Password Baru</label><input class="form-input" type="password" id="confirm-student-password" minlength="6" autocomplete="new-password" required></div>
          </div>
          <button class="btn btn-primary" type="submit">Simpan Password Baru</button>
        </form>
      </div>` : ''}

      <div class="card">
        <div class="card-title" style="color: var(--status-danger);">⚠️ Reset Prototipe</div>
        <button class="btn btn-secondary" id="btn-reset-prototype-data" style="color: var(--status-danger); margin-top: 0.5rem;">
          🔄 Reset Data Presensi ke Default
        </button>
      </div>
    `;
  },

  renderStudentProfileView() {
    const s = this.currentUser;
    const maps = s.homeLat != null && s.homeLng != null ? `https://www.google.com/maps?q=${s.homeLat},${s.homeLng}` : '';
    return `<div class="section-heading"><div><h2>👤 My Student Profile</h2><p>Keep family contacts and home location ready for school support and home visits.</p></div></div>
      <form id="student-profile-form" class="card">
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Student Name</label><input class="form-input" value="${s.name}" disabled></div>
          <div class="form-group"><label class="form-label">NIS</label><input class="form-input" value="${s.nis}" disabled></div>
          <div class="form-group"><label class="form-label">Parent / Guardian Name</label><input class="form-input" id="sp-parent-name" value="${s.parentName||''}"></div>
          <div class="form-group"><label class="form-label">Parent WhatsApp</label><input class="form-input" id="sp-parent-phone" value="${s.parentPhone||''}"></div>
          <div class="form-group"><label class="form-label">Emergency Phone</label><input class="form-input" id="sp-emergency" value="${s.emergencyPhone||''}"></div>
        </div>
        <div class="form-group"><label class="form-label">Home Address</label><textarea class="form-textarea" id="sp-address">${s.address||''}</textarea></div>
        <div class="card" style="background:var(--primary-soft);margin-top:.75rem">
          <div class="card-title">📍 Home Location</div>
          <p id="home-location-status" style="font-size:.85rem">${s.homeLat != null ? `Saved: ${s.homeLat.toFixed(6)}, ${s.homeLng.toFixed(6)}` : 'No location saved yet.'}</p>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button type="button" class="btn btn-secondary" id="btn-capture-home-location">Use Current Location</button>${maps?`<a class="btn btn-secondary" target="_blank" href="${maps}">Open Google Maps</a>`:''}</div>
        </div>
        <button class="btn btn-primary" type="submit" style="margin-top:1rem">💾 Save Student Profile</button>
      </form>`;
  },

  renderTeacherProfileView() {
    const p = this.teacherProfile;
    const avatar = p.photo ? `<img src="${p.photo}" alt="Teacher photo">` : `<span>👨‍🏫</span>`;
    return `
      <div class="section-heading"><div><h2>Teacher Workspace</h2><p>Your personal profile and teaching identity.</p></div></div>
      <div class="profile-layout">
        <div class="card teacher-profile-card">
          <div class="teacher-avatar">${avatar}</div>
          <h2>${p.name}</h2><p>${p.title}</p>
          <label class="btn btn-primary upload-profile">📷 Upload Profile Picture<input id="teacher-photo-input" type="file" accept="image/*" hidden></label>
        </div>
        <form id="teacher-profile-form" class="card profile-form">
          <div class="card-title">👤 Profile Details</div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="tp-name" value="${p.name}"></div>
            <div class="form-group"><label class="form-label">Role</label><input class="form-input" id="tp-title" value="${p.title}"></div>
            <div class="form-group"><label class="form-label">Main Subject</label><input class="form-input" id="tp-subject" value="${p.subject}"></div>
            <div class="form-group"><label class="form-label">WhatsApp</label><input class="form-input" id="tp-phone" value="${p.phone}"></div>
            <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="tp-email" value="${p.email}"></div>
          </div>
          <div class="form-group"><label class="form-label">Short Bio</label><textarea class="form-textarea" id="tp-bio">${p.bio}</textarea></div>
          <button class="btn btn-primary" type="submit">💾 Save Teacher Profile</button>
        </form>
      </div>`;
  },

  renderHomeVisitsView() {
    const statuses={urgent:'🔴 Urgent',scheduled:'🟡 Scheduled',completed:'🟢 Completed',planning:'⚪ Planning'};
    const completed=this.homeVisits.filter(v=>v.status==='completed').length;
    const editor=this.visitEditorOpen ? `
      <form id="home-visit-form" class="card visit-form-panel">
        <div class="card-header-flex"><div class="card-title">${this.editingVisitId?'✏️ Edit Home Visit':'➕ Plan a Home Visit'}</div><button type="button" class="btn btn-secondary" id="btn-cancel-visit">Close</button></div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Student</label><select class="form-select" id="hv-student" required><option value="">Choose a student...</option>${this.students.map(st=>`<option value="${st.id}">${st.name}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Visit Date</label><input class="form-input" type="date" id="hv-date" required></div>
          <div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="hv-status"><option value="planning">Planning</option><option value="scheduled">Scheduled</option><option value="urgent">Urgent</option><option value="completed">Completed</option></select></div>
          <div class="form-group"><label class="form-label">Reason</label><select class="form-select" id="hv-reason"><option>Family introduction</option><option>Attendance follow-up</option><option>Academic support</option><option>Behavior support</option><option>Health / welfare</option><option>Parent request</option><option>Other</option></select></div>
        </div>
        <div id="hv-family-preview" class="family-preview">Choose a student to auto-fill address, parent WhatsApp, and map details.</div>
        <div class="form-group"><label class="form-label">Visit Notes / Observation</label><textarea class="form-textarea" id="hv-notes" rows="4" placeholder="Purpose, observations, family discussion, and agreed actions..."></textarea></div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Follow-up Action</label><input class="form-input" id="hv-followup" placeholder="Example: check attendance again next Friday"></div>
          <div class="form-group"><label class="form-label">Documentation Photos <span style="color:var(--status-danger)">*</span></label><input class="form-input" id="hv-photos" type="file" accept="image/*" multiple required><small style="color:var(--text-muted)">At least one proof photo is required before completion.</small><div id="hv-photo-preview" class="visit-photo-strip"></div></div>
        </div>
        <label class="check-row"><input type="checkbox" id="hv-permission"> Photo permission confirmed with parent/guardian</label>
        <button class="btn btn-primary" type="submit">💾 Save Home Visit</button>
      </form>` : '';
    return `<div class="section-heading"><div><h2>🏡 Home Visit Center</h2><p>Choose a student, auto-fill family data, document the visit, and print official reports.</p></div><div class="heading-actions"><button class="btn btn-secondary" id="btn-print-all-visits">🖨 Print Summary</button><button class="btn btn-primary" id="btn-new-home-visit">+ New Visit</button></div></div>
      <div class="summary-strip"><div><b>${this.homeVisits.filter(v=>v.status==='urgent').length}</b><span>Urgent</span></div><div><b>${this.homeVisits.filter(v=>v.status==='scheduled').length}</b><span>Scheduled</span></div><div><b>${completed}</b><span>Completed</span></div><div><b>${completed}/${this.students.length}</b><span>Students Visited</span></div></div>
      ${editor}
      <div class="visit-grid">${this.homeVisits.map(v=>{const st=this.students.find(s=>s.id===v.studentId)||{}; const photos=v.photos||[]; return `<article class="card visit-card ${v.status}"><div class="visit-top"><span class="badge">${statuses[v.status]||v.status}</span><span>${v.scheduledDate||'No date'}</span></div><h3>${st.name||'Student'}</h3><p><b>Reason:</b> ${v.reason||'-'}</p><p>📍 ${st.address||v.address||'Address not completed'}</p><p>📱 ${st.parentPhone||v.parentPhone||'-'}</p><p class="visit-notes">${v.notes||'No notes yet.'}</p>${v.followUpAction?`<p><b>Follow-up:</b> ${v.followUpAction}</p>`:''}${photos.length?`<div class="visit-photo-strip">${photos.map((x,i)=>`<img src="${x}" alt="Visit photo ${i+1}">`).join('')}</div>`:''}<div class="visit-actions"><a class="btn btn-secondary" href="https://wa.me/62${(st.parentPhone||v.parentPhone||'').replace(/^0/,'').replace(/\D/g,'')}" target="_blank">💬 WhatsApp</a>${st.homeLat!=null?`<a class="btn btn-secondary" target="_blank" href="https://www.google.com/maps?q=${st.homeLat},${st.homeLng}">🗺 Maps</a>`:''}<button class="btn btn-secondary btn-print-visit" data-id="${v.id}">🖨 Report</button>${v.status==='completed'?`<span class="completed-chip">✓ Completed</span>`:`<button class="btn btn-primary btn-complete-visit" data-id="${v.id}">✓ Complete</button>`}</div></article>`}).join('')}</div>`;
  },

  printVisitReport(visitId=null) {
    const visits=visitId ? this.homeVisits.filter(v=>v.id===visitId) : this.homeVisits;
    const rows=visits.map(v=>{const st=this.students.find(s=>s.id===v.studentId)||{};return `<section class="report"><h2>${st.name||'Student'}</h2><table><tr><th>NIS</th><td>${st.nis||'-'}</td><th>Date</th><td>${v.scheduledDate||'-'}</td></tr><tr><th>Address</th><td colspan="3">${st.address||v.address||'-'}</td></tr><tr><th>Parent WhatsApp</th><td>${st.parentPhone||v.parentPhone||'-'}</td><th>Status</th><td>${v.status||'-'}</td></tr><tr><th>Reason</th><td colspan="3">${v.reason||'-'}</td></tr><tr><th>Observation</th><td colspan="3">${v.notes||'-'}</td></tr><tr><th>Follow-up</th><td colspan="3">${v.followUpAction||'No follow-up recorded'}</td></tr></table>${(v.photos||[]).length?`<div class="photos">${v.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}<div class="sign"><div>Parent / Guardian<br><br><br>__________________</div><div>Homeroom Teacher<br><br><br>${this.teacherProfile.name}</div></div></section>`}).join('');
    const w=window.open('','_blank'); if(!w)return alert('Please allow pop-ups to print reports.');
    w.document.write(`<!doctype html><html><head><title>Home Visit Report</title><style>body{font-family:Arial,sans-serif;color:#222;margin:24px}.header{text-align:center;border-bottom:3px solid #581c87;margin-bottom:20px}.report{page-break-after:always;margin-bottom:35px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #777;padding:8px;text-align:left}th{background:#f3e8ff}.photos{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.photos img{width:220px;height:150px;object-fit:cover;border:1px solid #999}.sign{display:flex;justify-content:space-between;text-align:center;margin-top:45px}.no-print{margin-bottom:18px}@media print{.no-print{display:none}}</style></head><body><button class="no-print" onclick="print()">Print / Save PDF</button><div class="header"><h1>MIPHA COMPANION</h1><p>Home Visit Documentation — X DKV F</p></div>${rows||'<p>No visits recorded.</p>'}</body></html>`); w.document.close();
  },

  addAssignmentFromPrompt() {
    if (!this.currentUser || this.currentUser.role !== 'guru') return;
    const input = document.getElementById('assignment-title');
    if (input) {
      input.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  readFileAsDataURL(file) {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || null);
      reader.onerror = () => reject(new Error('Tidak bisa membaca lampiran tugas.'));
      reader.readAsDataURL(file);
    });
  },

  async submitAssignment(assignmentId, note = '', file = null) {
    if (!this.currentUser) return;
    const assignment = this.assignments.find((item) => item.id === assignmentId);
    if (!assignment) return;
    const studentId = this.currentUser.id;
    const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
    const existingIndex = submissions.findIndex((item) => item.studentId === studentId);
    const attachmentName = file ? file.name : null;
    const cloudFile = file ? await this.uploadCloudFile(file, 'pengumpulan-tugas', studentId, {
      type: assignment.subject || 'tugas',
      recordId: assignmentId
    }) : null;
    const submission = {
      studentId,
      studentName: this.currentUser.name,
      submittedAt: new Date().toISOString(),
      note: String(note || '').trim(),
      attachmentName,
      attachmentData: cloudFile ? cloudFile.url : null,
      attachmentPath: cloudFile ? cloudFile.path : null,
      attachmentType: cloudFile ? cloudFile.type : null,
      attachmentSize: cloudFile ? cloudFile.size : null
    };
    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }
    assignment.submissions = submissions;
    assignment.submittedBy = submissions.map((item) => item.studentId);
    assignment.submitted = submissions.length;
    if (window.SupabaseBackend) await SupabaseBackend.writeAssignmentSubmission(assignmentId, submission);
    this.logAudit(`Mengumpulkan tugas: ${assignment.title}`);
    this.activeAssignmentSubmissionId = null;
    this.saveState();
    this.render();
  },

  renderAssignmentsView() {
    const isGuru = this.currentUser?.role === 'guru';
    const studentId = this.currentUser?.id;
    return `<div class="section-heading"><div><h2>📚 Assignment Center</h2><p>Buat tugas, lampirkan instruksi, dan kelola pengumpulan tugas siswa.</p></div>${isGuru ? '<button class="btn btn-primary" id="btn-new-assignment">+ New Assignment</button>' : ''}</div>
      ${isGuru ? `<form id="assignment-form" class="card" style="margin-bottom:1rem;padding:1rem;display:grid;gap:0.75rem;">
        <div class="card-title">➕ Tambah Tugas Baru</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:0.75rem;">
          <div><label class="form-label">Judul Tugas</label><input class="form-input" id="assignment-title" required></div>
          <div><label class="form-label">Mata Pelajaran</label><input class="form-input" id="assignment-subject" value="${this.teacherProfile.subject || 'Dasar Animasi'}"></div>
          <div><label class="form-label">Deadline</label><input class="form-input" id="assignment-due-date" type="date"></div>
        </div>
        <div><label class="form-label">Deskripsi Tugas</label><textarea class="form-textarea" id="assignment-description" rows="3" placeholder="Jelaskan instruksi, target, dan kriteria penilaian..."></textarea></div>
        <div><label class="form-label">Lampiran (opsional)</label><input class="form-input" id="assignment-attachment" type="file" accept="image/*,.pdf,.doc,.docx,.txt"></div>
        <button class="btn btn-primary" type="submit" style="width:max-content;">💾 Simpan Tugas</button>
      </form>` : ''}
      <div class="assignment-list">${this.assignments.map((assignment) => {
        const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
        const submittedCount = submissions.length || Number(assignment.submitted || 0);
        const pct = assignment.total ? Math.round((submittedCount / assignment.total) * 100) : 0;
        const mySubmission = studentId ? submissions.find((item) => item.studentId === studentId) : null;
        const hasAttachment = Boolean(assignment.attachmentName || assignment.attachmentData);
        return `<article class="card assignment-card">
          <div style="display:flex;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
            <div>
              <span class="badge badge-info">${assignment.subject || 'Tugas'}</span>
              <h3 style="margin:0.4rem 0 0.25rem;">${assignment.title}</h3>
              ${assignment.description ? `<p style="margin:0 0 0.4rem;color:var(--text-main);">${assignment.description}</p>` : ''}
              <small>Deadline: ${assignment.dueDate || '-'}</small>
              ${hasAttachment ? `<div style="margin-top:0.4rem;font-size:0.8rem;">📎 Lampiran: <button type="button" class="btn-link btn-preview-attachment" data-attachment="${assignment.attachmentData || ''}" data-path="${assignment.attachmentPath || ''}" data-name="${assignment.attachmentName || 'lampiran'}">${assignment.attachmentName || 'Buka lampiran'}</button></div>` : ''}
            </div>
            <div class="assignment-progress" style="min-width:140px;">
              <b>${submittedCount}/${assignment.total || 0}</b>
              <span>${isGuru ? 'terkumpul' : 'status'}</span>
              <div class="progress"><i style="width:${pct}%"></i></div>
              <strong>${Math.max((assignment.total || 0) - submittedCount, 0)} ${isGuru ? 'belum' : 'tersisa'}</strong>
              ${!isGuru ? `<div style="margin-top:0.45rem;">${mySubmission ? '<span class="badge badge-success">✅ Terkumpul</span>' : '<span class="badge badge-warning">⏳ Belum dikumpulkan</span>'}</div>` : ''}
            </div>
          </div>
          ${!isGuru ? (this.activeAssignmentSubmissionId === assignment.id ? `<form class="assignment-submit-form" data-assignment-id="${assignment.id}" style="margin-top:0.8rem;display:grid;gap:0.6rem;">
            <textarea class="form-textarea" id="assignment-note-${assignment.id}" rows="3" placeholder="Catatan tugas (opsional)"></textarea>
            <input class="form-input" id="assignment-file-${assignment.id}" type="file" accept="image/*,.pdf,.doc,.docx,.txt">
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
              <button class="btn btn-primary" type="submit">📤 Kirim Tugas</button>
              <button class="btn btn-secondary" type="button" data-cancel-submission="${assignment.id}">Batal</button>
            </div>
          </form>` : `<button class="btn btn-primary btn-open-submit-assignment" data-assignment-id="${assignment.id}" style="margin-top:0.7rem;">📤 ${mySubmission ? 'Perbarui' : 'Kumpulkan'} Tugas</button>`) : ''}
          ${isGuru ? `<button class="btn btn-secondary btn-share-assignment" data-id="${assignment.id}" style="margin-top:.6rem">📱 Share to WhatsApp</button>` : ''}
          ${isGuru && submissions.length ? `<div style="margin-top:0.75rem;font-size:0.78rem;color:var(--text-muted);">
            <div style="font-weight:700;color:var(--primary-dark);margin-bottom:0.35rem;">Pengumpulan (${submissions.length})</div>
            ${submissions.slice(0, 4).map((item) => `<div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:center;margin-top:0.25rem;">${item.studentName || 'Siswa'}${item.attachmentName ? ` <span style="color:var(--accent-magenta);">• ${item.attachmentName}</span>` : ''}${item.attachmentData ? `<button class="btn btn-secondary btn-preview-attachment" data-attachment="${item.attachmentData}" data-path="${item.attachmentPath || ''}" data-name="${item.attachmentName || 'lampiran'}" style="padding:0.2rem 0.45rem;font-size:0.7rem;">Preview</button>` : ''}</div>`).join('')}
          </div>` : ''}
        </article>`;
      }).join('')}</div>`;
  },

  renderAIAssistantView() {
    return `<div class="section-heading"><div><h2>🤖 AI Teacher Assistant</h2><p>Prototype tools for drafting teacher documents. Generated text must still be reviewed by the teacher.</p></div></div>
      <div class="ai-tools">${[['Weekly Class Summary','Summarize attendance, assignments, and students needing attention.'],['Home Visit Report','Turn short visit notes into a structured report.'],['Parent Meeting Brief','Prepare strengths, concerns, and suggested follow-up.'],['Student Report Comment','Draft a balanced semester comment.'],['Announcement Writer','Rewrite a school announcement clearly.']].map((x,i)=>`<button class="card ai-tool" data-ai="${i}"><span>✨</span><b>${x[0]}</b><small>${x[1]}</small></button>`).join('')}</div>
      <div class="card"><div class="card-title">AI Workspace</div><textarea class="form-textarea" id="ai-input" rows="6" placeholder="Add teacher notes or key facts here..."></textarea><button class="btn btn-primary" id="btn-generate-ai">Generate Draft</button><div id="ai-output" class="ai-output">Choose a tool, add notes, then generate a draft.</div></div>`;
  },

  setupViewEvents() {
    if (window.SupabaseBackend) SupabaseBackend.hydrateProtectedImages(document);
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) themeBtn.onclick = () => this.cycleTheme();
    const teacherPhoto = document.getElementById('teacher-photo-input');
    if (teacherPhoto) teacherPhoto.onchange = async () => { const f=teacherPhoto.files[0]; if(!f)return; try { const uploaded=await this.uploadCloudFile(f,'profiles',this.currentUser.id); this.teacherProfile.photo=uploaded.url; this.teacherProfile.photoPath=uploaded.path; this.saveState(); this.render(); } catch(error) { alert('Gagal mengunggah foto: '+error.message); } };
    const profileForm=document.getElementById('teacher-profile-form');
    if(profileForm) profileForm.onsubmit=e=>{e.preventDefault(); this.teacherProfile={...this.teacherProfile,name:document.getElementById('tp-name').value,title:document.getElementById('tp-title').value,subject:document.getElementById('tp-subject').value,phone:document.getElementById('tp-phone').value,email:document.getElementById('tp-email').value,bio:document.getElementById('tp-bio').value}; this.currentUser.name=this.teacherProfile.name; this.saveState(); alert('✅ Teacher profile saved.'); this.render();};
    const studentProfileForm=document.getElementById('student-profile-form');
    if(studentProfileForm) studentProfileForm.onsubmit=e=>{e.preventDefault(); const st=this.students.find(x=>x.id===this.currentUser.id); if(!st)return; st.parentName=document.getElementById('sp-parent-name').value.trim(); st.parentPhone=document.getElementById('sp-parent-phone').value.trim(); st.emergencyPhone=document.getElementById('sp-emergency').value.trim(); st.address=document.getElementById('sp-address').value.trim(); Object.assign(this.currentUser,st); this.saveState(); alert('✅ Student profile saved.'); this.render();};
    const captureHome=document.getElementById('btn-capture-home-location');
    if(captureHome) captureHome.onclick=()=>{ if(!navigator.geolocation)return alert('Location is not supported.'); captureHome.disabled=true; captureHome.textContent='Getting location...'; navigator.geolocation.getCurrentPosition(pos=>{const st=this.students.find(x=>x.id===this.currentUser.id); st.homeLat=pos.coords.latitude;st.homeLng=pos.coords.longitude;Object.assign(this.currentUser,st);this.saveState();alert('✅ Home location saved.');this.render();},err=>{captureHome.disabled=false;captureHome.textContent='Use Current Location';alert('Could not save location: '+err.message);},{enableHighAccuracy:true,timeout:10000});};
    document.querySelectorAll('.btn-share-assignment').forEach(btn=>btn.onclick=()=>{const a=this.assignments.find(x=>x.id===btn.dataset.id);if(!a)return;const text=`📚 X DKV F - ${a.subject}%0A${a.title}%0ADeadline: ${a.dueDate}%0A${a.description}%0A%0AOpen MIPHA COMPANION for details.`;window.open('https://wa.me/?text='+encodeURIComponent(decodeURIComponent(text)),'_blank');});
    document.querySelectorAll('.btn-submit-assignment').forEach(btn=>btn.onclick=()=>this.submitAssignment(btn.dataset.assignmentId));
    document.querySelectorAll('.btn-open-submit-assignment').forEach(btn=>btn.onclick=()=>{this.activeAssignmentSubmissionId = btn.dataset.assignmentId; this.render();});
    document.querySelectorAll('[data-cancel-submission]').forEach(btn=>btn.onclick=()=>{this.activeAssignmentSubmissionId = null; this.render();});
    document.querySelectorAll('.btn-preview-attachment').forEach(btn=>btn.onclick=()=>{
      const name = btn.dataset.name || 'lampiran';
      const data = btn.dataset.attachment;
      if (!data) return;
      if (btn.dataset.path) {
        SupabaseBackend.downloadFile(btn.dataset.path, name).catch(error => alert('Gagal membuka lampiran: '+error.message));
        return;
      }
      const win = window.open('', '_blank');
      if (!win) return alert('Izinkan popup untuk melihat lampiran tugas.');
      win.document.write(`<html><body style="font-family:sans-serif;padding:20px;"><h3>${name}</h3><p>Preview lampiran tugas</p><img src="${data}" alt="${name}" style="max-width:100%;border-radius:8px;" /></body></html>`);
      win.document.close();
    });
    document.querySelectorAll('.btn-add-assignment').forEach(btn=>btn.onclick=()=>this.addAssignmentFromPrompt());
    document.querySelectorAll('.btn-complete-visit').forEach(b=>b.onclick=()=>{const v=this.homeVisits.find(x=>x.id===b.dataset.id); if(!v)return; if(!(v.photos||[]).length){alert('⚠️ Upload at least one proof photo before marking this visit complete.'); this.visitEditorOpen=true; this.editingVisitId=v.id; this.render(); return;} v.status='completed';v.followUp=false;this.saveState();this.render();});
    document.querySelectorAll('.btn-print-visit').forEach(b=>b.onclick=()=>this.printVisitReport(b.dataset.id));
    const printAll=document.getElementById('btn-print-all-visits'); if(printAll)printAll.onclick=()=>this.printVisitReport();
    const newVisit=document.getElementById('btn-new-home-visit'); if(newVisit)newVisit.onclick=()=>{this.visitEditorOpen=true;this.editingVisitId=null;this.render();};
    const cancelVisit=document.getElementById('btn-cancel-visit'); if(cancelVisit)cancelVisit.onclick=()=>{this.visitEditorOpen=false;this.render();};
    const studentPicker=document.getElementById('hv-student'); if(studentPicker)studentPicker.onchange=()=>{const st=this.students.find(x=>x.id===studentPicker.value);const p=document.getElementById('hv-family-preview');if(st&&p)p.innerHTML=`<b>${st.name}</b><br>📍 ${st.address||'Home address not completed'}<br>📱 ${st.parentPhone||'Parent WhatsApp not completed'}<br>${st.homeLat!=null?'✅ Home GPS saved':'⚠️ Home GPS not saved yet'}`;};
    const photoInput=document.getElementById('hv-photos'); if(photoInput)photoInput.onchange=()=>{const preview=document.getElementById('hv-photo-preview');if(!preview)return;preview.innerHTML='';[...photoInput.files].slice(0,4).forEach(file=>{const r=new FileReader();r.onload=()=>{const img=document.createElement('img');img.src=r.result;img.alt='Photo preview';preview.appendChild(img)};r.readAsDataURL(file);});}; const visitForm=document.getElementById('home-visit-form'); if(visitForm)visitForm.onsubmit=async e=>{e.preventDefault();const st=this.students.find(x=>x.id===document.getElementById('hv-student').value);if(!st)return alert('Choose a student.');const files=[...document.getElementById('hv-photos').files];const desiredStatus=document.getElementById('hv-status').value;if(desiredStatus==='completed'&&!files.length)return alert('⚠️ A proof photo is required before saving a completed visit.');if(files.length&&!document.getElementById('hv-permission').checked)return alert('Confirm parent/guardian photo permission first.');try{const uploaded=await Promise.all(files.slice(0,4).map(f=>this.uploadCloudFile(f,'home-visits',st.id)));const photos=uploaded.map(x=>x.url);const photoPaths=uploaded.map(x=>x.path);this.homeVisits.unshift({id:'hv_'+Date.now(),studentId:st.id,status:document.getElementById('hv-status').value,scheduledDate:document.getElementById('hv-date').value,address:st.address||'Address not completed',parentPhone:st.parentPhone||'',reason:document.getElementById('hv-reason').value,notes:document.getElementById('hv-notes').value.trim(),followUpAction:document.getElementById('hv-followup').value.trim(),followUp:Boolean(document.getElementById('hv-followup').value.trim()),photos,photoPaths,photoPermission:document.getElementById('hv-permission').checked,createdAt:new Date().toISOString()});this.visitEditorOpen=false;this.saveState();alert('✅ Home visit saved.');this.render();}catch(error){alert('Gagal mengunggah dokumentasi: '+error.message);}};
    const newAssignment=document.getElementById('btn-new-assignment'); if(newAssignment)newAssignment.onclick=()=>this.addAssignmentFromPrompt();
    const assignmentForm=document.getElementById('assignment-form');
    if(assignmentForm) assignmentForm.onsubmit=async (e)=>{
      e.preventDefault();
      const title=document.getElementById('assignment-title').value.trim();
      const subject=document.getElementById('assignment-subject').value.trim();
      const dueDate=document.getElementById('assignment-due-date').value;
      const description=document.getElementById('assignment-description').value.trim();
      const attachmentFile=document.getElementById('assignment-attachment').files[0];
      if(!title){ alert('Judul tugas wajib diisi.'); return; }
      const cloudFile = attachmentFile ? await this.uploadCloudFile(attachmentFile,'assignments',this.currentUser.id) : null;
      const assignment={id:`as_${Date.now()}`,title,subject:subject||'Dasar Animasi',dueDate,description,submitted:0,total:this.students.length||0,submittedBy:[],submissions:[],attachmentName:cloudFile?cloudFile.name:null,attachmentData:cloudFile?cloudFile.url:null,attachmentPath:cloudFile?cloudFile.path:null};
      this.assignments.unshift(assignment);
      this.logAudit(`Membuat tugas: ${assignment.title}`);
      this.saveState();
      this.render();
    };
    document.querySelectorAll('.assignment-submit-form').forEach((form)=>{
      form.onsubmit=async (e)=>{
        e.preventDefault();
        const assignmentId=form.dataset.assignmentId;
        const note=document.getElementById(`assignment-note-${assignmentId}`)?.value || '';
        const file=document.getElementById(`assignment-file-${assignmentId}`)?.files?.[0] || null;
        await this.submitAssignment(assignmentId, note, file);
      };
    });
    let aiMode=0; document.querySelectorAll('.ai-tool').forEach(b=>b.onclick=()=>{document.querySelectorAll('.ai-tool').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');aiMode=Number(b.dataset.ai);});
    const gen=document.getElementById('btn-generate-ai'); if(gen)gen.onclick=()=>{const notes=document.getElementById('ai-input').value.trim()||'No additional notes provided.'; const titles=['Weekly Class Summary','Home Visit Report','Parent Meeting Brief','Student Report Comment','School Announcement']; const templates=[`Weekly overview: Attendance and assignment records have been reviewed. Key teacher notes: ${notes} Recommended action: follow up with students showing repeated absence or missing work.`,`Home visit report: The visit was conducted to understand the student’s family and learning conditions. Observation notes: ${notes} Follow-up should be agreed with the family and documented by the homeroom teacher.`,`Parent meeting brief: Strengths and progress should be discussed first, followed by concerns supported by records. Teacher notes: ${notes} Agree on one clear follow-up action and review date.`,`Student comment draft: The student continues to develop academically and socially. Based on teacher observations: ${notes} Continued encouragement and consistent follow-up are recommended.`,`Announcement draft: Dear students and parents, ${notes} Please read the information carefully and contact the homeroom teacher if clarification is needed.`]; document.getElementById('ai-output').innerHTML=`<b>${titles[aiMode]}</b><p>${templates[aiMode]}</p><small>Prototype draft — review before use.</small>`;};

    const btnSetupDir = document.getElementById('btn-setup-uploads-dir');
    if (btnSetupDir) btnSetupDir.onclick = () => this.setupUploadsDir();

    const btnClearDir = document.getElementById('btn-clear-uploads-dir');
    if (btnClearDir) btnClearDir.onclick = async () => {
      if (confirm('Hapus pengaturan folder lampiran?')) await this.clearUploadsDir();
    };

    const btnRefreshList = document.getElementById('btn-refresh-lampiran-list');
    if (btnRefreshList) btnRefreshList.onclick = () => this.renderLampiranList();
    if (document.getElementById('lampiran-file-list')) this.renderLampiranList();

    const studentPasswordForm = document.getElementById('student-password-form');
    if (studentPasswordForm) studentPasswordForm.onsubmit = async (e) => {
      e.preventDefault();
      const current = document.getElementById('current-student-password').value;
      const next = document.getElementById('new-student-password').value;
      const confirmNext = document.getElementById('confirm-student-password').value;
      if (next.length < 6) return alert('Password baru minimal 6 karakter.');
      if (next !== confirmNext) return alert('Konfirmasi password tidak cocok.');
      try {
        await SupabaseBackend.changeOwnPassword(current, next, this.currentUser.nis || this.currentUser.username, this.currentUser.role);
        alert('✅ Password Supabase berhasil diperbarui.');
        studentPasswordForm.reset();
      } catch (error) {
        console.error(error);
        alert(error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' ? 'Password saat ini salah.' : 'Gagal mengubah password: ' + error.message);
      }
    };

    document.querySelectorAll('.btn-reset-student-password').forEach(btn => btn.onclick = () => {
      const student = this.students.find(s => s.id === btn.dataset.studentId);
      if (!student) return;
      alert(`Reset password Supabase untuk ${student.name} memerlukan Supabase Admin API / server function. Untuk pilot gratis, lakukan reset akun dari Supabase Dashboard → Authentication → Users. Password siswa tidak dapat dilihat oleh wali kelas.`);
    });

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.onclick = () => this.logout();

    const quickCheckout = document.getElementById('btn-quick-checkout');
    if (quickCheckout) {
      quickCheckout.onclick = () => {
        const res = this.performCheckout();
        if (res.success) alert(`✅ Berhasil Check-out Pulang pukul ${res.time}`);
        this.render();
      };
    }

    const quickHome = document.getElementById('btn-quick-home');
    if (quickHome) {
      quickHome.onclick = () => {
        const res = this.confirmHomeArrival();
        if (res.success) alert(`✅ Berhasil Konfirmasi Sampai Rumah pukul ${res.time}`);
        this.render();
      };
    }

    const btnGps = document.getElementById('btn-do-gps-checkin');
    if (btnGps) {
      btnGps.onclick = async () => {
        btnGps.disabled = true;
        const original = btnGps.textContent;
        btnGps.textContent = 'Checking location...';
        const res = await this.performGPSCheckin();
        btnGps.disabled = false;
        btnGps.textContent = original;
        const resultEl = document.getElementById('checkin-gps-result');
        if (resultEl) {
          if (res.success) {
            resultEl.style.color = 'var(--status-success)';
            resultEl.innerHTML = `📍 Posisi: <b>${res.latitude?.toFixed(6) || '-'}, ${res.longitude?.toFixed(6) || '-'}</b><br>Nearest: <b>${res.campusName || '-'}</b> • Jarak: <b>${res.distance}m</b> • Akurasi GPS: <b>${res.gpsAccuracy ? Math.round(res.gpsAccuracy) + 'm' : '-'}</b> • <b>Inside Radius</b>`;
            alert(`✅ Check-in GPS Berhasil! (${res.distance}m dari sekolah) Jam: ${res.time}`);
            this.switchView('dashboard');
          } else {
            resultEl.style.color = 'var(--status-danger)';
            const nearestInfo = res.nearest ? `${res.nearest.distance}m dari ${res.nearest.campus.name}` : '';
            resultEl.innerHTML = `⚠️ ${res.message} ${nearestInfo}`;
            alert('❌ ' + res.message);
          }
        } else {
          if (res.success) {
            alert(`✅ Check-in GPS Berhasil! (${res.distance}m dari sekolah) Jam: ${res.time}`);
            this.switchView('dashboard');
          } else {
            alert('❌ ' + res.message);
          }
        }
      };
    }

    const btnPin = document.getElementById('btn-do-pin-checkin');
    if (btnPin) {
      btnPin.onclick = async () => {
        const pinInput = document.getElementById('input-pin-backup').value;
        const res = await this.performCheckin('nis', 0, pinInput);
        if (res && res.success) {
          alert(`✅ Check-in NIS Berhasil! Jam: ${res.time}`);
          this.switchView('dashboard');
        } else if (res && res.message) {
          alert(res.message);
        }
      };
    }

    const formLeave = document.getElementById('form-submit-leave');
    if (formLeave) {
      formLeave.onsubmit = async (e) => {
        e.preventDefault();
        const parentPhoneInput = document.getElementById('leave-parent-phone');
        const parentPhone = String(parentPhoneInput?.value || '').trim();
        const parentPhoneDigits = parentPhone.replace(/\D/g, '');
        if (parentPhoneDigits.length < 10 || parentPhoneDigits.length > 15) {
          alert('⚠️ Masukkan nomor WhatsApp orang tua/wali yang valid (10–15 angka).');
          parentPhoneInput?.focus();
          return;
        }
        const fileInput = document.getElementById('leave-file');
        const file = fileInput ? fileInput.files[0] : null;

        const doSubmit = async (cloudFile, archiveFile, requestData) => {
          let attachmentSaved = null;
          if (file && this.uploadsDir) {
            attachmentSaved = await this.saveFileToUploads(file);
          }

          const data = {
            ...requestData,
            parentPhone,
            attachmentName: file ? file.name : null,
            attachmentData: cloudFile ? cloudFile.url : null,
            attachmentPath: cloudFile ? cloudFile.path : null,
            attachmentType: cloudFile ? cloudFile.type : null,
            attachmentSize: cloudFile ? cloudFile.size : null,
            archivePath: archiveFile ? archiveFile.path : null,
            attachmentSaved: attachmentSaved
          };
          this.submitLeaveRequest(data);

          const savedMsg = attachmentSaved ? `\n📁 File tersimpan di folder lampiran/` : '';
          alert('✅ Pengajuan izin berhasil dikirim! Menunggu persetujuan Wali Kelas.' + savedMsg);
          this.render();
        };

        try {
          const requestData = {
            id: `lv_${Date.now()}`,
            type: document.getElementById('leave-type').value,
            startDate: document.getElementById('leave-start').value,
            endDate: document.getElementById('leave-end').value,
            reason: document.getElementById('leave-reason').value.trim(),
            submittedAt: new Date().toISOString()
          };
          const folderMeta = { date: requestData.startDate, type: requestData.type, recordId: requestData.id };
          const cloudFile = file ? await this.uploadCloudFile(file, 'pengajuan-izin', this.currentUser.id, folderMeta) : null;
          const archiveData = {
            ...requestData,
            studentId: this.currentUser.id,
            studentName: this.currentUser.name,
            parentPhone,
            attachmentName: file ? file.name : null,
            status: 'pending'
          };
          const archiveBlob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
          const archiveUpload = new File([archiveBlob], 'data-pengajuan.json', { type: 'application/json' });
          const archiveFile = await this.uploadCloudFile(archiveUpload, 'pengajuan-izin', this.currentUser.id, folderMeta);
          await doSubmit(cloudFile, archiveFile, requestData);
        } catch (error) {
          alert('Gagal mengarsipkan pengajuan izin: ' + error.message);
        }
      };
    }

    document.querySelectorAll('.btn-open-student-modal').forEach(btn => {
      btn.onclick = () => {
        this.selectedStudentModal = btn.getAttribute('data-student-id');
        this.render();
      };
    });
    document.querySelectorAll('.btn-edit-attendance').forEach(btn => {
      btn.onclick = () => {
        this.selectedAttendanceEditStudentId = btn.getAttribute('data-student-id');
        this.render();
      };
    });

    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
      btnCloseModal.onclick = () => {
        this.selectedStudentModal = null;
        this.render();
      };
    }
    const btnCloseAttendanceModal = document.getElementById('btn-close-attendance-modal');
    if (btnCloseAttendanceModal) {
      btnCloseAttendanceModal.onclick = () => {
        this.selectedAttendanceEditStudentId = null;
        this.render();
      };
    }

    const btnSaveModalNotes = document.getElementById('btn-save-modal-notes');
    if (btnSaveModalNotes) {
      btnSaveModalNotes.onclick = () => {
        const notes = document.getElementById('modal-teacher-notes').value;
        this.saveTeacherStudentNotes(this.selectedStudentModal, notes);
        this.selectedStudentModal = null;
        this.render();
      };
    }
    const formEditAttendance = document.getElementById('form-edit-attendance');
    if (formEditAttendance) {
      formEditAttendance.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const studentId = this.selectedAttendanceEditStudentId;
        if (!studentId) return;
        const status = document.getElementById('edit-attendance-status').value;
        const checkinTime = document.getElementById('edit-attendance-checkin').value.trim();
        const checkinMethod = document.getElementById('edit-attendance-method').value.trim();
        const distanceMeters = Number(document.getElementById('edit-attendance-distance').value) || null;
        const campusName = document.getElementById('edit-attendance-campus').value.trim();
        const checkoutTime = document.getElementById('edit-attendance-checkout').value.trim();
        const homeConfirmed = !!document.getElementById('edit-attendance-home-confirmed').checked;
        const homeArrivalTime = document.getElementById('edit-attendance-home-arrival').value.trim();
        this.updateAttendanceRecord(studentId, {
          status,
          checkinTime: checkinTime || null,
          checkinMethod: checkinMethod || null,
          distanceMeters,
          campusName: campusName || null,
          checkoutTime: checkoutTime || null,
          homeConfirmed,
          homeArrivalTime: homeConfirmed ? (homeArrivalTime || null) : null
        });
        this.selectedAttendanceEditStudentId = null;
        this.render();
      });
    }

    document.querySelectorAll('.btn-save-student-grade').forEach(btn => {
      btn.onclick = async () => {
        const studentId = btn.getAttribute('data-student-id');
        const sikapSelect = document.querySelector(`.select-sikap-${studentId}`);
        const capaianInput = document.querySelector(`.input-capaian-${studentId}`);
        const panel = document.querySelector(`.grade-entry-panel[data-student-id="${studentId}"]`);
        const entries = panel ? [...panel.querySelectorAll('.grade-entry')].map(row => ({
          id: row.dataset.entryId,
          type: row.querySelector('.grade-entry-type').value,
          title: row.querySelector('.grade-entry-title').value,
          date: row.querySelector('.grade-entry-date').value,
          score: row.querySelector('.grade-entry-score').value,
          weight: row.querySelector('.grade-entry-weight').value
        })) : [];
        if (panel && sikapSelect) {
          btn.disabled = true;
          await this.saveStudentGrade(studentId, this.selectedGradeSubject, entries, sikapSelect.value, capaianInput?.value || '');
          btn.disabled = false;
        }
      };
    });
    document.querySelectorAll('.btn-toggle-grade-detail').forEach(btn => {
      btn.onclick = () => {
        const row = document.querySelector(`.grade-detail-${btn.dataset.studentId}`);
        if (row) row.hidden = !row.hidden;
      };
    });
    document.querySelectorAll('.btn-add-grade-entry').forEach(btn => {
      btn.onclick = () => {
        const list = btn.closest('.grade-entry-panel')?.querySelector('.grade-entry-list');
        if (list) list.insertAdjacentHTML('beforeend', this.renderGradeEntryInput(btn.dataset.studentId));
      };
    });
    document.querySelectorAll('.grade-entry-list').forEach(list => {
      list.onclick = event => {
        const remove = event.target.closest('.btn-remove-grade-entry');
        if (remove) remove.closest('.grade-entry')?.remove();
      };
    });
    const gradeSubject = document.getElementById('grade-subject');
    if (gradeSubject) gradeSubject.onchange = () => { this.selectedGradeSubject = gradeSubject.value; this.render({ silent: true }); };
    const gradeSemester = document.getElementById('grade-semester');
    if (gradeSemester) gradeSemester.onchange = () => { this.selectedGradeSemester = gradeSemester.value; this.render({ silent: true }); };

    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) btnExportCSV.onclick = () => this.exportCSV();
    const btnExportXLSX = document.getElementById('btn-export-xlsx');
    if (btnExportXLSX) btnExportXLSX.onclick = () => this.exportOfficialAttendanceXLSX();

    const btnImportCsv = document.getElementById('btn-import-csv');
    const importCsvInput = document.getElementById('import-csv-input');
    if (btnImportCsv && importCsvInput) {
      btnImportCsv.onclick = () => importCsvInput.click();
      importCsvInput.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          await this.importSpreadsheet(file);
          alert('✅ Data file berhasil diimpor. Silakan periksa kembali data presensi di halaman laporan.');
        } catch (error) {
          console.error('Import file error:', error);
          alert(`⚠️ Gagal mengimpor data: ${error.message || 'Pastikan file dalam format yang benar.'}`);
        }
      };
    }

    const btnMatrixRefresh = document.getElementById('btn-matrix-refresh');
    if (btnMatrixRefresh) {
      btnMatrixRefresh.onclick = () => {
        const selMonth = document.getElementById('sel-matrix-month');
        const selYear = document.getElementById('sel-matrix-year');
        if (selMonth) this.matrixMonth = parseInt(selMonth.value);
        if (selYear) this.matrixYear = parseInt(selYear.value);
        this.render();
      };
    }

    const btnReset = document.getElementById('btn-reset-prototype-data');
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm('Reset seluruh data presensi prototipe ke default?')) {
          localStorage.clear();
          this.loadState();
          this.render();
          alert('Data berhasil di-reset.');
        }
      };
    }
  },

  exportCSV() {
    let csv = "No,NIS,Nama Siswa,Kelas,Status,Jam Checkin,Campus,Jarak GPS (m),Check-out,Sampai Rumah\n";
    this.students.forEach((st, idx) => {
      const a = this.attendance[st.id] || {};
      const campus = a.campusName || '-';
      csv += `"${idx + 1}","${st.nis || '-'}","${st.name}","${st.class}","${a.status || 'BELUM_CHECKIN'}","${a.checkinTime || '-'}","${campus}","${a.distanceMeters || '-'}","${a.checkoutTime || '-'}","${a.homeConfirmed ? 'YA' : 'BELUM'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const netlifylink = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Presensi_X_DKV_F_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async loadExcelJSLibrary() {
    if (typeof window === 'undefined') return Promise.reject(new Error('No window object'));
    if (typeof window.ExcelJS !== 'undefined') return Promise.resolve(window.ExcelJS);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
      script.async = true;
      script.onload = () => {
        const exceljs = window.ExcelJS || (window.ExcelJS && window.ExcelJS.default) || window.exceljs || window.exceljs?.default;
        if (exceljs) return resolve(exceljs);
        reject(new Error('ExcelJS loaded but window.ExcelJS is missing'));
      };
      script.onerror = (e) => reject(new Error('Failed to load ExcelJS library'));
      document.head.appendChild(script);
    });
  },

  getAcademicYearLabel(year, month) {
    const startYear = month >= 6 ? year : year - 1;
    return `${startYear}/${startYear + 1}`;
  },

  async exportOfficialAttendanceXLSX() {
    try {
      const ExcelJS = await this.loadExcelJSLibrary();
      const now = new Date();
      const selYear = this.matrixYear || now.getFullYear();
      const selMonth = this.matrixMonth !== undefined ? this.matrixMonth : now.getMonth();
      const academicYear = this.getAcademicYearLabel(selYear, selMonth);
      const reportClass = this.students.length ? this.students[0].class || 'X DKV F' : 'X DKV F';
      const teacherName = this.teacherProfile.name || 'Wali Kelas';
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'MIPHA Companion RC5';
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Absensi', {
        views: [{ state: 'frozen', y: 6 }]
      });

      sheet.pageSetup = {
        paperSize: 9,
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: { left: 0.3, right: 0.3, top: 0.45, bottom: 0.45, header: 0.2, footer: 0.2 }
      };
      sheet.properties.defaultRowHeight = 20;

      const columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'NIS', key: 'nis', width: 12 },
        { header: 'Nama', key: 'nama', width: 30 }
      ];
      for (let day = 1; day <= 31; day += 1) {
        columns.push({ header: String(day), key: `day${day}`, width: 4.5 });
      }
      columns.push(
        { header: 'Jumlah', key: 'jumlah', width: 10 },
        { header: 'Hadir', key: 'hadir', width: 10 },
        { header: 'Sakit', key: 'sakit', width: 10 },
        { header: 'Izin', key: 'izin', width: 10 },
        { header: 'Alpha', key: 'alpha', width: 10 },
        { header: 'Persentase Kehadiran', key: 'persentase', width: 16 }
      );
      sheet.columns = columns;

      const titleRange = `A1:${sheet.getColumn(columns.length).letter}1`;
      sheet.mergeCells(titleRange);
      sheet.getCell('A1').value = `Absensi Kelas ${reportClass}`;
      sheet.getCell('A1').font = { size: 14, bold: true };
      sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

      const schoolRow = `A2:${sheet.getColumn(columns.length).letter}2`;
      sheet.mergeCells(schoolRow);
      sheet.getCell('A2').value = 'SMK Bhumi Phala Parakan';
      sheet.getCell('A2').font = { size: 12, bold: true };
      sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

      const yearRow = `A3:${sheet.getColumn(columns.length).letter}3`;
      sheet.mergeCells(yearRow);
      sheet.getCell('A3').value = `Tahun Ajaran ${academicYear}`;
      sheet.getCell('A3').font = { size: 12, bold: true };
      sheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

      const teacherRow = `A4:${sheet.getColumn(columns.length).letter}4`;
      sheet.mergeCells(teacherRow);
      sheet.getCell('A4').value = `Guru / Wali Kelas : ${teacherName}`;
      sheet.getCell('A4').font = { size: 11, bold: true };
      sheet.getCell('A4').alignment = { horizontal: 'left', vertical: 'middle' };

      sheet.addRow([]);
      const headerRow = sheet.addRow(columns.map((col) => col.header));
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FF000000' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
        };
      });

      const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      const { matrix, daysInMonth } = this.getMonthMatrix(selYear, selMonth);
      const legendBorder = {
        top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
        left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
        bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
        right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
      };

      const getStyleForStatus = (status, isSchoolDay) => {
        if (!isSchoolDay) {
          return { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }, font: { color: { argb: 'FF374151' } } };
        }
        switch (status) {
          case 'tepat_waktu':
            return { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }, font: { color: { argb: 'FFFFFFFF' }, bold: true } };
          case 'sakit':
            return { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } }, font: { color: { argb: 'FF1F2937' }, bold: true } };
          case 'izin':
            return { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } }, font: { color: { argb: 'FFFFFFFF' }, bold: true } };
          case 'alpha':
            return { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }, font: { color: { argb: 'FFFFFFFF' }, bold: true } };
          default:
            return { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, font: { color: { argb: 'FF000000' } } };
        }
      };

      matrix.forEach((rowData, index) => {
        const rowValues = [index + 1, rowData.student.nis, rowData.student.name];
        for (let dayIndex = 1; dayIndex <= 31; dayIndex += 1) {
          if (dayIndex > rowData.daysInMonth) {
            rowValues.push('');
            continue;
          }
          const dayInfo = rowData.days[dayIndex - 1];
          if (!dayInfo) {
            rowValues.push('');
            continue;
          }
          if (!dayInfo.isSchoolDay) {
            rowValues.push(dayInfo.status === 'weekend' || dayInfo.status === 'future' || dayInfo.status === 'before_start' ? '-' : '');
          } else {
            switch (dayInfo.status) {
              case 'tepat_waktu':
              case 'sakit': rowValues.push('S'); break;
              case 'izin': rowValues.push('I'); break;
              case 'alpha': rowValues.push('A'); break;
              default: rowValues.push('');
            }
          }
        }
        rowValues.push(rowData.schoolDaysTotal);
        rowValues.push(rowData.countH);
        rowValues.push(rowData.countS);
        rowValues.push(rowData.countI);
        rowValues.push(rowData.countA);
        rowValues.push(`${rowData.pct}%`);
        const dataRow = sheet.addRow(rowValues);
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = { horizontal: colNumber <= 3 ? 'left' : 'center', vertical: 'middle' };
          cell.border = legendBorder;
          if (colNumber > 3 && colNumber <= 34) {
            const dayIndex = colNumber - 3;
            if (dayIndex <= rowData.daysInMonth) {
              const dayInfo = rowData.days[dayIndex - 1];
              if (dayInfo && !dayInfo.isSchoolDay) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
                cell.font = { color: { argb: 'FF475569' } };
              }
            }
          }
          if (colNumber >= 4 && colNumber <= 34 && cell.value) {
            const dayIndex = colNumber - 3;
            const dayInfo = dayIndex <= rowData.daysInMonth ? rowData.days[dayIndex - 1] : null;
            if (dayInfo) {
              const style = getStyleForStatus(dayInfo.status, dayInfo.isSchoolDay);
              cell.fill = style.fill;
              cell.font = style.font;
            }
          }
        });
      });

      const legendStart = sheet.lastRow.number + 2;
      const legendCell = sheet.getCell(`A${legendStart}`);
      sheet.mergeCells(`A${legendStart}:${sheet.getColumn(columns.length).letter}${legendStart}`);
      legendCell.value = 'Legend:';
      legendCell.font = { bold: true };
      legendCell.alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.getRow(legendStart).height = 18;

      const footerStart = legendStart + 1;
      const footerCell = sheet.getCell(`A${footerStart}`);
      sheet.mergeCells(`A${footerStart}:${sheet.getColumn(columns.length).letter}${footerStart}`);
      footerCell.value = 'Green = Hadir   Yellow = Sakit   Black = Izin   Red = Alpha';
      footerCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      const generatedStart = footerStart + 1;
      const generatedCell = sheet.getCell(`A${generatedStart}`);
      sheet.mergeCells(`A${generatedStart}:${sheet.getColumn(columns.length).letter}${generatedStart}`);
      generatedCell.value = `Generated by MIPHA Companion RC5   Export Date: ${new Date().toLocaleString('id-ID')}`;
      generatedCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Absensi_${reportClass.replace(/\s+/g, '_')}_${MONTH_NAMES[selMonth]}_${selYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Gagal membuat file XLSX. Pastikan koneksi internet tersedia untuk memuat library ExcelJS.');
    }
  },

  async importSpreadsheet(file) {
    const name = String(file.name || '').toLowerCase();
    if (name.endsWith('.csv') || name.endsWith('.txt')) {
      return this.importCSV(file);
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return this.importXLSX(file);
    }
    throw new Error('Format file tidak didukung. Unggah file .csv, .xlsx, atau .xls.');
  },

  normalizeStudentName(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[`'’]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  findStudentByRawName(rawName) {
    const norm = this.normalizeStudentName(rawName);
    if (!norm) return null;
    // exact normalized match
    for (const s of this.students) {
      if (this.normalizeStudentName(s.name) === norm) return s;
    }

    const tokens = norm.split(' ').filter(Boolean);
    if (!tokens.length) return null;

    // token-overlap scoring (prefer >=2 token matches)
    let best = null;
    let bestScore = 0;
    for (const s of this.students) {
      const sTokens = this.normalizeStudentName(s.name).split(' ').filter(Boolean);
      let score = 0;
      for (const t of tokens) if (sTokens.includes(t)) score += 1;
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    if (bestScore >= 2) return best;

    // fallback: startsWith on full normalized string
    for (const s of this.students) {
      if (this.normalizeStudentName(s.name).startsWith(norm) || norm.startsWith(this.normalizeStudentName(s.name))) return s;
    }

    return null;
  },

  parseWorkbookDate(sheetName, rows) {
    const monthNames = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11,
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8,
      oct: 9, nov: 10, dec: 11
    };
    const normalizedSheet = String(sheetName || '').trim();
    const match = normalizedSheet.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
    const currentYear = this.attendanceDate ? Number(this.attendanceDate.split('-')[0]) : new Date().getFullYear();
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      if (!Number.isNaN(day) && !Number.isNaN(month)) {
        return `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    for (let i = 0; i < Math.min(rows.length, 10); i += 1) {
      const row = rows[i] || [];
      const rowText = row.map((cell) => String(cell || '').trim()).join(' ').toLowerCase();
      let dateMatch = rowText.match(/tanggal\s*[:\-]?\s*(\d{1,2})\s+([a-z]+)\s*(\d{4})?/i);
      if (dateMatch) {
        const day = Number(dateMatch[1]);
        const month = monthNames[dateMatch[2].toLowerCase()];
        const year = dateMatch[3] ? Number(dateMatch[3]) : currentYear;
        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
          return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
      dateMatch = rowText.match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/);
      if (dateMatch) {
        const day = Number(dateMatch[1]);
        const month = Number(dateMatch[2]) - 1;
        let year = Number(dateMatch[3]);
        if (year < 100) year += 2000;
        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
          return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
    return null;
  },

  loadXLSXLibrary() {
    if (typeof window === 'undefined') return Promise.reject(new Error('No window object'));
    if (typeof window.XLSX !== 'undefined') return Promise.resolve(window.XLSX);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.async = true;
      script.onload = () => { if (window.XLSX) return resolve(window.XLSX); reject(new Error('XLSX loaded but window.XLSX is missing')); };
      script.onerror = (e) => reject(new Error('Failed to load XLSX library'));
      document.head.appendChild(script);
    });
  },

  async importXLSX(file) {
    if (typeof window.XLSX === 'undefined') {
      try {
        await this.loadXLSXLibrary();
      } catch (e) {
        throw new Error('Library XLSX tidak tersedia di lingkungan ini.');
      }
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const studentNisMap = new Map(this.students.map((student) => [String(student.nis), student]));
          const dailyUpdates = {};
          const cloudUpdates = [];

          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) return;
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
            const dateKey = this.parseWorkbookDate(sheetName, rows);
            if (!dateKey) return;
            if (!dailyUpdates[dateKey]) {
              dailyUpdates[dateKey] = { statusByStudent: {}, defaultStatus: null, hasSheet: false };
            }
            dailyUpdates[dateKey].hasSheet = true;

            const isIzinSheet = /izin/i.test(sheetName) || (rows[0] && rows[0].some((cell) => typeof cell === 'string' && /daftar siswa izin/i.test(cell)));
            if (!isIzinSheet && dailyUpdates[dateKey].defaultStatus === null) {
              dailyUpdates[dateKey].defaultStatus = 'tepat_waktu';
            }

            const headerRow = rows.find((row) => Array.isArray(row) && row.some((cell) => typeof cell === 'string' && /nama/i.test(cell)) && row.some((cell) => typeof cell === 'string' && /(keterangan|keterang|ketrangan)/i.test(cell)));
            if (!headerRow) return;
            const nameIndex = headerRow.findIndex((cell) => typeof cell === 'string' && /nama/i.test(cell));
            const remarkIndex = headerRow.findIndex((cell) => typeof cell === 'string' && /(keterangan|keterang|ketrangan)/i.test(cell));
            const headerRowIndex = rows.indexOf(headerRow);

            for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
              const row = rows[rowIndex];
              if (!Array.isArray(row)) continue;
              const rawName = String(row[nameIndex] || '').trim();
              if (!rawName || /^nihil$/i.test(rawName)) continue;
              const student = this.findStudentByRawName(rawName) || studentNisMap.get(rawName);
              if (!student) continue;
              let rawRemark = String(row[remarkIndex] || '').trim();
              if (!rawRemark && row.some((cell) => typeof cell === 'string' && /\b(lo+m|a|alpha|absen|izin|sakit|hadir)\b/i.test(cell))) {
                rawRemark = 'A';
              }
              const status = this.normalizeAttendanceStatus(rawRemark || 'A');
              dailyUpdates[dateKey].statusByStudent[student.id] = status;
            }
          });

          Object.entries(dailyUpdates).forEach(([dateKey, payload]) => {
            if (!payload.hasSheet) return;
            if (payload.defaultStatus) {
              this.students.forEach((student) => {
                if (!this.monthlyAttendance[student.id]) this.monthlyAttendance[student.id] = {};
                this.monthlyAttendance[student.id][dateKey] = payload.defaultStatus;
                if (!this.historicalAttendance[student.id]) this.historicalAttendance[student.id] = {};
                this.historicalAttendance[student.id][dateKey] = payload.defaultStatus;
                cloudUpdates.push({ studentId: student.id, date: dateKey, status: payload.defaultStatus });
              });
            }
            Object.entries(payload.statusByStudent).forEach(([studentId, status]) => {
              if (!this.monthlyAttendance[studentId]) this.monthlyAttendance[studentId] = {};
              this.monthlyAttendance[studentId][dateKey] = status;
              if (!this.historicalAttendance[studentId]) this.historicalAttendance[studentId] = {};
              this.historicalAttendance[studentId][dateKey] = status;
              cloudUpdates.push({ studentId, date: dateKey, status });
            });
          });

          if (!cloudUpdates.length) throw new Error('Tidak ada data absensi yang berhasil dibaca dari file.');
          if (!window.SupabaseBackend || !SupabaseBackend.auth.currentUser) {
            throw new Error('Login Supabase diperlukan untuk menyimpan hasil impor.');
          }
          await SupabaseBackend.writeImportedAttendanceRecords(cloudUpdates, this.students);
          localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
          localStorage.setItem('dkvf_historical_attendance', JSON.stringify(this.historicalAttendance));
          this.saveState();
          this.render();
          resolve();
        } catch (innerError) {
          reject(innerError);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  async loadFixedAttendanceFile() {
    if (typeof fetch === 'undefined') return;
    try {
      const res = await fetch('/fixed_attendance_july_2026.json', { cache: 'no-store' });
      if (!res.ok) return;
      const fixed = await res.json();
      Object.entries(fixed).forEach(([studentId, dates]) => {
        if (!this.monthlyAttendance[studentId]) this.monthlyAttendance[studentId] = {};
        Object.entries(dates).forEach(([dateKey, status]) => {
          this.monthlyAttendance[studentId][dateKey] = status;
        });
      });
      localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
      this.saveState();
      this.render();
      console.info('Fixed attendance applied from fixed_attendance_july_2026.json');
    } catch (e) {
      console.warn('Could not load fixed attendance file:', e);
    }
  },

  async importCSV(file) {
    const text = await file.text();
    const rows = this.parseCSV(text);
    if (!rows.length) throw new Error('CSV kosong');

    const headers = rows[0].map((h) => String(h || '').trim().toLowerCase());
    const nisIndex = headers.indexOf('nis');
    const statusIndex = headers.indexOf('status');
    const checkinIndex = headers.indexOf('jam checkin');
    const campusIndex = headers.indexOf('campus');
    const distanceIndex = headers.indexOf('jarak gps (m)');
    const checkoutIndex = headers.indexOf('check-out');
    const rumahIndex = headers.indexOf('sampai rumah');

    if (nisIndex === -1) {
      throw new Error('Kolom NIS tidak ditemukan di CSV.');
    }

    const dateColumns = headers.reduce((acc, header, index) => {
      const trimmed = String(header || '').trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        acc.push({ index, dateKey: trimmed });
      } else {
        const dayNum = Number(trimmed);
        if (!Number.isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          acc.push({ index, dayNum });
        }
      }
      return acc;
    }, []);

    const { year: importYear, month: importMonth } = this.detectCSVImportMonthYear(headers, rows) || {};
    const todayDate = this.attendanceDate || new Date().toISOString().split('T')[0];
    const todayYear = Number(todayDate.split('-')[0]);
    const todayMonth = Number(todayDate.split('-')[1]);
    const year = typeof importYear === 'number' ? importYear : todayYear;
    const month = typeof importMonth === 'number' ? importMonth : todayMonth;
    let updatedCount = 0;
    const cloudUpdates = [];

    rows.slice(1).forEach((row) => {
      const nis = String(row[nisIndex] || '').trim();
      if (!nis) return;
      const student = this.students.find((s) => String(s.nis) === nis);
      if (!student) return;

      if (dateColumns.length) {
        if (!this.monthlyAttendance[student.id]) this.monthlyAttendance[student.id] = {};
        dateColumns.forEach((col) => {
          const rawValue = String(row[col.index] || '').trim();
          if (!rawValue) return;
          const normalizedValue = this.normalizeAttendanceStatus(rawValue);
          const status = this.monthlyStatusFromAttendance(normalizedValue);
          const dateKey = col.dateKey
            ? col.dateKey
            : `${year}-${String(month + 1).padStart(2, '0')}-${String(col.dayNum).padStart(2, '0')}`;
          this.monthlyAttendance[student.id][dateKey] = status;
          if (!this.historicalAttendance[student.id]) this.historicalAttendance[student.id] = {};
          this.historicalAttendance[student.id][dateKey] = status;
          cloudUpdates.push({ studentId: student.id, date: dateKey, status });
          updatedCount += 1;
        });
      } else {
        const statusRaw = String(row[statusIndex] || '').trim();
        const status = this.normalizeAttendanceStatus(statusRaw);
        const checkinTime = String(row[checkinIndex] || '').trim() || null;
        const campusName = String(row[campusIndex] || '').trim() || null;
        const distanceMeters = Number(String(row[distanceIndex] || '').trim()) || null;
        const checkoutTime = String(row[checkoutIndex] || '').trim() || null;
        const homeConfirmedRaw = String(row[rumahIndex] || '').trim();
        const homeConfirmed = /^(ya|yes|true|1)$/i.test(homeConfirmedRaw);
        const homeArrivalTime = homeConfirmed ? (String(row[rumahIndex] || '').trim() || null) : null;

        this.attendance[student.id] = {
          ...this.attendance[student.id],
          status,
          checkinTime,
          campusName,
          distanceMeters,
          checkoutTime,
          homeConfirmed,
          homeArrivalTime
        };
        updatedCount += 1;
      }
    });

    if (!updatedCount) throw new Error('Tidak ada baris siswa yang berhasil dipetakan.');

    if (cloudUpdates.length) {
      if (!window.SupabaseBackend || !SupabaseBackend.auth.currentUser) {
        throw new Error('Login Supabase diperlukan untuk menyimpan hasil impor.');
      }
      await SupabaseBackend.writeImportedAttendanceRecords(cloudUpdates, this.students);
    }

    localStorage.setItem('dkvf_monthly_attendance', JSON.stringify(this.monthlyAttendance));
    localStorage.setItem('dkvf_historical_attendance', JSON.stringify(this.historicalAttendance));
    this.saveState();
    this.render();
  },

  parseCSV(text) {
    const rows = [];
    let current = '';
    let insideQuotes = false;
    let row = [];

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"';
          i += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
        continue;
      }

      if (char === ',' && !insideQuotes) {
        row.push(current);
        current = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (current !== '' || row.length) {
          row.push(current);
          rows.push(row);
          row = [];
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current !== '' || row.length) {
      row.push(current);
      rows.push(row);
    }

    return rows.filter((r) => r.length > 0);
  },

  detectCSVImportMonthYear(headers, rows) {
    const monthNames = {
      januari: 0, february: 1, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, july: 6, agustus: 7, august: 7, september: 8, oktober: 9,
      october: 9, november: 10, desember: 11, december: 11,
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const normalize = (value) => String(value || '').trim().toLowerCase();
    const scanText = headers.map(normalize).join(' ');
    let match = scanText.match(/(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})/);
    if (match) {
      const month = monthNames[match[1]];
      const year = Number(match[2]);
      if (!Number.isNaN(month) && !Number.isNaN(year)) return { year, month };
    }

    if (rows.length > 1) {
      const firstRowText = rows[1].map(normalize).join(' ');
      match = firstRowText.match(/(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})/);
      if (match) {
        const month = monthNames[match[1]];
        const year = Number(match[2]);
        if (!Number.isNaN(month) && !Number.isNaN(year)) return { year, month };
      }
    }

    return null;
  },

  normalizeAttendanceStatus(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 'belum_checkin';
    if (raw === 'ya' || raw === 'yes' || raw === 'hadir' || raw === 'h' || raw === 'present') return 'tepat_waktu';
    if (raw === 'alpha' || raw === 'a' || raw === 'absen') return 'alpha';
    if (raw === 'sakit' || raw === 's') return 'sakit';
    if (raw === 'izin' || raw === 'i' || raw === 'permission') return 'izin';
    if (raw === 'terlambat' || raw === 'l' || raw === 'late') return 'tepat_waktu';
    if (raw === 'lom' || raw.includes('lom')) return 'izin';
    if (raw.includes('tepat')) return 'tepat_waktu';
    if (raw.includes('terlambat')) return 'tepat_waktu';
    if (raw.includes('sakit')) return 'sakit';
    if (raw.includes('izin')) return 'izin';
    if (raw.includes('belum')) return 'belum_checkin';
    return raw;
  }
};

window.AppState = AppState;

function startApp() {
  try {
    AppState.init();
    try {
      if (window.AttendanceEngine && typeof AttendanceEngine.determineStatus === 'function') {
        const today = new Date().toISOString().split('T')[0];
        const sample = AttendanceEngine.determineStatus({ checkinTime: `${today}T07:06:00`, now: new Date(), config: SCHOOL_CONFIG });
        console.info('AttendanceEngine sample status:', sample);
      }
    } catch (e) { console.warn('AttendanceEngine verification failed:', e); }
  } catch (e) {
    console.error("Init error:", e);
    const appEl = document.getElementById('app-container');
    if (appEl) {
      appEl.innerHTML = `<div style="padding: 2rem; text-align: center; color: red;">Error loading app: ${e.message}. <button onclick="localStorage.clear(); location.reload();">Reset</button></div>`;
    }
  }
}

// Synchronous Instant Bootstrapping
startApp();
