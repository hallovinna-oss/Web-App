/* MIPHA Companion RC4 configuration module
   This file centralizes environment data, campus settings, and the student roster.
   It is intentionally lightweight and loaded before app.js.
*/

window.MIPHA_CONFIG = window.MIPHA_CONFIG || {
  attendanceStart: '2026-07-13',
  school: {
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
  },
  campuses: [
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
  ],
  officialStudentsList: [
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
  ],
  get initialStudents() {
    return this.officialStudentsList.map((student) => ({
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
  }
};
