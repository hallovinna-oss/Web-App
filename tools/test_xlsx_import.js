const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const file = path.join('File Rekap Siswa','FORM ALPHA HARIAN JULI FIX (1).xlsx');
if (!fs.existsSync(file)) { console.error('MISSING_FILE', file); process.exit(2); }
const wb = xlsx.readFile(file, { cellDates: true });
console.log('SHEETS:', wb.SheetNames.join(', '));
const students = [
  'Ahmad Azka Al Walid','Ahmad Wardanu','Aiska Yunna Zharifa','Ananda Guruh Setyawan','Ardi Nugroho','Ardina Zilda Agustin','Cendhana Putra Asmoro','Chika Nayda Kynatha Gavarani','Danish Luqmanul Hakim','Diah Ayu Maharani','Divkha Berlian','Elfa Syafina','Fahmi Dirga Al Khafis','Galang Satria Arga','Gilang Ady Febriyan','Ibra Cahyo','Jessieca Olivia','Keisha Ghassani Zulvia','Kola Raya Takbir Wisanggeni','Lintang Cahya Murni','Malika Maulana','Muhamad Lutfi Al Faiz','Muhammad Exel Saputra','Mukti Yusuf Maulana','Naura Dwi Syifana Putri','Nur Ridwan','Nurinnajwaa Rachmatika','Ragil Akbar Alfaridzi','Reval Ananda Lestari','Rizki Eko Setiawan','Setyani Firla Alfiana','Tri Saputri Amalia','Wildan Bagus Faizal Akbar','Yasmin Najwa Maulidda','Zanuba Arifa Hafshoh','Zulfa Dwi Charita'
];
const normalize = s => String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const studentMap = new Map(students.map(s => [normalize(s), s]));
const targets = ['29.07','30.07','31.07','IZIN 29.07','IZIN 30.07','IZIN 31.07'];
for (const name of wb.SheetNames) {
  if (!targets.some(t => new RegExp('^' + t.replace(' ','\\s*') + '$','i').test(name))) continue;
  const sheet = wb.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
  console.log('\nSHEET:', name, 'rows:', rows.length);
  const headerRow = rows.find(r => Array.isArray(r) && r.some(c => typeof c === 'string' && /nama/i.test(c)));
  console.log(' headerRow index:', headerRow ? rows.indexOf(headerRow) : -1);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || [];
    row.forEach(cell => {
      if (!cell || typeof cell !== 'string') return;
      const key = normalize(cell);
      if (studentMap.has(key)) {
        console.log('  found match at row', i+1, '-', cell);
      }
    });
  }
}
console.log('\nDone');
