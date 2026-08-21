/* MIPHA COMPANION — Firebase bridge (Auth + Firestore, no Storage) */
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

auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(console.error);

const FirebaseBackend = {
  auth,
  db,
  unsubscribers: [],
  renderQueued: false,

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
    const allowed = ['tepat_waktu', 'terlambat', 'sakit', 'izin', 'alpha'];
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
      delete clean.attachmentData;
      writes.push(db.collection('leaveRequests').doc(item.id).set({ ...clean, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }));
    });

    (state.announcements || []).forEach(item => writes.push(db.collection('announcements').doc(item.id).set(item, { merge: true })));
    (state.assignments || []).forEach(item => writes.push(db.collection('assignments').doc(item.id).set(item, { merge: true })));

    (state.homeVisits || []).forEach(item => {
      const clean = this.sanitizeFirestoreValue({ ...item });
      delete clean.photos;
      writes.push(db.collection('homeVisits').doc(item.id).set(clean, { merge: true }));
    });

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
  }
};

if (!window.FirebaseBackend) {
  window.FirebaseBackend = FirebaseBackend;
}
