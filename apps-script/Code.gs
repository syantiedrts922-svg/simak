/**
 * SIMAK — Google Apps Script Backend
 * Universitas Harapan Bangsa — PMB 2025/2026
 *
 * SETUP:
 * 1. Buka script.google.com → New Project → paste kode ini
 * 2. Ganti ID_SPREADSHEET dan ID_FOLDER_DRIVE di bawah
 * 3. Deploy → New Deployment → Web App → Execute as: Me, Access: Anyone
 * 4. Copy URL deploy → paste ke js/main.js (variabel APPS_SCRIPT_URL)
 */

// ===== KONFIGURASI — GANTI SESUAI MILIKMU =====
const CONFIG = {
  SPREADSHEET_ID: 'GANTI_DENGAN_ID_SPREADSHEET_KAMU',
  FOLDER_DRIVE_ID: 'GANTI_DENGAN_ID_FOLDER_DRIVE_UTAMA',
  EMAIL_PENGIRIM:  'pmb@uhb.ac.id',
  NAMA_UNIVERSITAS: 'Universitas Harapan Bangsa',
  SHEET_PENDAFTAR:  'Data Pendaftar',
};

// ===== HANDLE HTTP GET (cek status) =====
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'cekStatus') {
    return handleCekStatus(e.parameter);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'SIMAK API aktif' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== HANDLE HTTP POST (submit pendaftaran) =====
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = prosesFormPendaftaran(data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== PROSES FORM PENDAFTARAN =====
function prosesFormPendaftaran(data) {
  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_PENDAFTAR) || ss.getActiveSheet();

  // Buat header jika sheet masih kosong
  if (sheet.getLastRow() === 0) {
    buatHeader(sheet);
  }

  // Cek duplikat berdasarkan NIK
  const dataSheet = sheet.getDataRange().getValues();
  for (let i = 1; i < dataSheet.length; i++) {
    if (dataSheet[i][2] === data.nik) {
      return { status: 'error', message: 'NIK sudah terdaftar. Gunakan NIK yang berbeda atau hubungi panitia.' };
    }
  }

  // Generate nomor registrasi
  const noUrut  = sheet.getLastRow(); // baris pertama = header
  const noReg   = 'PMB-2025-' + String(noUrut).padStart(4, '0');
  const tglDaftar = new Date();

  // Buat folder Drive untuk pendaftar
  const folderPendaftar = buatFolderPendaftar(data.nama, noReg);
  const linkFolder = folderPendaftar.getUrl();

  // Beri akses ke email pendaftar
  folderPendaftar.addEditor(data.email);

  // Simpan ke Google Sheets
  sheet.appendRow([
    noReg,                    // A: No Registrasi
    tglDaftar,                // B: Tanggal Daftar
    data.nik,                 // C: NIK
    data.nama,                // D: Nama
    data.email,               // E: Email
    data.whatsapp,            // F: WhatsApp
    data.tempatLahir,         // G: Tempat Lahir
    data.tanggalLahir,        // H: Tanggal Lahir
    data.jenisKelamin,        // I: Jenis Kelamin
    data.alamat,              // J: Alamat
    data.namaSekolah,         // K: Asal Sekolah
    data.jurusanSekolah,      // L: Jurusan Sekolah
    data.tahunLulus,          // M: Tahun Lulus
    data.nilaiRaport,         // N: Nilai Raport
    data.nisn,                // O: NISN
    data.prodi1,              // P: Prodi 1
    data.prodi2,              // Q: Prodi 2
    data.jalurMasuk,          // R: Jalur Masuk
    data.prestasi,            // S: Prestasi
    linkFolder,               // T: Link Drive
    'Menunggu Dokumen',       // U: Status
    '',                       // V: Catatan Admin
    '',                       // W: Tanggal Verifikasi
  ]);

  // Kirim email konfirmasi ke pendaftar
  kirimEmailKonfirmasi(data.email, data.nama, noReg, linkFolder, data.prodi1);

  // Kirim notifikasi ke admin
  kirimNotifikasiAdmin(data.nama, noReg, data.prodi1, data.email);

  return {
    status: 'success',
    noRegistrasi: noReg,
    nama: data.nama,
    linkDrive: linkFolder,
    message: 'Pendaftaran berhasil!'
  };
}

// ===== BUAT FOLDER DRIVE PENDAFTAR =====
function buatFolderPendaftar(nama, noReg) {
  const folderUtama   = DriveApp.getFolderById(CONFIG.FOLDER_DRIVE_ID);
  const namaFolder    = noReg + ' - ' + nama;
  const folderBaru    = folderUtama.createFolder(namaFolder);

  // Buat subfolder untuk tiap jenis dokumen
  folderBaru.createFolder('01_KTP_KK');
  folderBaru.createFolder('02_Ijazah_SKL');
  folderBaru.createFolder('03_Rapor_Transkrip');
  folderBaru.createFolder('04_Foto');

  return folderBaru;
}

// ===== EMAIL KONFIRMASI KE PENDAFTAR =====
function kirimEmailKonfirmasi(email, nama, noReg, linkFolder, prodi) {
  const subject = '[SIMAK PMB] Konfirmasi Pendaftaran — ' + noReg;
  const body = `Halo ${nama},

Pendaftaran kamu telah berhasil diterima! Berikut detail pendaftaranmu:

Nomor Registrasi : ${noReg}
Program Studi    : ${prodi}
Status           : Menunggu Dokumen

LANGKAH SELANJUTNYA — Upload dokumen di link berikut:
${linkFolder}

Dokumen yang perlu diupload:
1. KTP / Kartu Keluarga
2. Ijazah atau Surat Keterangan Lulus
3. Rapor SMA (semester 4-5)
4. Foto 3x4 (latar merah/biru)

Batas pendaftaran: 25 Juli 2025
Pengumuman hasil: 5 Agustus 2025

Pantau status: https://USERNAME.github.io/simak/pages/status.html

Jika ada pertanyaan, hubungi kami di pmb@uhb.ac.id

Salam,
Panitia PMB ${CONFIG.NAMA_UNIVERSITAS}`;

  GmailApp.sendEmail(email, subject, body);
}

// ===== NOTIFIKASI ADMIN =====
function kirimNotifikasiAdmin(nama, noReg, prodi, email) {
  const adminEmail = CONFIG.EMAIL_PENGIRIM;
  const subject = '[SIMAK] Pendaftar Baru: ' + noReg + ' — ' + nama;
  const body = `Pendaftar baru masuk:\n\nNama   : ${nama}\nNo Reg : ${noReg}\nProdi  : ${prodi}\nEmail  : ${email}\n\nCek Google Sheets untuk detail lengkap.`;
  GmailApp.sendEmail(adminEmail, subject, body);
}

// ===== CEK STATUS PENDAFTARAN =====
function handleCekStatus(params) {
  const noReg = params.noReg || '';
  const email = params.email || '';

  const ss    = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.SHEET_PENDAFTAR);
  if (!sheet) return jsonResponse({ found: false });

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === noReg || row[4] === email) {
      return jsonResponse({
        found:        true,
        noReg:        row[0],
        tanggalDaftar: Utilities.formatDate(new Date(row[1]), 'Asia/Jakarta', 'd MMM yyyy'),
        nama:         row[3],
        email:        row[4],
        prodi1:       row[15],
        prodi2:       row[16],
        jalurMasuk:   row[17],
        linkDrive:    row[19],
        status:       row[20],
        dokumenLengkap: row[20] === 'Terverifikasi',
        timeline: buildTimeline(row),
      });
    }
  }
  return jsonResponse({ found: false });
}

function buildTimeline(row) {
  const status = row[20];
  return [
    { label: 'Formulir diterima',              waktu: Utilities.formatDate(new Date(row[1]), 'Asia/Jakarta', 'd MMM yyyy, HH.mm'), done: true, active: false },
    { label: 'Folder Drive dibuat & email dikirim', waktu: Utilities.formatDate(new Date(row[1]), 'Asia/Jakarta', 'd MMM yyyy, HH.mm'), done: true, active: false },
    { label: 'Menunggu upload dokumen',         waktu: null, done: status !== 'Menunggu Dokumen', active: status === 'Menunggu Dokumen' },
    { label: 'Verifikasi admin',                waktu: row[22] ? Utilities.formatDate(new Date(row[22]), 'Asia/Jakarta', 'd MMM yyyy') : null, done: status === 'Terverifikasi' || status === 'Ditolak', active: status === 'Dalam Verifikasi' },
    { label: 'Pengumuman hasil seleksi',        waktu: '5 Agustus 2025', done: false, active: false },
  ];
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== BUAT HEADER SPREADSHEET =====
function buatHeader(sheet) {
  const headers = [
    'No Registrasi', 'Tgl Daftar', 'NIK', 'Nama Lengkap', 'Email', 'WhatsApp',
    'Tempat Lahir', 'Tgl Lahir', 'Jenis Kelamin', 'Alamat',
    'Asal Sekolah', 'Jurusan Sekolah', 'Tahun Lulus', 'Nilai Raport', 'NISN',
    'Prodi 1', 'Prodi 2', 'Jalur Masuk', 'Prestasi/Catatan',
    'Link Drive', 'Status', 'Catatan Admin', 'Tgl Verifikasi'
  ];
  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1B3A6B').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setFrozenRows(1);
}

// ===== TRIGGER OTOMATIS DARI GOOGLE FORM (jika pakai Google Form native) =====
// Pasang trigger ini di: Extensions > Apps Script > Triggers > onFormSubmit
function onFormSubmit(e) {
  try {
    const responses = e.namedValues;
    const data = {
      nama:          responses['Nama Lengkap']?.[0] || '',
      nik:           responses['NIK']?.[0] || '',
      email:         responses['Email Aktif']?.[0] || '',
      whatsapp:      responses['Nomor WhatsApp']?.[0] || '',
      tempatLahir:   responses['Tempat Lahir']?.[0] || '',
      tanggalLahir:  responses['Tanggal Lahir']?.[0] || '',
      jenisKelamin:  responses['Jenis Kelamin']?.[0] || '',
      alamat:        responses['Alamat Lengkap']?.[0] || '',
      namaSekolah:   responses['Nama SMA/SMK/MA']?.[0] || '',
      jurusanSekolah:responses['Jurusan']?.[0] || '',
      tahunLulus:    responses['Tahun Lulus']?.[0] || '',
      nilaiRaport:   responses['Nilai Rata-rata Rapor']?.[0] || '',
      nisn:          responses['Nomor NISN']?.[0] || '',
      prodi1:        responses['Pilihan Prodi 1']?.[0] || '',
      prodi2:        responses['Pilihan Prodi 2']?.[0] || '',
      jalurMasuk:    responses['Jalur Masuk']?.[0] || '',
      prestasi:      responses['Informasi Tambahan']?.[0] || '',
    };
    prosesFormPendaftaran(data);
  } catch (err) {
    Logger.log('Error onFormSubmit: ' + err.toString());
  }
}
