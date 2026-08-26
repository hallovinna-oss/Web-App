/* MIPHA COMPANION — Supabase bridge (Auth + PostgreSQL Realtime + private file gateway) */
const supabaseUrl = 'https://cyhlrhbjidvjcquveadu.supabase.co';
const supabasePublishableKey = 'sb_publishable_9MyZ4MUylJjcaHTat-7FeQ_rbUJxBI5';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});

const authFacade = {
  currentUser: null,
  onAuthStateChanged(callback) {
    supabaseClient.auth.getSession().then(({ data }) => {
      this.currentUser = SupabaseBackend.wrapUser(data.session?.user, data.session?.access_token);
      callback(this.currentUser);
    });
    const { data } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      this.currentUser = SupabaseBackend.wrapUser(session?.user, session?.access_token);
      callback(this.currentUser);
    });
    return () => data.subscription.unsubscribe();
  },
  async signOut() { await supabaseClient.auth.signOut(); this.currentUser = null; }
};

const SupabaseBackend = {
  auth: authFacade,
  db: supabaseClient,
  channels: [],
  renderQueued: false,
  syncTimer: null,
  fileUrlCache: new Map(),
  attendanceSnapshotReady: false,
  attendanceMigrationStarted: false,

  wrapUser(user, accessToken) {
    if (!user) return null;
    return { ...user, uid: user.id, getIdToken: async () => accessToken || (await supabaseClient.auth.getSession()).data.session?.access_token };
  },

  clean(value) {
    if (Array.isArray(value)) return value.map(item => this.clean(item)).filter(item => item !== undefined);
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, this.clean(item)]));
    }
    return value instanceof Date ? value.toISOString() : value;
  },

  emailFor(username, role) {
    const clean = String(username || '').trim().toLowerCase();
    return role === 'guru' ? 'admin@mipha-companion.local' : `${clean}@mipha-companion.local`;
  },

  passwordFor(username, password, role) {
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');
    return role !== 'guru' && cleanPassword === cleanUsername && /^\d{4}$/.test(cleanUsername) ? `${cleanPassword}00` : cleanPassword;
  },

  normalizeAttendanceStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (['terlambat', 'late', 'l'].includes(normalized)) return 'tepat_waktu';
    return ['tepat_waktu', 'sakit', 'izin', 'alpha'].includes(normalized) ? normalized : null;
  },

  async token() {
    const { data } = await supabaseClient.auth.getSession();
    if (!data.session?.access_token) throw new Error('Login diperlukan.');
    return data.session.access_token;
  },

  scheduleSync(appState) {
    if (!authFacade.currentUser) return;
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.syncState(appState).catch(console.error), 500);
  },

  async callPrivateFunction(path, body, expectBlob = false) {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await this.token()}` }, body: JSON.stringify(body) });
    if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || 'Permintaan gagal.'); }
    return expectBlob ? response.blob() : response.json();
  },

  async uploadFile(file, category, ownerId, metadata = {}) {
    if (!file || file.size <= 0) throw new Error('File tidak valid.');
    if (file.size > 4 * 1024 * 1024) throw new Error('Ukuran file maksimal 4 MB.');
    const allowed = /^(image\/|application\/pdf$|application\/json$|text\/plain$|application\/msword$|application\/vnd\.openxmlformats-officedocument\.)/;
    if (!allowed.test(file.type || '')) throw new Error('Jenis file tidak didukung.');
    const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = () => reject(new Error('File tidak dapat dibaca.')); reader.readAsDataURL(file); });
    return this.callPrivateFunction('/.netlify/functions/storage-upload', { category, ownerId, metadata, name: file.name, type: file.type, size: file.size, data });
  },

  async syncMoncerAttendance(nis, gps) {
    const result = await this.callPrivateFunction('/.netlify/functions/moncer-attendance', { nis: String(nis || ''), method: ['nis','pin'].includes(gps.checkinMethod) ? 'nis' : 'gps', latitude: gps.latitude, longitude: gps.longitude, gpsAccuracy: gps.gpsAccuracy });
    if (result.success !== true || result.verified !== true) throw new Error(result.error || 'Presensi belum terverifikasi di Moncer.');
    return result;
  },

  async downloadFile(path, name) {
    const url = URL.createObjectURL(await this.callPrivateFunction('/.netlify/functions/storage-download', { path }, true));
    const link = document.createElement('a'); link.href = url; link.download = name || 'lampiran'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  },

  async getFileObjectUrl(path) {
    if (this.fileUrlCache.has(path)) return this.fileUrlCache.get(path);
    const url = URL.createObjectURL(await this.callPrivateFunction('/.netlify/functions/storage-download', { path }, true));
    this.fileUrlCache.set(path, url); return url;
  },

  hydrateProtectedImages(root = document) {
    root.querySelectorAll('img[src^="nextcloud:"]').forEach(img => { const path = img.getAttribute('src').slice(10); this.getFileObjectUrl(path).then(url => { img.src = url; }).catch(() => { img.alt = 'Gambar tidak dapat dimuat'; }); });
  },

  requestRender(appState) {
    clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(() => appState.render({ silent: true, preserveUi: true }), 160);
  },

  async login(username, password, role, localStudents) {
    const email = this.emailFor(username, role);
    const realPassword = this.passwordFor(username, password, role);
    let result = await supabaseClient.auth.signInWithPassword({ email, password: realPassword });
    if (result.error) {
      const student = localStudents.find(item => String(item.nis) === String(username));
      const canBootstrap = role === 'siswa' && student && String(password) === String(username);
      if (!canBootstrap || !/invalid login credentials/i.test(result.error.message)) throw result.error;
      result = await supabaseClient.auth.signUp({ email, password: realPassword });
      if (result.error) throw result.error;
      if (!result.data.session) throw new Error('Akun dibuat, tetapi konfirmasi email Supabase masih aktif. Nonaktifkan Confirm email di Authentication → Providers → Email.');
    }
    authFacade.currentUser = this.wrapUser(result.data.user, result.data.session?.access_token);
    const uid = result.data.user.id;
    let { data: profile, error } = await supabaseClient.from('profiles').select('*').eq('uid', uid).maybeSingle();
    if (error) throw error;
    if (!profile) {
      if (role === 'guru') throw new Error('Profil guru Supabase belum diprovisikan.');
      const student = localStudents.find(item => String(item.nis) === String(username));
      const payload = this.clean({ ...student }); delete payload.password; delete payload.pin;
      const created = { uid, student_id: student.id, username: String(student.nis), name: student.name, role: 'siswa', data: payload };
      const insert = await supabaseClient.from('profiles').insert(created).select().single();
      if (insert.error) throw insert.error; profile = insert.data;
    }
    return { ...(profile.data || {}), id: profile.student_id || 'usr_admin', uid, username: profile.username, name: profile.name, role: profile.role };
  },

  async logout() { this.stopListeners(); await authFacade.signOut(); },

  async changeOwnPassword(currentPassword, nextPassword, username = '', role = 'siswa') {
    const verify = await supabaseClient.auth.signInWithPassword({ email: this.emailFor(username, role), password: this.passwordFor(username, currentPassword, role) });
    if (verify.error) throw new Error('Password lama salah.');
    const result = await supabaseClient.auth.updateUser({ password: nextPassword }); if (result.error) throw result.error;
  },

  stopListeners() { this.channels.forEach(channel => supabaseClient.removeChannel(channel)); this.channels = []; },

  ownerFor(collection, data) {
    if (collection === 'students') return data.id || data.studentId || null;
    return data.studentId || data.ownerId || null;
  },

  async upsertRecord(collection, id, data, recordDate = null) {
    const clean = this.clean(data);
    const row = { collection, record_id: String(id), owner_id: this.ownerFor(collection, clean), record_date: recordDate || clean.date || null, data: clean, updated_by: authFacade.currentUser?.uid, updated_at: new Date().toISOString() };
    const result = await supabaseClient.from('app_records').upsert(row, { onConflict: 'collection,record_id' }); if (result.error) throw result.error;
  },

  async seedStudents(students) { await Promise.all(students.map(student => { const clean = this.clean({ ...student }); delete clean.password; delete clean.pin; return this.upsertRecord('students', student.id, clean); })); },

  async syncState(state) {
    if (!authFacade.currentUser || state.currentUser?.role !== 'guru') return;
    const writes = [];
    for (const item of state.leaveRequests || []) writes.push(this.upsertRecord('leaveRequests', item.id, item));
    for (const item of state.announcements || []) writes.push(this.upsertRecord('announcements', item.id, item));
    for (const item of state.assignments || []) writes.push(this.upsertRecord('assignments', item.id, item));
    for (const item of state.homeVisits || []) writes.push(this.upsertRecord('homeVisits', item.id, item));
    writes.push(this.upsertRecord('settings', 'teacherProfile', state.teacherProfile || {}));
    for (const student of state.students || []) { const clean = this.clean({ ...student }); delete clean.password; delete clean.pin; writes.push(this.upsertRecord('students', student.id, clean)); }
    await Promise.allSettled(writes);
  },

  async writeAttendanceRecord(studentId, dateKey, status, student) {
    const validStatus = this.normalizeAttendanceStatus(status); if (!validStatus) throw new Error('Status absensi tidak valid.');
    return this.upsertRecord('attendance', `${dateKey}_${studentId}`, { ...this.clean(student || {}), studentId, date: dateKey, status: validStatus }, dateKey);
  },

  async writeImportedAttendanceRecords(records, students = []) {
    const map = new Map(students.map(item => [item.id, item]));
    const valid = records.filter(item => item.studentId && item.date && this.normalizeAttendanceStatus(item.status));
    await Promise.all(valid.map(item => this.upsertRecord('attendance', `${item.date}_${item.studentId}`, { ...item, status: this.normalizeAttendanceStatus(item.status), studentNis: map.get(item.studentId)?.nis || null, source: 'spreadsheet_import' }, item.date)));
    return valid.length;
  },

  async writeAssignmentSubmission(assignmentId, submission) { return this.upsertRecord('assignmentSubmissions', `${assignmentId}_${submission.studentId}`, { ...submission, assignmentId }); },
  async writeGradeReport(report) { if (!report?.id || !report.studentId) throw new Error('Data nilai belum lengkap.'); return this.upsertRecord('gradeReports', report.id, report); },

  async migrateOfficialAttendanceOnce(appState) {
    if (this.attendanceMigrationStarted || appState.currentUser?.role !== 'guru') return;
    this.attendanceMigrationStarted = true;
    const marker = await supabaseClient.from('app_records').select('record_id').eq('collection','settings').eq('record_id','attendanceMigrationJuly2026').maybeSingle();
    if (marker.data) return;
    const response = await fetch('/fixed_attendance_july_2026.json', { cache: 'no-store' }); if (!response.ok) return;
    const fixed = await response.json(); let created = 0;
    for (const [studentId, dates] of Object.entries(fixed)) for (const [date, rawStatus] of Object.entries(dates || {})) {
      if (appState.historicalAttendance?.[studentId]?.[date]) continue;
      const status = this.normalizeAttendanceStatus(rawStatus); if (!status) continue;
      await this.upsertRecord('attendance', `${date}_${studentId}`, { studentId, date, status, source: 'official_excel_migration' }, date); created++;
    }
    await this.upsertRecord('settings','attendanceMigrationJuly2026',{ completedAt: new Date().toISOString(), recordsCreated: created });
  },

  async loadCollection(collection) {
    const result = await supabaseClient.from('app_records').select('*').eq('collection', collection); if (result.error) throw result.error;
    return result.data.map(row => ({ id: row.record_id, ...(row.data || {}) }));
  },

  async reloadAll(appState) {
    const names = ['attendance','leaveRequests','students','assignments','assignmentSubmissions','gradeReports','homeVisits','announcements','settings'];
    const loaded = Object.fromEntries(await Promise.all(names.map(async name => [name, await this.loadCollection(name)])));
    const historical = {}, today = appState.attendanceDate || new Date().toISOString().slice(0,10), day = {};
    loaded.attendance.forEach(item => { const status = this.normalizeAttendanceStatus(item.status); if (!item.studentId || !item.date || !status) return; (historical[item.studentId] ||= {})[item.date] = status; if (item.date === today) day[item.studentId] = item; });
    appState.historicalAttendance = historical; appState.monthlyAttendance = JSON.parse(JSON.stringify(historical)); appState.attendance = day;
    if (loaded.students.length) appState.students = loaded.students.map(item => ({ ...item, password: item.nis, pin: item.nis }));
    appState.leaveRequests = loaded.leaveRequests; appState.assignments = loaded.assignments; appState.homeVisits = loaded.homeVisits; appState.announcements = loaded.announcements;
    const grouped = {}; loaded.assignmentSubmissions.forEach(item => (grouped[item.assignmentId] ||= []).push(item)); appState.assignments.forEach(item => { item.submissions = grouped[item.id] || []; item.submittedBy = item.submissions.map(x => x.studentId); item.submitted = item.submissions.length; });
    appState.gradeReports = Object.fromEntries(loaded.gradeReports.map(item => [item.id, item]));
    const teacherProfile = loaded.settings.find(item => item.id === 'teacherProfile'); if (teacherProfile) appState.teacherProfile = { ...appState.teacherProfile, ...teacherProfile };
    localStorage.setItem('dkvf_attendance', JSON.stringify(day)); localStorage.setItem('dkvf_historical_attendance', JSON.stringify(historical)); localStorage.setItem('mipha_grade_reports', JSON.stringify(appState.gradeReports));
    const first = !this.attendanceSnapshotReady; this.attendanceSnapshotReady = true; if (first) this.migrateOfficialAttendanceOnce(appState).catch(console.error);
    this.requestRender(appState);
  },

  startListeners(appState) {
    this.stopListeners(); this.attendanceSnapshotReady = false;
    this.reloadAll(appState).catch(error => console.error('Supabase load failed:', error));
    const channel = supabaseClient.channel('mipha-records').on('postgres_changes', { event: '*', schema: 'public', table: 'app_records' }, () => {
      clearTimeout(this.reloadTimer); this.reloadTimer = setTimeout(() => this.reloadAll(appState).catch(console.error), 250);
    }).subscribe();
    this.channels.push(channel);
  }
};

window.SupabaseBackend = SupabaseBackend;
