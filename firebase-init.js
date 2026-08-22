/* MIPHA COMPANION — Firebase bridge (Auth + Firestore + private file gateway) */
const firebaseConfig = {
  apiKey: "AIzaSyCz7C-Vq-l9Q1Vp3F_gFmbznmiLPs1ICPY",
  authDomain: "mipha-companion.firebaseapp.com",
  projectId: "mipha-companion",
  storageBucket: "mipha-companion.firebasestorage.app",
  messagingSenderId: "126709827095",
  appId: "1:126709827095:web:2941aa6f68eb6af2b87e52",
  measurementId: "G-0W9ZBYSD1D"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Keep the real Firebase session aligned with MIPHA's persisted UI session.
// Without LOCAL persistence a newly opened tab can look logged in locally while
// Firebase (required for secure file uploads) has no authenticated user.
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

const FirebaseBackend = {
  auth,
  db,
  unsubscribers: [],
  renderQueued: false,
  syncTimer: null,
  fileUrlCache: new Map(),

  scheduleSync(appState) {
    if (!auth.currentUser) return;
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.syncState(appState).catch(console.error), 500);
  },

  async uploadFile(file, category, ownerId) {
    if (!auth.currentUser) throw new Error('Login diperlukan untuk mengunggah file.');
    if (!file || file.size <= 0) throw new Error('File tidak valid.');
    if (file.size > 4 * 1024 * 1024) throw new Error('Ukuran file maksimal 4 MB.');
    const allowed = /^(image\/|application\/pdf$|text\/plain$|application\/msword$|application\/vnd\.openxmlformats-officedocument\.)/;
    if (!allowed.test(file.type || '')) throw new Error('Jenis file tidak didukung.');
    const token = await auth.currentUser.getIdToken();
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('File tidak dapat dibaca.'));
      reader.readAsDataURL(file);
    });
    const response = await fetch('/.netlify/functions/storage-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ category, ownerId, name: file.name, type: file.type, size: file.size, data })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Penyimpanan file gagal.');
    return result;
  },

  async downloadFile(path, name) {
    if (!auth.currentUser) throw new Error('Login diperlukan untuk membuka file.');
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/.netlify/functions/storage-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ path })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'File tidak dapat dibuka.');
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'lampiran';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  },

  async getFileObjectUrl(path) {
    if (this.fileUrlCache.has(path)) return this.fileUrlCache.get(path);
    if (!auth.currentUser) throw new Error('Login diperlukan untuk membuka file.');
    const token = await auth.currentUser.getIdToken();
    const response = await fetch('/.netlify/functions/storage-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ path })
    });
    if (!response.ok) throw new Error('Gambar tidak dapat dimuat.');
    const url = URL.createObjectURL(await response.blob());
    this.fileUrlCache.set(path, url);
    return url;
  },

  hydrateProtectedImages(root = document) {
    root.querySelectorAll('img[src^="nextcloud:"]').forEach(img => {
      const path = img.getAttribute('src').slice('nextcloud:'.length);
      this.getFileObjectUrl(path).then(url => { img.src = url; }).catch(() => { img.alt = 'Gambar tidak dapat dimuat'; });
    });
  },

  requestRender(appState) {
    if (this.renderQueued) return;
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      appState.render();
    });
  },

  normalizeAttendanceStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'terlambat' || normalized === 'late' || normalized === 'l') return 'tepat_waktu';
    const allowed = ['tepat_waktu', 'sakit', 'izin', 'alpha'];
    return allowed.includes(normalized) ? normalized : null;
  },

  emailFor(username, role) {
    const clean = String(username || '').trim().toLowerCase();
    return role === 'guru'
      ? 'admin@mipha-companion.local'
      : `${clean}@mipha-companion.local`;
  },

  firebasePasswordFor(username, password, role) {
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '');
    if (role === 'guru') return cleanPassword;

    // Students may keep using their 4-digit NIS as the visible first-login password.
    // Firebase itself requires at least 6 characters, so the app transparently pads
    // only the default NIS password before sending it to Firebase.
    return cleanPassword === cleanUsername && /^\d{4}$/.test(cleanUsername)
      ? `${cleanPassword}00`
      : cleanPassword;
  },

  sanitizeFirestoreValue(value) {
    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeFirestoreValue(item)).filter(item => item !== undefined);
    }
    if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof firebase.firestore.Timestamp) && !(value instanceof firebase.firestore.FieldValue)) {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, item]) => item !== undefined)
          .map(([key, item]) => [key, this.sanitizeFirestoreValue(item)])
      );
    }
    return value;
  },

  async login(username, password, role, localStudents) {
    const email = this.emailFor(username, role);
    const firebasePassword = this.firebasePasswordFor(username, password, role);
    let credential;
    try {
      credential = await auth.signInWithEmailAndPassword(email, firebasePassword);
    } catch (error) {
      // Teacher accounts must be provisioned beforehand. Never allow a public
      // client to bootstrap a privileged account from default credentials.
      const canBootstrap = role !== 'guru'
        && localStudents.some(s => String(s.nis) === String(username))
        && String(password) === String(username);
      if (!canBootstrap || !['auth/user-not-found', 'auth/invalid-credential', 'auth/wrong-password'].includes(error.code)) throw error;
      credential = await auth.createUserWithEmailAndPassword(email, firebasePassword);
    }

    const uid = credential.user.uid;
    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    let profile;
    if (!snap.exists) {
      if (role === 'guru') {
        profile = { id: 'usr_admin', uid, username: 'admin', name: 'Gevin Dimas Eka Kusuma, A.Md.', role: 'guru', createdAt: firebase.firestore.FieldValue.serverTimestamp() };
      } else {
        const student = localStudents.find(s => String(s.nis) === String(username));
        if (!student) throw new Error('Student profile not found.');
        profile = this.sanitizeFirestoreValue({ ...student, uid, role: 'siswa', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        delete profile.password;
        delete profile.pin;
      }
      await ref.set(this.sanitizeFirestoreValue(profile), { merge: true });
    } else {
      profile = { ...snap.data(), uid };
    }
    return profile;
  },

  async logout() {
    this.stopListeners();
    await auth.signOut();
  },

  async changeOwnPassword(currentPassword, nextPassword, username = '', role = 'siswa') {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No active Firebase session.');
    const firebaseCurrentPassword = this.firebasePasswordFor(username, currentPassword, role);
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, firebaseCurrentPassword);
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(nextPassword);
  },

  stopListeners() {
    this.unsubscribers.forEach(fn => { try { fn(); } catch (_) {} });
    this.unsubscribers = [];
  },

  async seedStudents(students) {
    const batch = db.batch();
    students.forEach(student => {
      const clean = this.sanitizeFirestoreValue({ ...student });
      delete clean.password;
      delete clean.pin;
      batch.set(db.collection('students').doc(student.id), clean, { merge: true });
    });
    await batch.commit();
  },

  async syncState(state) {
    if (!auth.currentUser) return;
    const writes = [];
    const today = state.attendanceDate || new Date().toISOString().slice(0, 10);

    Object.values(state.attendance || {}).forEach(record => {
      if (!record || !record.studentId) return;
      const validStatus = this.normalizeAttendanceStatus(record.status);
      if (!validStatus) return;
      const clean = this.sanitizeFirestoreValue({ ...record });
      const attendanceDoc = {
        ...clean,
        status: validStatus,
        campusId: clean.campusId || null,
        campusName: clean.campusName || null,
        date: today,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      writes.push(db.collection('attendance').doc(`${today}_${record.studentId}`).set(attendanceDoc, { merge: true }));
    });

    (state.leaveRequests || []).forEach(item => {
      const clean = this.sanitizeFirestoreValue({ ...item });
      writes.push(db.collection('leaveRequests').doc(item.id).set({ ...clean, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }));
    });

    (state.announcements || []).forEach(item => writes.push(db.collection('announcements').doc(item.id).set(item, { merge: true })));
    if (state.currentUser?.role === 'guru') {
      (state.assignments || []).forEach(item => writes.push(db.collection('assignments').doc(item.id).set(item, { merge: true })));
    }

    (state.homeVisits || []).forEach(item => {
      const clean = this.sanitizeFirestoreValue({ ...item });
      writes.push(db.collection('homeVisits').doc(item.id).set(clean, { merge: true }));
    });

    if (state.currentUser?.role === 'guru') {
      writes.push(db.collection('settings').doc('teacherProfile').set(this.sanitizeFirestoreValue(state.teacherProfile || {}), { merge: true }));
    }

    if (state.currentUser?.role === 'guru') {
      (state.students || []).forEach(student => {
        const clean = this.sanitizeFirestoreValue({ ...student });
        delete clean.password;
        delete clean.pin;
        writes.push(db.collection('students').doc(student.id).set(clean, { merge: true }));
      });
    }

    await Promise.allSettled(writes);
  },

  async writeAttendanceRecord(studentId, dateKey, status, student) {
    if (!auth.currentUser) return;
    const validStatus = this.normalizeAttendanceStatus(status);
    if (!validStatus) throw new Error('Attendance status is missing or invalid.');
    const attendanceDoc = this.sanitizeFirestoreValue({
      studentId,
      date: dateKey,
      status: validStatus,
      studentNis: student?.nis || null,
      studentName: student?.name || null,
      campusId: student?.campusId || null,
      campusName: student?.campusName || null,
      latitude: typeof student?.latitude === 'number' ? student.latitude : null,
      longitude: typeof student?.longitude === 'number' ? student.longitude : null,
      gpsAccuracy: typeof student?.gpsAccuracy === 'number' ? student.gpsAccuracy : null,
      gpsTimestamp: student?.gpsTimestamp || null,
      checkinTime: student?.checkinTime || null,
      checkinMethod: student?.checkinMethod || null,
      distanceMeters: student?.distanceMeters || null,
      checkoutTime: student?.checkoutTime || null,
      homeConfirmed: typeof student?.homeConfirmed === 'boolean' ? student.homeConfirmed : null,
      homeArrivalTime: student?.homeArrivalTime || null,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return db.collection('attendance').doc(`${dateKey}_${studentId}`).set(attendanceDoc, { merge: true });
  },

  async writeAssignmentSubmission(assignmentId, submission) {
    if (!auth.currentUser) throw new Error('Login diperlukan.');
    const clean = this.sanitizeFirestoreValue({ ...submission, assignmentId, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    return db.collection('assignmentSubmissions').doc(`${assignmentId}_${submission.studentId}`).set(clean, { merge: true });
  },

  startListeners(appState) {
    this.stopListeners();
    const today = appState.attendanceDate || new Date().toISOString().slice(0, 10);
    const startDate = ACADEMIC_ATTENDANCE_START;
    const endDate = new Date().toISOString().slice(0, 10);

    this.unsubscribers.push(db.collection('attendance')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .onSnapshot(snapshot => {
        const historical = {};
        const dayAttendance = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!data.studentId || !data.date) return;
          if (!historical[data.studentId]) historical[data.studentId] = {};
          const validStatus = this.normalizeAttendanceStatus(data.status);
          if (!validStatus) return;
          historical[data.studentId][data.date] = validStatus;
          if (data.date === today) {
            dayAttendance[data.studentId] = data;
          }
        });
        appState.historicalAttendance = historical;
        // Firestore is authoritative while authenticated. Do not preserve stale
        // local records that are absent from the cloud snapshot.
        appState.attendance = dayAttendance;
        localStorage.setItem('dkvf_attendance', JSON.stringify(dayAttendance));
        localStorage.setItem('dkvf_historical_attendance', JSON.stringify(historical));
        this.requestRender(appState);
      }, console.error));

    this.unsubscribers.push(db.collection('leaveRequests').orderBy('submittedAt', 'desc').onSnapshot(snapshot => {
      appState.leaveRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.requestRender(appState);
    }, error => {
      console.warn('Leave listener fallback:', error.message);
      this.unsubscribers.push(db.collection('leaveRequests').onSnapshot(snapshot => {
        appState.leaveRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.requestRender(appState);
      }));
    }));

    this.unsubscribers.push(db.collection('students').onSnapshot(snapshot => {
      if (snapshot.empty) return;
      const cloudStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      appState.students = cloudStudents.map(s => ({ ...s, password: s.password || s.nis, pin: s.pin || s.nis }));
      if (appState.currentUser?.role === 'siswa') {
        const refreshed = appState.students.find(s => s.id === appState.currentUser.id);
        if (refreshed) appState.currentUser = { ...appState.currentUser, ...refreshed };
      }
      this.requestRender(appState);
    }, console.error));

    this.unsubscribers.push(db.collection('assignments').onSnapshot(snapshot => {
      appState.assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.requestRender(appState);
    }, console.error));

    this.unsubscribers.push(db.collection('assignmentSubmissions').onSnapshot(snapshot => {
      const grouped = {};
      snapshot.docs.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        if (!item.assignmentId) return;
        if (!grouped[item.assignmentId]) grouped[item.assignmentId] = [];
        grouped[item.assignmentId].push(item);
      });
      appState.assignments.forEach(assignment => {
        assignment.submissions = grouped[assignment.id] || [];
        assignment.submittedBy = assignment.submissions.map(item => item.studentId);
        assignment.submitted = assignment.submissions.length;
      });
      this.requestRender(appState);
    }, console.error));

    this.unsubscribers.push(db.collection('homeVisits').onSnapshot(snapshot => {
      appState.homeVisits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.requestRender(appState);
    }, console.error));

    this.unsubscribers.push(db.collection('announcements').onSnapshot(snapshot => {
      appState.announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.requestRender(appState);
    }, console.error));

    this.unsubscribers.push(db.collection('settings').doc('teacherProfile').onSnapshot(snapshot => {
      if (snapshot.exists) appState.teacherProfile = { ...appState.teacherProfile, ...snapshot.data() };
      this.requestRender(appState);
    }, console.error));
  }
};

if (!window.FirebaseBackend) {
  window.FirebaseBackend = FirebaseBackend;
}
