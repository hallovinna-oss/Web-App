/* Native Android morning schedule and check-in reminders. */
(function () {
  const NOTIFICATION_IDS = [5101, 5102, 5103, 5104, 5105];
  const DAY_TO_WEEKDAY = { Senin: 2, Selasa: 3, Rabu: 4, Kamis: 5, Jumat: 6 };
  let syncing = false;

  function plugin() {
    if (!window.MIPHA_IS_NATIVE || !window.Capacitor || !window.Capacitor.Plugins) return null;
    return window.Capacitor.Plugins.LocalNotifications || null;
  }

  function notificationBody(timetable) {
    const subjects = (timetable.subjects || [])
      .map((subject) => subject.name)
      .filter((name) => name && !/istirahat/i.test(name));
    const subjectText = subjects.join(', ');
    return `${subjectText}. ${timetable.uniform ? `Seragam: ${timetable.uniform}. ` : ''}Setelah tiba di sekolah, jangan lupa lakukan check-in MIPHA.`;
  }

  async function cancelStudentReminders(localNotifications) {
    await localNotifications.cancel({ notifications: NOTIFICATION_IDS.map((id) => ({ id })) });
    localStorage.removeItem('mipha_android_notification_signature');
  }

  async function sync(appState) {
    const localNotifications = plugin();
    if (!localNotifications || syncing || !appState) return;
    syncing = true;
    try {
      if (appState.currentUser?.role !== 'siswa') {
        await cancelStudentReminders(localNotifications);
        return;
      }

      let permission = await localNotifications.checkPermissions();
      if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
        permission = await localNotifications.requestPermissions();
      }
      if (permission.display !== 'granted') {
        console.warn('Android notification permission was not granted.');
        return;
      }

      if (localNotifications.createChannel) {
        await localNotifications.createChannel({
          id: 'mipha-morning-schedule',
          name: 'Jadwal dan Check-in Pagi',
          description: 'Pengingat jadwal pelajaran dan check-in siswa setiap pagi.',
          importance: 4,
          visibility: 1,
          vibration: true
        });
      }

      const timetables = (appState.timetables || []).filter((item) => DAY_TO_WEEKDAY[item.day]);
      const signature = JSON.stringify(timetables.map((item) => ({ day: item.day, uniform: item.uniform, subjects: item.subjects })));
      if (localStorage.getItem('mipha_android_notification_signature') === signature) return;

      await cancelStudentReminders(localNotifications);
      const notifications = timetables.map((timetable, index) => ({
        id: NOTIFICATION_IDS[index],
        title: `📚 Jadwal ${timetable.day} — X DKV F`,
        body: notificationBody(timetable),
        channelId: 'mipha-morning-schedule',
        schedule: {
          on: { weekday: DAY_TO_WEEKDAY[timetable.day], hour: 5, minute: 30 },
          repeats: true
        },
        extra: { view: 'timetable', reminder: 'morning-checkin' }
      }));
      await localNotifications.schedule({ notifications });
      localStorage.setItem('mipha_android_notification_signature', signature);
      console.info('Android morning schedule notifications are active.');
    } catch (error) {
      console.warn('Could not schedule Android notifications:', error);
    } finally {
      syncing = false;
    }
  }

  window.MiphaAndroidNotifications = { sync };
  window.addEventListener('load', () => window.setTimeout(() => sync(window.AppState), 1200));
})();
