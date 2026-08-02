const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const file = path.join(__dirname, '..', 'File Rekap Siswa', 'FORM ALPHA HARIAN JULI FIX (1).xlsx');
if (!fs.existsSync(file)) {
  console.error('MISSING_FILE', file);
  process.exit(2);
}

const students = [
  'Ahmad Azka Al Walid','Ahmad Wardanu','Aiska Yunna Zharifa','Ananda Guruh Setyawan','Ardi Nugroho','Ardina Zilda Agustin','Cendhana Putra Asmoro','Chika Nayda Kynatha Gavarani','Danish Luqmanul Hakim','Diah Ayu Maharani','Divkha Berlian','Elfa Syafina','Fahmi Dirga Al Khafis','Galang Satria Arga','Gilang Ady Febriyan','Ibra Cahyo','Jessieca Olivia','Keisha Ghassani Zulvia','Kola Raya Takbir Wisanggeni','Lintang Cahya Murni','Malika Maulana','Muhamad Lutfi Al Faiz','Muhammad Exel Saputra','Mukti Yusuf Maulana','Naura Dwi Syifana Putri','Nur Ridwan','Nurinnajwaa Rachmatika','Ragil Akbar Alfaridzi','Reval Ananda Lestari','Rizki Eko Setiawan','Setyani Firla Alfiana','Tri Saputri Amalia','Wildan Bagus Faizal Akbar','Yasmin Najwa Maulidda','Zanuba Arifa Hafshoh','Zulfa Dwi Charita'
];

function normalizeName(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function normalizeStatus(raw) {
  const r = String(raw || '').trim().toLowerCase();
  if (!r) return 'belum_checkin';
  if (['ya','yes','hadir','h','present','tepat_waktu','hadir'].includes(r)) return 'tepat_waktu';
  if (['alpha','a','absen'].includes(r)) return 'alpha';
  if (['sakit','s'].includes(r)) return 'sakit';
  if (['izin','i','permission'].includes(r) || r.includes('lom')) return 'izin';
  if (['terlambat','l','late'].includes(r) || r.includes('terlambat')) return 'terlambat';
  if (r.includes('sakit')) return 'sakit';
  if (r.includes('izin')) return 'izin';
  return r;
}

function parseWorkbookDate(sheetName, rows) {
  const monthNames = {
    juli: 6, july: 6
  };
  const m = sheetName.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
  const currentYear = 2026;
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]) - 1;
    return `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i] || [];
    const text = row.map(c => String(c || '')).join(' ').toLowerCase();
    const dm = text.match(/tanggal\s*[:\-]?\s*(\d{1,2})\s+([a-z]+)\s*(\d{4})?/i);
    if (dm) {
      const day = Number(dm[1]);
      const mon = dm[2].toLowerCase();
      const month = monthNames[mon] !== undefined ? monthNames[mon] : (mon === 'juli' ? 6 : null);
      const year = dm[3] ? Number(dm[3]) : currentYear;
      if (month !== null) return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
  }
  return null;
}

const wb = xlsx.readFile(file, { cellDates: true });
const studentNormMap = new Map(students.map((n, idx) => [normalizeName(n), { name: n, idx }]));

const monthlyAttendance = {};
students.forEach((s, idx) => {
  const id = `std_${String(idx + 1).padStart(2, '0')}`;
  monthlyAttendance[id] = {};
});

wb.SheetNames.forEach((sheetName) => {
  if (!/\.07$|07\b|juli|IZIN/i.test(sheetName)) return;
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return;
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
  const dateKey = parseWorkbookDate(sheetName, rows);
  if (!dateKey) return;

  // default: mark all students as hadir (tepat_waktu) for this date
  students.forEach((s, idx) => {
    const id = `std_${String(idx + 1).padStart(2, '0')}`;
    monthlyAttendance[id][dateKey] = 'tepat_waktu';
  });

  // find header row
  const headerRow = rows.find(row => Array.isArray(row) && row.some(c => typeof c === 'string' && /nama/i.test(c)));
  const headerIndex = headerRow ? rows.indexOf(headerRow) : 0;
  const nameIndex = headerRow ? headerRow.findIndex(c => typeof c === 'string' && /nama/i.test(c)) : 1;
  const remarkIndex = headerRow ? headerRow.findIndex(c => typeof c === 'string' && /(keterangan|keterang)/i.test(c)) : 3;

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const rawName = String(row[nameIndex] || '').trim();
    if (!rawName || /^nihil$/i.test(rawName)) continue;
    const norm = normalizeName(rawName);
    const entry = studentNormMap.get(norm);
    if (!entry) {
      // try partial token match
      const tokens = norm.split(' ').filter(Boolean);
      let matchedIdx = null;
      for (let si = 0; si < students.length; si++) {
        const sNorm = normalizeName(students[si]);
        let score = 0;
        tokens.forEach(t => { if (sNorm.includes(t)) score++; });
        if (score >= 2) { matchedIdx = si; break; }
      }
      if (matchedIdx === null) continue;
      const id = `std_${String(matchedIdx + 1).padStart(2, '0')}`;
      const rawRemark = String(row[remarkIndex] || '').trim();
      const status = normalizeStatus(rawRemark || 'A');
      monthlyAttendance[id][dateKey] = status;
    } else {
      const id = `std_${String(entry.idx + 1).padStart(2, '0')}`;
      const rawRemark = String(row[remarkIndex] || '').trim();
      const status = normalizeStatus(rawRemark || 'A');
      monthlyAttendance[id][dateKey] = status;
    }
  }
});

const out = path.join(__dirname, '..', 'fixed_attendance_july_2026.json');
fs.writeFileSync(out, JSON.stringify(monthlyAttendance, null, 2), 'utf8');
console.log('WROTE', out);
